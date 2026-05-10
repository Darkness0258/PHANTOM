import os
from dotenv import load_dotenv

load_dotenv()

MODEL_PATH = os.getenv("PHANTOM_MODEL_PATH", "./models/mistral-7b.gguf")
CORE_URL     = os.getenv("PHANTOM_CORE_URL",   "http://localhost:8000")
HOST         = os.getenv("PHANTOM_AI_HOST",    "0.0.0.0")
PORT         = int(os.getenv("PHANTOM_AI_PORT", "8001"))
N_CTX        = int(os.getenv("PHANTOM_N_CTX",  "4096"))
N_THREADS    = int(os.getenv("PHANTOM_THREADS", "4"))
CHROMA_PATH  = os.getenv("PHANTOM_CHROMA_PATH", "./data/chroma")