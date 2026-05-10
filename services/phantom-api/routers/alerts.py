from fastapi import APIRouter
from pydantic import BaseModel
from database import supabase
from typing import Optional
from datetime import datetime

router = APIRouter()

class Alert(BaseModel):
    type: str        # port_scan | unknown_device | arp_spoof | auth_failure
    severity: str    # low | medium | high | critical
    source_ip: Optional[str] = None
    source_mac: Optional[str] = None
    detail: Optional[str] = None

@router.get("/")
def get_alerts():
    res = supabase.table("alerts").select("*").order("created_at", desc=True).limit(100).execute()
    return res.data

@router.post("/")
def create_alert(alert: Alert):
    data = alert.dict()
    data["created_at"] = datetime.utcnow().isoformat()
    data["resolved"] = False
    res = supabase.table("alerts").insert(data).execute()
    return res.data

@router.patch("/{alert_id}/resolve")
def resolve_alert(alert_id: str):
    res = supabase.table("alerts").update({"resolved": True}).eq("id", alert_id).execute()
    return res.data

@router.get("/summary")
def alert_summary():
    res = supabase.table("alerts").select("severity").eq("resolved", False).execute()
    counts = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    for row in res.data:
        counts[row["severity"]] = counts.get(row["severity"], 0) + 1
    return counts
