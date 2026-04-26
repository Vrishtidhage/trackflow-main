from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

# App modules
from app.config import get_settings
from app.database import init_db
from app.database import SessionLocal
from app.models import User, Bug

# Routers (existing)
from app.routers import bugs, users, comments, auth, project, admin

# New routes
from app.routes import code_execution
from app.routes import dashboard

# Exception handlers
from app.utils.exceptions import http_exception_handler, validation_exception_handler
from app.utils.auth import ensure_admin_user

# Load settings
settings = get_settings()

# ✅ CREATE APP FIRST (VERY IMPORTANT)
app = FastAPI(
    title=settings.app_name,
    description=settings.app_description,
)

# ✅ Root endpoint
@app.get("/")
def root():
    return {"message": "Server is running"}

# ✅ Initialize database
init_db()
db = SessionLocal()
try:
    ensure_admin_user(db)
finally:
    db.close()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^(http://(localhost|127\.0\.0\.1):\d+|https://[a-zA-Z0-9-]+\.onrender\.com)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)

# ✅ Existing routers
app.include_router(bugs.router)
app.include_router(users.router)
app.include_router(comments.router)
app.include_router(auth.router)
app.include_router(project.router)
app.include_router(admin.router)

# ✅ NEW FEATURES ROUTES
app.include_router(code_execution.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
