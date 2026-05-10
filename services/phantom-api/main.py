from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, devices, alerts, ai

app = FastAPI(title="PHANTOM API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,    prefix="/auth",    tags=["auth"])
app.include_router(devices.router, prefix="/devices", tags=["devices"])
app.include_router(alerts.router,  prefix="/alerts",  tags=["alerts"])
app.include_router(ai.router,      prefix="/ai",      tags=["ai"])

@app.get("/")
def root():
    return {"status": "PHANTOM API running"}

@app.get("/health")
def health():
    return {"status": "ok"}
