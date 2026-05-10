from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq
import os

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are PHANTOM AI, a network security assistant.
Analyze network threats, explain alerts, and give actionable advice.
Be concise and technical. Always prioritize security."""

class AIRequest(BaseModel):
    message: str
    context: str = ""

@router.post("/chat")
def chat(req: AIRequest):
    try:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        if req.context:
            messages.append({"role": "user", "content": f"Network context: {req.context}"})
        messages.append({"role": "user", "content": req.message})

        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=messages,
            max_tokens=512,
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-alert")
def analyze_alert(alert: dict):
    prompt = f"""Analyze this network security alert and give a brief explanation and recommended action:
    Type: {alert.get('type')}
    Severity: {alert.get('severity')}
    Source IP: {alert.get('source_ip')}
    Detail: {alert.get('detail')}"""

    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        max_tokens=256,
    )
    return {"analysis": response.choices[0].message.content}
