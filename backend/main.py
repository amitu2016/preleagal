import json
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal

import aiosqlite
from dotenv import load_dotenv
from openai import AsyncOpenAI
from fastapi import Cookie, Depends, FastAPI, HTTPException, Response, status
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, EmailStr

from auth import create_access_token, decode_token, hash_password, verify_password
from database import get_db, init_db

load_dotenv()

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")

_ai = AsyncOpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
    default_headers={"HTTP-Referer": "https://prelegal.app", "X-Title": "Prelegal"},
)

STATIC_DIR = Path(__file__).parent / "static"
TEMPLATES_DIR = Path(__file__).parent.parent / "templates"

_TEMPLATE_FILES: dict[str, str] = {
    "mutual-nda": "Mutual-NDA.md",
    "csa": "CSA.md",
    "design-partner": "design-partner-agreement.md",
    "sla": "sla.md",
    "psa": "psa.md",
    "dpa": "DPA.md",
    "software-license": "Software-License-Agreement.md",
    "partnership": "Partnership-Agreement.md",
    "pilot": "Pilot-Agreement.md",
    "baa": "BAA.md",
    "ai-addendum": "AI-Addendum.md",
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(lifespan=lifespan)


# ── Pydantic models ────────────────────────────────────────────────────────────

class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class SigninRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str


# ── Auth routes ────────────────────────────────────────────────────────────────

@app.post("/api/auth/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest, response: Response, db=Depends(get_db)):
    try:
        async with db.execute(
            "INSERT INTO users (email, hashed_password) VALUES (?, ?) RETURNING id, email",
            (body.email, hash_password(body.password)),
        ) as cursor:
            row = await cursor.fetchone()
        await db.commit()
    except aiosqlite.IntegrityError:
        raise HTTPException(status_code=400, detail="Email already registered")

    token = create_access_token(row["id"], row["email"])
    response.set_cookie("access_token", token, httponly=True, samesite="lax", max_age=86400)
    return {"id": row["id"], "email": row["email"]}


@app.post("/api/auth/signin", response_model=UserResponse)
async def signin(body: SigninRequest, response: Response, db=Depends(get_db)):
    async with db.execute(
        "SELECT id, email, hashed_password FROM users WHERE email = ?", (body.email,)
    ) as cursor:
        row = await cursor.fetchone()

    if not row or not verify_password(body.password, row["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(row["id"], row["email"])
    response.set_cookie("access_token", token, httponly=True, samesite="lax", max_age=86400)
    return {"id": row["id"], "email": row["email"]}


@app.post("/api/auth/signout")
async def signout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Signed out"}


@app.get("/api/auth/me", response_model=UserResponse)
async def me(access_token: str | None = Cookie(default=None), db=Depends(get_db)):
    if not access_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_token(access_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    async with db.execute(
        "SELECT id, email FROM users WHERE id = ?", (int(payload["sub"]),)
    ) as cursor:
        row = await cursor.fetchone()

    if not row:
        raise HTTPException(status_code=401, detail="User not found")
    return {"id": row["id"], "email": row["email"]}


@app.get("/api/health")
async def health():
    return {"status": "ok"}


# ── AI Chat ────────────────────────────────────────────────────────────────────

_NDA_SYSTEM_PROMPT = """You are a legal assistant helping users create a Mutual Non-Disclosure Agreement (NDA).

Engage in friendly conversation to gather the following information:
- Two parties: for each, their company name, authorized signer's name, title, and notice address (email or postal)
- Purpose: how will confidential information be used?
- Effective date: when does the NDA start? (default today if not specified)
- MNDA term: how long does the NDA last? ("fixed" number of years, or "until-terminated")
- Confidentiality term: how long is information kept confidential? ("fixed" years, or "perpetuity")
- Governing law: which US state's law governs?
- Jurisdiction: which city/county and state for court disputes?
- Modifications: any modifications to standard terms? (optional)

Ask one or two questions at a time. If the user has already provided some information, acknowledge it and continue from there. Always end your message with a follow-up question if you still need more information.

You MUST respond ONLY with valid JSON in this exact format:
{
  "message": "your conversational reply",
  "fields": {
    "purpose": null or string,
    "effectiveDate": null or "YYYY-MM-DD",
    "mndaTermType": null or "fixed" or "until-terminated",
    "mndaTermYears": null or integer,
    "confidentialityTermType": null or "fixed" or "perpetuity",
    "confidentialityTermYears": null or integer,
    "governingLaw": null or string,
    "jurisdiction": null or string,
    "modifications": null or string,
    "party1": null or {"company": null or string, "signerName": null or string, "title": null or string, "noticeAddress": null or string},
    "party2": null or {"company": null or string, "signerName": null or string, "title": null or string, "noticeAddress": null or string}
  }
}

Only include confirmed information in "fields". Use null for anything not yet known."""

# Keep alias for the legacy /api/chat/nda endpoint
_SYSTEM_PROMPT = _NDA_SYSTEM_PROMPT

_DETECT_PROMPT = """You are a helpful legal assistant. Your job is to identify what legal document the user needs.

You can help create these documents:
- mutual-nda: Mutual Non-Disclosure Agreement
- csa: Cloud Service Agreement
- design-partner: Design Partner Agreement
- sla: Service Level Agreement
- psa: Professional Services Agreement
- dpa: Data Processing Agreement
- software-license: Software License Agreement
- partnership: Partnership Agreement
- pilot: Pilot Agreement
- baa: Business Associate Agreement
- ai-addendum: AI Addendum

Greet the user warmly and ask what document they need. Once the user describes what they want, identify the matching document type. If they ask for something not in the list, explain you can't create that type and suggest the closest match. Always end your message with a follow-up question if you need more information.

You MUST respond ONLY with valid JSON:
{
  "message": "your conversational reply",
  "document_type": null or one of the document slugs listed above
}

Use null for document_type until you are confident about what the user needs."""

def _make_doc_prompt(name: str, p1_label: str, p2_label: str, specific_fields: str, key_terms: str) -> str:
    return f"""You are a legal assistant helping users create a {name}.

Gather these details through friendly conversation:
- {p1_label}: company name, authorized signer name, title, and notice address (email or postal)
- {p2_label}: company name, authorized signer name, title, and notice address
- Effective date: when does this agreement start?
{specific_fields}

Ask one or two questions at a time. If the user has already provided some information, acknowledge it and continue from there. Always end your message with a follow-up question if you still need more information.

You MUST respond ONLY with valid JSON:
{{
  "message": "your conversational reply",
  "fields": {{
    "party1": {{"company": null, "signerName": null, "title": null, "noticeAddress": null}},
    "party2": {{"company": null, "signerName": null, "title": null, "noticeAddress": null}},
    "effectiveDate": null,
    "governingLaw": null,
    "jurisdiction": null,
    "keyTerms": {{{key_terms}}}
  }}
}}

Use null for any field not yet confirmed."""


_DOC_PROMPTS: dict[str, str] = {
    "csa": _make_doc_prompt(
        "Cloud Service Agreement",
        "Provider (vendor)", "Customer",
        "- Service name: what cloud service or SaaS product is being provided?\n- Subscription period: how long is the initial subscription term?\n- Fees: what are the subscription fees?\n- Payment process: automatic payment (credit card) or invoicing?\n- Governing law: which US state's law governs?\n- Jurisdiction: which city/county and state for disputes?",
        '"serviceName": null, "subscriptionPeriod": null, "fees": null, "paymentProcess": null',
    ),
    "design-partner": _make_doc_prompt(
        "Design Partner Agreement",
        "Vendor", "Design Partner",
        "- Product description: what product or service is being developed?\n- Program scope: what does the design partner program involve (feedback, testing, co-development)?\n- Program duration: how long does the design partner engagement last?",
        '"productDescription": null, "programScope": null, "programDuration": null',
    ),
    "sla": _make_doc_prompt(
        "Service Level Agreement",
        "Provider", "Customer",
        "- Uptime target: what uptime percentage is guaranteed (e.g. 99.9%)?\n- Incident response time: how quickly must the provider respond to incidents?\n- Credit percentage: what percentage credit is given for downtime?\n- Measurement period: how is uptime measured (e.g. monthly)?",
        '"uptimeTarget": null, "incidentResponseTime": null, "creditPercentage": null, "measurementPeriod": null',
    ),
    "psa": _make_doc_prompt(
        "Professional Services Agreement",
        "Provider", "Customer",
        "- Service description: what professional services will be provided?\n- Deliverables: what specific outputs or deliverables are expected?\n- Fees: what is the fee structure (hourly, fixed, retainer)?\n- Payment terms: when are payments due?\n- Governing law and jurisdiction",
        '"serviceDescription": null, "deliverables": null, "fees": null, "paymentTerms": null',
    ),
    "dpa": _make_doc_prompt(
        "Data Processing Agreement",
        "Controller (data controller)", "Processor (data processor)",
        "- Types of personal data: what categories of personal data will be processed?\n- Processing purposes: for what purposes will the data be processed?\n- Retention period: how long will personal data be retained?",
        '"dataTypes": null, "processingPurposes": null, "retentionPeriod": null',
    ),
    "software-license": _make_doc_prompt(
        "Software License Agreement",
        "Licensor", "Licensee",
        "- Software name: what software is being licensed?\n- License type: perpetual or subscription? Any restrictions (single user, enterprise, etc.)?\n- Territory: which countries/regions does the license cover?\n- Fees: what is the license fee?\n- Governing law and jurisdiction",
        '"softwareName": null, "licenseType": null, "territory": null, "fees": null',
    ),
    "partnership": _make_doc_prompt(
        "Partnership Agreement",
        "Party 1", "Party 2",
        "- Partnership purpose: what is the goal or scope of this partnership?\n- Revenue share: how will revenues be split between the parties?\n- IP ownership: who owns intellectual property created during the partnership?\n- Term: how long does the partnership last?\n- Governing law and jurisdiction",
        '"partnershipPurpose": null, "revenueShare": null, "ipOwnership": null, "term": null',
    ),
    "pilot": _make_doc_prompt(
        "Pilot Agreement",
        "Vendor", "Customer",
        "- Product/service description: what product or service is being piloted?\n- Pilot duration: how long will the pilot run?\n- Fees: is the pilot paid or free? If paid, what is the fee?\n- Success criteria: what metrics or outcomes define a successful pilot?",
        '"productDescription": null, "pilotDuration": null, "fees": null, "successCriteria": null',
    ),
    "baa": _make_doc_prompt(
        "Business Associate Agreement",
        "Covered Entity", "Business Associate",
        "- Types of PHI: what categories of protected health information will be handled?\n- Permitted uses: for what purposes may the business associate use or disclose PHI?\n- Subcontractor requirements: are there restrictions on subcontractors handling PHI?",
        '"phiTypes": null, "permittedUses": null, "subcontractorRequirements": null',
    ),
    "ai-addendum": _make_doc_prompt(
        "AI Addendum",
        "Provider", "Customer",
        "- AI features: which AI features or services does this addendum cover?\n- Data use for training: may customer data be used to train AI models? Under what conditions?\n- Output accuracy disclaimer: what disclaimers apply to AI-generated outputs?",
        '"aiFeatures": null, "dataUseForTraining": null, "outputAccuracyDisclaimer": null',
    ),
}


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class GenericChatRequest(BaseModel):
    messages: list[ChatMessage]
    document_type: str | None = None


class PartyFields(BaseModel):
    model_config = ConfigDict(extra="ignore")
    company: str | None = None
    signerName: str | None = None
    title: str | None = None
    noticeAddress: str | None = None


class NDAFields(BaseModel):
    model_config = ConfigDict(extra="ignore")
    purpose: str | None = None
    effectiveDate: str | None = None
    mndaTermType: str | None = None
    mndaTermYears: int | None = None
    confidentialityTermType: str | None = None
    confidentialityTermYears: int | None = None
    governingLaw: str | None = None
    jurisdiction: str | None = None
    modifications: str | None = None
    party1: PartyFields | None = None
    party2: PartyFields | None = None


class GenericDocFields(BaseModel):
    model_config = ConfigDict(extra="ignore")
    party1: PartyFields | None = None
    party2: PartyFields | None = None
    effectiveDate: str | None = None
    governingLaw: str | None = None
    jurisdiction: str | None = None
    keyTerms: dict[str, str | None] | None = None


class ChatResponse(BaseModel):
    message: str
    fields: NDAFields


async def _call_ai(system_prompt: str, messages: list[ChatMessage]) -> dict:
    msgs = [{"role": "system", "content": system_prompt}]
    msgs += [{"role": m.role, "content": m.content} for m in messages]
    response = await _ai.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=msgs,
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)


@app.post("/api/chat/nda", response_model=ChatResponse)
async def chat_nda(body: GenericChatRequest):
    try:
        data = await _call_ai(_NDA_SYSTEM_PROMPT, body.messages)
        return ChatResponse(
            message=data.get("message", ""),
            fields=NDAFields(**data.get("fields", {})),
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI service unavailable") from exc


@app.post("/api/chat")
async def chat_generic(body: GenericChatRequest) -> dict:
    try:
        if body.document_type is None:
            data = await _call_ai(_DETECT_PROMPT, body.messages)
            return {
                "message": data.get("message", ""),
                "document_type": data.get("document_type"),
                "fields": None,
            }

        if body.document_type == "mutual-nda":
            data = await _call_ai(_NDA_SYSTEM_PROMPT, body.messages)
            fields = NDAFields(**data.get("fields", {})).model_dump()
            return {
                "message": data.get("message", ""),
                "document_type": "mutual-nda",
                "fields": fields,
            }

        prompt = _DOC_PROMPTS.get(body.document_type)
        if prompt is None:
            raise HTTPException(status_code=400, detail=f"Unknown document type: {body.document_type}")

        data = await _call_ai(prompt, body.messages)
        raw_fields = data.get("fields", {})
        fields = GenericDocFields(
            party1=PartyFields(**raw_fields["party1"]) if raw_fields.get("party1") else None,
            party2=PartyFields(**raw_fields["party2"]) if raw_fields.get("party2") else None,
            effectiveDate=raw_fields.get("effectiveDate"),
            governingLaw=raw_fields.get("governingLaw"),
            jurisdiction=raw_fields.get("jurisdiction"),
            keyTerms=raw_fields.get("keyTerms"),
        )
        return {
            "message": data.get("message", ""),
            "document_type": body.document_type,
            "fields": fields.model_dump(),
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI service unavailable") from exc


# ── Document templates ─────────────────────────────────────────────────────────

@app.get("/api/documents/{doc_type}/template")
async def get_template(doc_type: str) -> dict:
    filename = _TEMPLATE_FILES.get(doc_type)
    if not filename:
        raise HTTPException(status_code=404, detail="Unknown document type")
    path = TEMPLATES_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Template file not found")
    return {"content": path.read_text(encoding="utf-8")}


# ── Serve static Next.js export ────────────────────────────────────────────────

if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
