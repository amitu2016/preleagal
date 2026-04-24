from contextlib import asynccontextmanager
from pathlib import Path

import aiosqlite
from fastapi import Cookie, Depends, FastAPI, HTTPException, Response, status
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr

from auth import create_access_token, decode_token, hash_password, verify_password
from database import get_db, init_db

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


# ── Serve static Next.js export ────────────────────────────────────────────────

if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
