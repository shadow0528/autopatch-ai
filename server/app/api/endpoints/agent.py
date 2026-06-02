from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.models import agent as models
from app.schemas import agent as schemas
from app.core.security import get_api_key

router = APIRouter()

@router.post("/heartbeat", response_model=schemas.Agent)
def heartbeat(
    *,
    db: Session = Depends(get_db),
    agent_in: schemas.AgentCreate,
    api_key: str = Depends(get_api_key),
) -> Any:
    """
    Agent heartbeat. Registers new agent or updates existing one.
    """
    agent = db.query(models.Agent).filter(models.Agent.hostname == agent_in.hostname).first()
    
    if agent:
        # Update existing agent
        agent.ip_address = agent_in.ip_address
        agent.cpu_utilization = agent_in.cpu_utilization
        agent.memory_utilization = agent_in.memory_utilization
        agent.os_version = agent_in.os_version
        agent.subnet = agent_in.subnet
        agent.agent_version = agent_in.agent_version
        agent.last_seen = datetime.utcnow()
        agent.status = "online"
        
        db.add(agent)
        db.commit()
        db.refresh(agent)
        return agent
    
    # Create new agent
    agent = models.Agent(
        hostname=agent_in.hostname,
        ip_address=agent_in.ip_address,
        cpu_utilization=agent_in.cpu_utilization,
        memory_utilization=agent_in.memory_utilization,
        os_version=agent_in.os_version,
        subnet=agent_in.subnet,
        agent_version=agent_in.agent_version,
        status="online"
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent

@router.get("/", response_model=List[schemas.Agent])
def read_agents(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve agents.
    """
    agents = db.query(models.Agent).offset(skip).limit(limit).all()
    return agents
