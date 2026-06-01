from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.db.session import Base

class PatchTask(Base):
    __tablename__ = "patch_tasks"

    id = Column(Integer, primary_key=True, index=True)
    target_host = Column(String, index=True)
    patch_type = Column(String) # 'Windows Update', 'Winget', 'PowerShell'
    payload = Column(String)    # KB number, package name, or script path
    status = Column(String, default="Pending") # Pending, Running, Success, Failed, Reboot Pending
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    output_log = Column(String, nullable=True)
