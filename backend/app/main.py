from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.migrate import run_sqlite_migrations
from app.seed import seed_if_empty
from app.routers import auth, projects, users, nested


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    run_sqlite_migrations()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(nested.router, prefix="/api")

upload_root = Path(__file__).resolve().parent.parent
app.mount("/files", StaticFiles(directory=str(upload_root)), name="files")


@app.get("/api/health")
def health():
    return {"status": "ok"}
