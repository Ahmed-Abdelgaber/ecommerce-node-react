const listeners = new Set();

export function onAnalyticsEvent(handler) {
  listeners.add(handler);
  return () => listeners.delete(handler);
}

export function trackEvent(name, payload) {
  listeners.forEach((handler) => {
    try {
      handler({ name, payload, timestamp: Date.now() });
    } catch (err) {
      // ignore handler errors
    }
  });
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.info("analytics", name, payload);
  }
}
