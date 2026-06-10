export function toIsoString(value?: string): string {
  if (!value) return new Date().toISOString();

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date");
  }

  return parsed.toISOString();
}

export function isoDate(value = new Date()): string {
  return value.toISOString().slice(0, 10);
}

export function addUtcDays(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return isoDate(value);
}

export function dateRangeEnding(endDate: string, days: number): string[] {
  return Array.from({ length: days }, (_, index) => addUtcDays(endDate, index - days + 1));
}
