type Callback = () => void;

const listeners = new Set<Callback>();
let emitted = false;

/**
 * Subscribe to session expired events. Returns an unsubscribe function.
 */
export function onSessionExpired(cb: Callback) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/**
 * Emit a session expired event to all subscribers.
 */
export function emitSessionExpired() {
  emitted = true;
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (err) {
      // swallow listener errors
    }
  });
}

/**
 * Consume the emitted flag. Returns true if a session-expired event
 * was emitted before a listener registered. Calling this resets the flag.
 */
export function consumeSessionExpired(): boolean {
  if (emitted) {
    emitted = false;
    return true;
  }
  return false;
}

/**
 * Check whether a session-expired event has been emitted.
 * Unlike `consumeSessionExpired` this does not reset the flag.
 */
export function isSessionExpired(): boolean {
  return emitted;
}

/**
 * Clear the session-expired flag.
 * Call this after successful authentication or token refresh.
 */
export function clearSessionExpired(): void {
  emitted = false;
}

export default {
  onSessionExpired,
  emitSessionExpired,
};
