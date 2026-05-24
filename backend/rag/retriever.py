import os
from dotenv import load_dotenv
from rag.ingestion import load_vectorstore

# Load API key from .env file
load_dotenv()


def get_retriever(k: int = 3):
    """
    Create and return a FAISS retriever.

    FAISS similarity search works by comparing the vector (embedding)
    of the user's question against all stored chunk vectors,
    then returning the closest matches.

    Args:
        k: Number of top results to return (default: 3)
           e.g. k=3 means return the 3 most relevant chunks
    """

    # Load the existing FAISS index from disk
    # (reusing load_vectorstore() from ingestion.py — no duplication)
    vectorstore = load_vectorstore()

    # Convert vectorstore into a retriever interface
    # search_kwargs={"k": k} tells FAISS how many chunks to return
    retriever = vectorstore.as_retriever(search_kwargs={"k": k})

    return retriever


def retrieve_docs(question: str, k: int = 3):
    """
    Search the FAISS index for chunks most relevant to the question.

    Each returned Document object contains:
        - page_content: the actual text of the chunk
        - metadata: source file name, page number, etc.

    Args:
        question: The user's question string
        k: Number of top relevant chunks to retrieve (default: 3)

    Returns:
        List of Document objects matching the question
    """

    # Get the retriever with the specified k value
    retriever = get_retriever(k)

    # Search FAISS index using the question
    # .invoke() embeds the question and finds the closest chunk vectors
    docs = retriever.invoke(question)

    print(f"Retrieved {len(docs)} chunks for question: '{question}'")

    return docs
