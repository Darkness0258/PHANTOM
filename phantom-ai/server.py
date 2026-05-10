import logging
import asyncio
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from config import HOST, PORT
from context import build_system_prompt
import engine
import memory

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PHANTOM AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins  = ["*"],
    allow_methods  = ["*"],
    allow_headers  = ["*"]
)

# Conversation history (in-memory, per server instance)
conversation_history: list[dict] = []

class ChatRequest(BaseModel):
    message: str

class IngestRequest(BaseModel):
    doc_id: str
    text:   str

@app.get("/health")
async def health():
    return {
        "status":  "ok",
        "service": "phantom-ai",
        "memory_docs": memory.count()
    }

@app.post("/chat")
async def chat(req: ChatRequest):
    """Stream AI response token by token."""

    system = await build_system_prompt()

    # Search memory for relevant context
    related = memory.search(req.message)
    if related:
        context = "\n".join(related)
        system += f"\n\nRELEVANT CONTEXT FROM MEMORY:\n{context}"

    def generate():
        full_response = ""
        for token in engine.stream_response(
            system    = system,
            user_msg  = req.message,
            history   = conversation_history
        ):
            full_response += token
            yield token

        # Store in history
        conversation_history.append(
            {"role": "user",      "content": req.message}
        )
        conversation_history.append(
            {"role": "assistant", "content": full_response}
        )

        # Keep last 20 turns only
        if len(conversation_history) > 40:
            conversation_history.pop(0)
            conversation_history.pop(0)

    return StreamingResponse(generate(), media_type="text/plain")

@app.post("/ingest")
async def ingest(req: IngestRequest):
    """Store a document in vector memory."""
    memory.store(req.doc_id, req.text)
    return {"status": "ok", "doc_id": req.doc_id}

@app.delete("/memory")
async def clear_memory():
    """Clear all conversation history."""
    conversation_history.clear()
    return {"status": "cleared"}

if __name__ == "__main__":
    logger.info(f"PHANTOM AI starting on {HOST}:{PORT}")
    uvicorn.run(app, host=HOST, port=PORT)