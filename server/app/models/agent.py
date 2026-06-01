from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func

from app.db.session import Base

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    hostname = Column(String, unique=True, index=True)
    ip_address = Column(String)
    cpu_utilization = Column(Float, default=0.0)
    memory_utilization = Column(Float, default=0.0)
    agent_version = Column(String)
    last_seen = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    status = Column(String, default="online")
