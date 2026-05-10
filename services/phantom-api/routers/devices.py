from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import supabase
from typing import Optional

router = APIRouter()

class Device(BaseModel):
    mac: str
    ip: str
    hostname: Optional[str] = None
    vendor: Optional[str] = None
    trusted: bool = False

@router.get("/")
def get_devices():
    res = supabase.table("devices").select("*").execute()
    return res.data

@router.post("/")
def add_device(device: Device):
    res = supabase.table("devices").upsert(device.dict()).execute()
    return res.data

@router.patch("/{mac}/trust")
def trust_device(mac: str, trusted: bool):
    res = supabase.table("devices").update({"trusted": trusted}).eq("mac", mac).execute()
    return res.data

@router.delete("/{mac}")
def remove_device(mac: str):
    supabase.table("devices").delete().eq("mac", mac).execute()
    return {"message": "Device removed"}
