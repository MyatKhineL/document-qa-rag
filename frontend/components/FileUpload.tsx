"use client";

import { useState } from "react";

// FileUpload component — lets the user pick a PDF and upload it to the backend
export default function FileUpload() {
  // Track the selected file
  const [file, setFile] = useState<File | null>(null);

  // Track upload status: idle | uploading | success | error
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  // Store success or error message to show the user
  const [message, setMessage] = useState("");

  // Called when the user picks a file from the file picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];

    // Only accept PDF files
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setStatus("idle");
      setMessage("");
    } else {
      setFile(null);
      setMessage("Please select a valid PDF file.");
      setStatus("error");
    }
  };

  // Called when the user clicks "Upload" button
  const handleUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    setMessage("");

    // Wrap file in FormData to send as multipart/form-data to FastAPI
    const formData = new FormData();
    formData.append("file", file);

    try {
      // POST to FastAPI /upload endpoint
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        // Upload and ingestion succeeded
        setStatus("success");
        setMessage(data.message);
      } else {
        // FastAPI returned an error (e.g. not a PDF)
        setStatus("error");
        setMessage(data.detail || "Upload failed.");
      }
    } catch {
      // Network error — backend not running or unreachable
      setStatus("error");
      setMessage("Cannot connect to backend. Is the server running?");
    }
  };

  return (
    <div className="w-full max-w-md p-6 border rounded-xl shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-4">Upload PDF Document</h2>

      {/* File picker input — accepts PDF only */}
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-600 mb-4
          file:mr-4 file:py-2 file:px-4
          file:rounded-lg file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />

      {/* Show selected file name */}
      {file && (
        <p className="text-sm text-gray-500 mb-4">
          Selected: <span className="font-medium">{file.name}</span>
        </p>
      )}

      {/* Upload button — disabled while uploading or no file selected */}
      <button
        onClick={handleUpload}
        disabled={!file || status === "uploading"}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg
          hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors font-medium"
      >
        {status === "uploading" ? "Uploading..." : "Upload"}
      </button>

      {/* Status message — success or error */}
      {message && (
        <p
          className={`mt-4 text-sm font-medium ${
            status === "success" ? "text-green-600" : "text-red-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
