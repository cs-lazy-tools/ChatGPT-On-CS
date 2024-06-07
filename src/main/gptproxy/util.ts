export const castToError = (err: any): Error => {
  if (err instanceof Error) return err;
  return new Error(err);
};

export function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
