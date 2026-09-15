import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.output_parser import StrOutputParser
from rag.retriever import get_retriever

# Load API key from .env file
load_dotenv()


# Prompt template — tells the LLM how to answer using the context
# {context} will be filled with retrieved chunks from FAISS
# {question} will be filled with the user's question
PROMPT_TEMPLATE = """
You are a helpful assistant. Use the context below to answer the question as helpfully as possible.
The context may be partial — use what is available and make reasonable inferences.
Only say "I don't know based on the provided document." if the context has absolutely no relevant information.

Context:
{context}

Question:
{question}

Answer:
"""


def format_docs(docs):
    """
    Combine multiple Document chunks into a single string.
    Each chunk's page_content is joined with double newlines.

    This formatted string becomes the {context} in the prompt.
    """
    return "\n\n".join(doc.page_content for doc in docs)


def get_sources(docs) -> list[dict]:
    """
    Build a deduplicated list of {page, snippet} citations from retrieved chunks.

    PyPDFLoader stores the 0-indexed page number in each chunk's metadata,
    so it's converted to a 1-indexed page number for display.
    """
    seen_pages = set()
    sources = []
    for doc in docs:
        page = doc.metadata.get("page")
        if page is None or page in seen_pages:
            continue
        seen_pages.add(page)
        sources.append({
            "page": page + 1,
            "snippet": doc.page_content[:200].strip(),
        })
    return sorted(sources, key=lambda s: s["page"])


def ask(question: str) -> tuple[str, list[dict]]:
    """
    Run the full RAG pipeline for a given question.
    Includes debug logging to verify retrieval and context quality.

    Returns the answer along with the source pages it was drawn from,
    so the caller can show citations instead of an unverifiable answer.
    """

    # Step 1: Retrieve chunks once — reused for both the debug log and the chain below
    retriever = get_retriever(k=5)
    docs = retriever.invoke(question)

    # Debug — print number of retrieved chunks
    print(f"\n{'='*50}")
    print(f"Question: {question}")
    print(f"Retrieved {len(docs)} chunks from FAISS")

    # Debug — print each chunk content so we can verify relevance
    for i, doc in enumerate(docs):
        print(f"\n--- Chunk {i+1} ---")
        print(f"Content: {doc.page_content[:300]}")  # first 300 chars
        print(f"Metadata: {doc.metadata}")

    if not docs:
        print("WARNING: No chunks retrieved — FAISS index may be empty or question too different")
        return "I don't know based on the provided document.", []

    # Step 2: Build the chain but feed it the chunks already retrieved above,
    # instead of letting it search FAISS again for the same question.
    prompt = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
        api_key=os.getenv("OPENAI_API_KEY"),
    )
    chain = prompt | llm | StrOutputParser()
    answer = chain.invoke({"context": format_docs(docs), "question": question})
    sources = get_sources(docs)

    print(f"\nAnswer: {answer}")
    print(f"Sources: {sources}")
    print(f"{'='*50}\n")

    return answer, sources
