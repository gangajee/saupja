"use client";

import { memo, useCallback, useState } from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  fileName: string;
  downloadUrl?: string;
  label?: string;
};

const ImagePreview = memo(function ImagePreview({ src, alt, fileName, downloadUrl, label }: Props) {
  const [enlarged, setEnlarged] = useState(false);

  const open = useCallback(() => setEnlarged(true), []);
  const close = useCallback(() => setEnlarged(false), []);
  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  return (
    <>
      <div
        className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden cursor-zoom-in"
        onClick={open}
      >
        <Image src={src} alt={alt} fill className="object-cover" unoptimized />
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition" />
      </div>

      {enlarged && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={close}
        >
          <div className="relative max-w-4xl w-full" onClick={stopProp}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-sm font-medium">{label || fileName}</p>
              <div className="flex items-center gap-3">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    className="text-xs text-slate-300 hover:text-white transition"
                    onClick={stopProp}
                  >
                    다운로드
                  </a>
                )}
                <button onClick={close} className="text-slate-300 hover:text-white transition text-sm">
                  닫기 ✕
                </button>
              </div>
            </div>
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[80vh] object-contain mx-auto rounded-xl"
            />
          </div>
        </div>
      )}
    </>
  );
});

export default ImagePreview;