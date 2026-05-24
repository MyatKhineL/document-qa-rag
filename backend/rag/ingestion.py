import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

# Load API key from .env file
load_dotenv()

# Path to save/load FAISS index
FAISS_INDEX_PATH = "./faiss_index"


def ingest_document(pdf_path: str):
    """
    Load a PDF, split into chunks, embed, and store in FAISS index.
    """

    # Step 1: Load PDF file
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()

    # Step 2: Split text into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
    )
    chunks = splitter.split_documents(documents)

    # Step 3: Create embeddings using OpenAI text-embedding-3-small
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small",
        api_key=os.getenv("OPENAI_API_KEY"),
    )

    # Step 4: Store chunks in FAISS vector store
    vectorstore = FAISS.from_documents(chunks, embeddings)

    # Step 5: Save FAISS index to disk
    vectorstore.save_local(FAISS_INDEX_PATH)

    print(f"Ingested {len(chunks)} chunks from '{pdf_path}'")
    print(f"FAISS index saved to '{FAISS_INDEX_PATH}'")

    return vectorstore


def load_vectorstore():
    """
    Load existing FAISS index from disk.
    """

    # Create embeddings (needed to load the index)
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small",
        api_key=os.getenv("OPENAI_API_KEY"),
    )

    # Load FAISS index from saved folder
    vectorstore = FAISS.load_local(
        FAISS_INDEX_PATH,
        embeddings,
        allow_dangerous_deserialization=True,
    )

    print(f"FAISS index loaded from '{FAISS_INDEX_PATH}'")

    return vectorstore
