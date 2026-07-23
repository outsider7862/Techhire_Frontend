"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadResumeToSignedUrl } from "@/lib/supabaseClient";

type Progress = { total: number; scored: number; failed: number } | null;

export default function UploadWidget({ roleId }: { roleId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<
    "idle" | "uploading" | "processing" | "done" | "error"
  >("idle");
  const [progress, setProgress] = useState<Progress>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setStage("uploading");
    setErrorMsg(null);

    try {
      // 1. Ask Next.js for signed upload URLs — this request only sends
      // filenames, so it stays tiny no matter how many resumes there are.
      const uploadRes = await fetch(
        `/api/roles/${roleId}/candidates/upload`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            files: Array.from(files).map((f) => ({ fileName: f.name })),
          }),
        }
      );

      if (!uploadRes.ok) throw new Error("Failed to prepare upload");
      const { batchId, uploads } = await uploadRes.json();

      // 2. Upload every file directly to Supabase Storage, in limited
      // parallel batches — this traffic never touches the Next.js
      // server, so Vercel's 4.5MB function payload limit never applies,
      // even at 100 files.
      const fileList = Array.from(files);
      const CONCURRENCY = 10;
      let cursor = 0;

      async function worker() {
        while (cursor < fileList.length) {
          const i = cursor++;
          const file = fileList[i];
          const upload = uploads.find(
            (u: { fileName: string }) => u.fileName === file.name
          );
          if (upload) {
            await uploadResumeToSignedUrl(upload.path, upload.token, file);
          }
        }
      }
      await Promise.all(
        Array.from({ length: CONCURRENCY }, () => worker())
      );

      // 3. All bytes are safely in storage now — tell Next.js to kick
      // off FastAPI processing.
      setStage("processing");
      await fetch(`/api/batches/${batchId}`, { method: "POST" });

      // 4. Poll for progress until every candidate is scored or failed.
      const poll = async () => {
        const res = await fetch(`/api/batches/${batchId}`);
        const data = await res.json();
        setProgress({
          total: data.total,
          scored: data.scored,
          failed: data.failed,
        });

        if (data.scored + data.failed >= data.total) {
          setStage("done");
          router.refresh();
        } else {
          setTimeout(poll, 2000);
        }
      };
      poll();
    } catch (err) {
      setStage("error");
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-6">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {stage === "idle" && (
        <button
          onClick={() => inputRef.current?.click()}
          className="text-sm font-medium text-slate-900 underline underline-offset-2"
        >
          Upload resumes (PDF or DOCX, up to 100 at once)
        </button>
      )}

      {(stage === "uploading" || stage === "processing") && (
        <div className="text-sm text-slate-600">
          {stage === "uploading"
            ? "Uploading resumes…"
            : progress
            ? `Scoring candidates… ${progress.scored + progress.failed}/${
                progress.total
              }`
            : "Starting…"}
        </div>
      )}

      {stage === "done" && progress && (
        <div className="text-sm text-slate-600">
          Done — {progress.scored} scored
          {progress.failed > 0 ? `, ${progress.failed} failed to parse` : ""}.
          <button
            onClick={() => {
              setStage("idle");
              setProgress(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="ml-2 font-medium text-slate-900 underline underline-offset-2"
          >
            Upload more
          </button>
        </div>
      )}

      {stage === "error" && (
        <div className="text-sm text-red-600">
          {errorMsg}
          <button
            onClick={() => setStage("idle")}
            className="ml-2 font-medium underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
