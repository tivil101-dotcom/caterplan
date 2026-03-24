/**
 * Generate a human-readable event ID.
 * Format: [letter_code][YYMMDD][4 random uppercase chars]
 * Example: W250705ANSI
 */
export function generateEventId(letterCode: string, date?: Date): string {
  const d = date ?? new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }

  return `${letterCode}${yy}${mm}${dd}${suffix}`;
}
