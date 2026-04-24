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
from pydantic import BaseModel, EmailStr

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

_SYSTEM_PROMPT = """You are a legal assistant helping users create a Mutual Non-Disclosure Agreement (NDA).

Engage in friendly conversation to gather the following information:
- Two parties: for each, their company name, authorized signer's name, title, and notice address (email or postal)
- Purpose: how will confidential information be used?
- Effective date: when does the NDA start? (default today if not specified)
- MNDA term: how long does the NDA last? ("fixed" number of years, or "until-terminated")
- Confidentiality term: how long is information kept confidential? ("fixed" years, or "perpetuity")
- Governing law: which US state's law governs?
- Jurisdiction: which city/county and state for court disputes?
- Modifications: any modifications to standard terms? (optional)

Ask questions naturally. Don't ask everything at once. Start by asking what companies are involved.

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


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


class PartyFields(BaseModel):
    company: str | None = None
    signerName: str | None = None
    title: str | None = None
    noticeAddress: str | None = None


class NDAFields(BaseModel):
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


class ChatResponse(BaseModel):
    message: str
    fields: NDAFields


@app.post("/api/chat/nda", response_model=ChatResponse)
async def chat_nda(body: ChatRequest):
    messages = [{"role": "system", "content": _SYSTEM_PROMPT}]
    messages += [{"role": m.role, "content": m.content} for m in body.messages]

    try:
        response = await _ai.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=messages,
            response_format={"type": "json_object"},
        )
        data = json.loads(response.choices[0].message.content)
        return ChatResponse(
            message=data.get("message", ""),
            fields=NDAFields(**data.get("fields", {})),
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI service unavailable") from exc


# ── Serve static Next.js export ────────────────────────────────────────────────

if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
