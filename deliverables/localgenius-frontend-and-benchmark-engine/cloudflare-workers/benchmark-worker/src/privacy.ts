export async function pseudonymize(id: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(id + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function getWeeklySalt(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const week = Math.floor(
    (now.getTime() - new Date(year, 0, 1).getTime()) / 604800000
  );
  return `spark-salt-${year}-${week}`;
}
