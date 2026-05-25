import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnablePassthrough
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


def build_chain():
    """
    Build and return the full RAG chain.

    The chain works in this order:
        1. User question comes in
        2. Retriever searches FAISS for relevant chunks
        3. Chunks are formatted into a single context string
        4. Prompt is filled with context + question
        5. LLM (GPT-4o-mini) generates an answer
        6. Answer is parsed as plain string and returned

    Uses LangChain's LCEL (LangChain Expression Language) with | pipe syntax.
    """

    # Step 1: Load the retriever (searches FAISS index)
    retriever = get_retriever(k=5)

    # Step 2: Define the prompt template
    prompt = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)

    # Step 3: Load the LLM — GPT-4o-mini via OpenAI
    # temperature=0 means deterministic answers (no randomness)
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
        api_key=os.getenv("OPENAI_API_KEY"),
    )

    # Step 4: Build the chain using LCEL pipe syntax
    # RunnablePassthrough() passes the question through unchanged to the prompt
    chain = (
        {
            "context": retriever | format_docs,  # retrieve chunks -> format as string
            "question": RunnablePassthrough(),   # pass question as-is
        }
        | prompt        # fill prompt template with context + question
        | llm           # send filled prompt to GPT-4o-mini
        | StrOutputParser()  # parse LLM response into plain string
    )

    return chain


def ask(question: str) -> str:
    """
    Run the full RAG pipeline for a given question.
    Includes debug logging to verify retrieval and context quality.
    """

    # Step 1: Check retriever directly before running chain
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
        return "I don't know based on the provided document."

    # Step 2: Build and run the chain with debug context visible
    chain = build_chain()
    answer = chain.invoke(question)

    print(f"\nAnswer: {answer}")
    print(f"{'='*50}\n")

    return answer
