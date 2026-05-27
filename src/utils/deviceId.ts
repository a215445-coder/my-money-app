function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: not cryptographically perfect, but stable enough for device isolation.
  const rand = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
  return `${rand()}-${rand()}-${rand()}-${rand()}`;
}

export function getOrCreateDeviceId(storageKey = 'device_id'): string {
  try {
    const existing = localStorage.getItem(storageKey);
    if (existing && existing.trim()) return existing.trim();
    const id = randomId();
    localStorage.setItem(storageKey, id);
    return id;
  } catch {
    // If storage is blocked, fall back to an in-memory id (session scoped).
    return randomId();
  }
}

