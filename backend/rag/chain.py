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
You are a helpful assistant. Answer the question based only on the context below.
If the answer is not in the context, say "I don't know based on the provided document."

Context:
{context}

Question:
{question}
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
    retriever = get_retriever(k=3)

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

    Args:
        question: The user's question string

    Returns:
        The LLM's answer as a plain string
    """

    # Build the chain
    chain = build_chain()

    # Run the chain — this triggers retrieval + LLM in one call
    answer = chain.invoke(question)

    return answer
