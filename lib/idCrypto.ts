export function encryptId(id: number | string) {
  return btoa(String(id)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decryptId(value: string) {
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const decoded = atob(base64);
    return /^\d+$/.test(decoded) ? decoded : value;
  } catch {
    return value;
  }
}
