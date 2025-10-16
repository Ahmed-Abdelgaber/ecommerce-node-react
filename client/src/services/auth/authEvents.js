const unauthorizedListeners = new Set();
const tokenListeners = new Set();

export function onUnauthorized(handler) {
  unauthorizedListeners.add(handler);
  return () => unauthorizedListeners.delete(handler);
}

export function onTokenChange(handler) {
  tokenListeners.add(handler);
  return () => tokenListeners.delete(handler);
}

export function notifyUnauthorized(reason) {
  unauthorizedListeners.forEach((handler) => {
    try {
      handler(reason);
    } catch (err) {
      // ignore handler errors
    }
  });
}

export function notifyTokenChange(tokens) {
  tokenListeners.forEach((handler) => {
    try {
      handler(tokens);
    } catch (err) {
      // ignore handler errors
    }
  });
}
