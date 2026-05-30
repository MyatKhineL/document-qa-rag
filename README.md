# document-qa-rag

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)
![LangChain](https://img.shields.io/badge/LangChain-0.1-orange)
![Next.js](https://img.shields.io/badge/Next.js-14-black)

A production-ready RAG (Retrieval-Augmented Generation) system that allows users to upload PDF documents and ask questions in natural language. Answers are returned with source citations and page references in real time.

---

## System Flow

```mermaid
graph LR
    A[PDF Upload] --> B[Chunking] --> C[Embedding] --> D[(FAISS Store)]
    E[User Question] --> F[Embed Query] --> G[Similarity Search]
    G -->|top-k chunks| H[LLM Generate] --> I[Answer + Source]
    G -.->|search| D
```

## Architecture

```mermaid
graph TD
    subgraph Frontend["Frontend (Next.js 14)"]
        UI[page.tsx]
        FU[FileUpload.tsx]
        CB[ChatBox.tsx]
        LC[LocaleContext\nEN / JP]
        UI --> FU
        UI --> CB
        UI --> LC
    end

    subgraph Backend["Backend (FastAPI)"]
        API[main.py]
        ING[ingestion.py\nPyPDFLoader → Chunker → Embedder]
        RET[retriever.py\nFAISS Similarity Search]
        CHN[chain.py\nPrompt → GPT-4o-mini]
        API --> ING
        API --> CHN
        CHN --> RET
    end

    subgraph Storage["Local Storage"]
        FAISS[(faiss_index/\nvector store)]
    end

    subgraph OpenAI["OpenAI API"]
        EMB[text-embedding-3-small]
        LLM[gpt-4o-mini]
    end

    FU -->|"POST /upload\n(PDF)"| API
    CB -->|"POST /ask\n(question)"| API

    ING -->|embed chunks| EMB
    ING -->|save index| FAISS
    RET -->|load + search| FAISS
    RET -->|embed query| EMB
    CHN -->|generate answer| LLM
```

## Demo

![Demo](./assets/demo.gif)

## Features

- PDF upload and automatic indexing
- Semantic search using FAISS vector store
- Streaming responses with real-time output
- Source citations with page number references
- Conversation history per session
- Japanese PDF document support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Backend | FastAPI |
| RAG Pipeline | LangChain + FAISS |
| LLM | OpenAI GPT-4o-mini |
| Embeddings | OpenAI text-embedding-3-small |

---

## Project Structure

```
document-qa-rag/
├── frontend/
│   ├── app/
│   │   └── page.tsx
│   └── components/
│       ├── ChatBox.tsx
│       └── FileUpload.tsx
├── backend/
│   ├── main.py
│   ├── rag/
│   │   ├── ingestion.py
│   │   ├── retriever.py
│   │   └── chain.py
│   └── requirements.txt
└── README.md
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- OpenAI API Key

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env` file in the `backend` directory:

```
OPENAI_API_KEY=your_openai_api_key
```

---

## Performance

- Retrieval latency: ~150ms average
- Streaming starts within 300ms
- Tested on documents up to 200 pages

---

*Built with LangChain, FastAPI, and Next.js*
