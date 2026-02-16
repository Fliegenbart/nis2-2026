"use client";

import { useRef, useState } from "react";
import { Upload, FileText, Trash2, Loader2 } from "lucide-react";
import type { Evidence } from "@/hooks/use-audit";

interface EvidenceUploadProps {
  questionId: string;
  evidences: Evidence[];
  onUpload: (questionId: string, file: File) => Promise<Evidence | null>;
  onRemove: (evidenceId: string) => Promise<boolean>;
}

export function EvidenceUpload({
  questionId,
  evidences,
  onUpload,
  onRemove,
}: EvidenceUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const questionEvidences = evidences.filter((e) => e.questionId === questionId);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    await onUpload(questionId, file);
    setUploading(false);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleRemove(evidenceId: string) {
    setRemoving(evidenceId);
    await onRemove(evidenceId);
    setRemoving(null);
  }

  return (
    <div className="mt-3">
      {questionEvidences.length > 0 && (
        <div className="mb-2 space-y-1">
          {questionEvidences.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center gap-2 rounded-md bg-slate-800/50 border border-slate-700/30 px-3 py-1.5 text-sm"
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
              <a
                href={ev.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-cyan-400 hover:text-cyan-300"
              >
                {ev.filename}
              </a>
              <button
                onClick={() => handleRemove(ev.id)}
                disabled={removing === ev.id}
                className="shrink-0 text-slate-600 transition hover:text-rose-400 disabled:opacity-50"
              >
                {removing === ev.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 rounded-md border border-dashed border-slate-700/50 px-3 py-1.5 text-xs text-slate-500 transition hover:border-cyan-500/40 hover:text-cyan-400 disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        Nachweis hochladen
      </button>
    </div>
  );
}
