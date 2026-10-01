// Notify the mounted auth provider only when the server rejects session renewal.
const listeners = new Set<() => void>();
export function onSessionExpired(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function notifySessionExpired() {
  for (const listener of listeners) listener();
}
