"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  fileName: string;
};

export default function ImagePreview({ src, alt, fileName }: Props) {
  const [enlarged, setEnlarged] = useState(false);

  return (
    <>
      <div
        className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in border"
        onClick={() => setEnlarged(true)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          unoptimized
        />
        <div className="absolute inset-0 flex items-end justify-end p-2 opacity-0 hover:opacity-100 transition">
          <span className="bg-black/50 text-white text-xs rounded px-2 py-1">
            크게 보기
          </span>
        </div>
      </div>

      {/* 확대 모달 */}
      {enlarged && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setEnlarged(false)}
        >
          <div className="relative max-w-4xl max-h-full w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setEnlarged(false)}
              className="absolute -top-10 right-0 text-white text-sm hover:text-gray-300"
            >
              닫기 ✕
            </button>
            <img
              src={src}
              alt={alt}
              className="max-w-full max-h-[85vh] object-contain mx-auto rounded"
            />
            <p className="text-center text-gray-400 text-xs mt-3">{fileName}</p>
          </div>
        </div>
      )}
    </>
  );
}
