from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from app.db.session import Base

class RebootRequest(Base):
    __tablename__ = "reboot_requests"

    id = Column(Integer, primary_key=True, index=True)
    target = Column(String, index=True) # Hostname or Subnet
    reboot_type = Column(String) # 'Single', 'Batch', 'Subnet'
    status = Column(String, default="Pending Approval") # Pending Approval, Approved, Executing, Completed, Failed
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    approved_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
