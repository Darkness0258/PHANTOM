import chromadb
from config import CHROMA_PATH

client     = chromadb.PersistentClient(path=CHROMA_PATH)
collection = client.get_or_create_collection("phantom_memory")

def store(doc_id: str, text: str, metadata: dict = {}) -> None:
    collection.upsert(
        ids       = [doc_id],
        documents = [text],
        metadatas = [metadata]
    )

def search(query: str, n: int = 3) -> list[str]:
    results = collection.query(
        query_texts = [query],
        n_results   = min(n, collection.count() or 1)
    )
    return results["documents"][0] if results["documents"] else []

def count() -> int:
    return collection.count()