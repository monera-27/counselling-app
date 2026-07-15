// lib/api.ts
const BASE = process.env.NEXT_PUBLIC_APP_URL ?? '';

export const apiUrl = (path: string) => `${BASE}${path}`;