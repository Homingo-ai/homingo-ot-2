import { clsx, type ClassValue } from "clsx";

/**
 * Utility for conditional Tailwind class composition.
 * Use for dynamic/conditional className values.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
