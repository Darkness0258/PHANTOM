import os
from llama_cpp import Llama
from config import MODEL_PATH, N_CTX, N_THREADS
import logging

logger = logging.getLogger(__name__)

_model: Llama | None = None

def load_model() -> Llama:
    global _model
    if _model is not None:
        return _model

    if not os.path.exists(MODEL_PATH):
        logger.warning(f"Model not found at {MODEL_PATH}")
        logger.warning("Download a GGUF model and place it at the path above")
        raise FileNotFoundError(f"Model file missing: {MODEL_PATH}")

    logger.info(f"Loading model from {MODEL_PATH}")
    _model = Llama(
        model_path = MODEL_PATH,
        n_ctx      = N_CTX,
        n_threads  = N_THREADS,
        verbose    = False
    )
    logger.info("Model loaded successfully")
    return _model

def stream_response(system: str, user_msg: str, history: list[dict]):
    model = load_model()

    messages = [{"role": "system", "content": system}]
    messages.extend(history[-6:])  # last 3 turns
    messages.append({"role": "user", "content": user_msg})

    for chunk in model.create_chat_completion(
        messages   = messages,
        stream     = True,
        max_tokens = 512,
        temperature= 0.7
    ):
        delta = chunk["choices"][0]["delta"]
        token = delta.get("content", "")
        if token:
            yield token