import FileUpload from "@/components/FileUpload";
import ChatBox from "@/components/ChatBox";

// Main page — combines FileUpload and ChatBox into one UI
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Page title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Document QA</h1>
          <p className="text-gray-500 mt-2">
            Upload a PDF document and ask questions about it.
          </p>
        </div>

        {/* Step 1 — Upload PDF */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Step 1 — Upload Document
          </h2>
          {/* FileUpload handles PDF selection and sends to /upload endpoint */}
          <FileUpload />
        </section>

        {/* Step 2 — Ask questions */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Step 2 — Ask a Question
          </h2>
          {/* ChatBox sends question to /ask endpoint and shows answer */}
          <ChatBox />
        </section>

      </div>
    </main>
  );
}
