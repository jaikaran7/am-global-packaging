"use client";

import { Paperclip, UploadCloud } from "lucide-react";

type Props = {
  title?: string;
  description?: string;
  attachedNames: string[];
  onFilesSelected: (files: FileList) => void;
  className?: string;
};

export function AttachmentReferenceCard({
  title = "Artwork & references (optional)",
  description = "Upload is coming soon. For now, list file names or add links in the notes above.",
  attachedNames,
  onFilesSelected,
  className = "",
}: Props) {
  return (
    <div
      className={[
        "rounded-xl border border-dashed border-kraft/25 bg-kraft-pale/25",
        "px-5 py-5 transition-colors hover:bg-kraft-pale/40",
        className,
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <span
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white text-kraft ring-1 ring-kraft/20 shadow-sm shadow-kraft/5"
          aria-hidden
        >
          <UploadCloud className="w-5 h-5" strokeWidth={1.75} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-charcoal leading-snug">
            {title}
          </p>
          <p className="text-[11.5px] text-warm-gray mt-1 leading-relaxed">
            {description}
          </p>
          <label className="mt-3 inline-flex items-center gap-2 rounded-full border border-kraft/20 bg-white px-3.5 py-1.5 text-[11px] font-semibold text-forest cursor-pointer transition-colors hover:bg-cream/60 hover:border-kraft/35">
            <input
              type="file"
              multiple
              className="sr-only"
              onChange={(e) => {
                const files = e.target.files;
                if (!files?.length) return;
                onFilesSelected(files);
              }}
            />
            <Paperclip className="w-3.5 h-3.5 text-kraft" aria-hidden />
            <span>Attach files (local only)</span>
          </label>
          {attachedNames.length > 0 && (
            <p className="mt-2.5 text-[11px] text-warm-gray break-words leading-relaxed">
              {attachedNames.join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
