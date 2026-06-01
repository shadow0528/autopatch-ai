from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.endpoints import agent, discovery, vulnerability, patch, reboot, threat
from app.db.session import engine, Base
from app.models import discovered_asset, vulnerability as vuln_model, patch as patch_model, reboot as reboot_model, threat as threat_model

# Create tables in the database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(agent.router, prefix=f"{settings.API_V1_STR}/agents", tags=["agents"])
app.include_router(discovery.router, prefix=f"{settings.API_V1_STR}/discovery", tags=["discovery"])
app.include_router(vulnerability.router, prefix=f"{settings.API_V1_STR}/vulnerabilities", tags=["vulnerabilities"])
app.include_router(patch.router, prefix=f"{settings.API_V1_STR}/patches", tags=["patches"])
app.include_router(reboot.router, prefix=f"{settings.API_V1_STR}/reboots", tags=["reboots"])
app.include_router(threat.router, prefix=f"{settings.API_V1_STR}/threats", tags=["threats"])

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}
