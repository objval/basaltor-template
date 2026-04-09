export function toArray<T>(value: Array<T> | null | undefined): Array<T>;
export function toArray<T>(value: unknown): Array<T>;
export function toArray<T>(value: unknown): Array<T> {
  return Array.isArray(value) ? (value as Array<T>) : [];
}