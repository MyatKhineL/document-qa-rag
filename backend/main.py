import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import shutil
import tempfile
from typing import List

from rag.ingestion import ingest_document
from rag.chain import ask

# Load API key from .env file
load_dotenv()

# Create FastAPI app instance
app = FastAPI(
    title="Document QA API",
    description="Upload a PDF and ask questions about it using RAG",
    version="1.0.0",
)

# Allow the frontend to call this API. Defaults to local dev; set
# FRONTEND_URL (e.g. the deployed Vercel/Render URL) in production.
allowed_origins = ["http://localhost:3000"]
if frontend_url := os.getenv("FRONTEND_URL"):
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request body schema for /ask endpoint
class QuestionRequest(BaseModel):
    question: str


# A single citation: which page the answer drew from, and the matching excerpt
class Source(BaseModel):
    page: int
    snippet: str


# Response body schema for /ask endpoint
class AnswerResponse(BaseModel):
    answer: str
    sources: List[Source]


@app.get("/")
def health_check():
    """
    Health check endpoint.
    Visit http://localhost:8000/ to confirm the server is running.
    """
    return {"status": "ok", "message": "Document QA API is running"}


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a PDF file and ingest it into the FAISS index.

    Steps:
        1. Receive the uploaded PDF file
        2. Save it temporarily to disk
        3. Run ingestion pipeline (load -> chunk -> embed -> save to FAISS)
        4. Delete the temp file after ingestion
    """

    # Only accept PDF files
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # Save uploaded file to a temporary location
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        # Run the ingestion pipeline on the temp file
        ingest_document(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")
    finally:
        # Always delete the temp file after processing
        os.remove(tmp_path)

    return {
        "message": f"'{file.filename}' uploaded and ingested successfully."
    }


@app.post("/ask", response_model=AnswerResponse)
async def ask_question(body: QuestionRequest):
    """
    Ask a question about the uploaded document.

    Steps:
        1. Receive the user's question
        2. Run the RAG chain (retrieve chunks -> build prompt -> LLM answer)
        3. Return the answer as a string
    """

    # Make sure question is not empty
    if not body.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        # Run the full RAG pipeline and get the answer plus its source pages
        answer, sources = ask(body.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get answer: {str(e)}")

    return AnswerResponse(answer=answer, sources=sources)
