import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Junta classes do Tailwind e resolve conflitos (a última vence). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
