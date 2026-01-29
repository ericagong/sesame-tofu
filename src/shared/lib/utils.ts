import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ID 생성
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
