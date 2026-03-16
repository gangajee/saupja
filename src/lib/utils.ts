import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(companyName: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  const prefix = companyName
    .replace(/\s+/g, "")
    .replace(/[^a-zA-Z0-9]/g, "") || "biz";
  return `${prefix}-${random}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatBusinessNumber(num: string): string {
  const clean = num.replace(/\D/g, "");
  if (clean.length !== 10) return num;
  return `${clean.slice(0, 3)}-${clean.slice(3, 5)}-${clean.slice(5)}`;
}
