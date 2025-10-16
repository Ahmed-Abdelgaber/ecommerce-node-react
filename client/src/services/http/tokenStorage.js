import { notifyTokenChange } from "../auth/authEvents";

let tokens = {
  accessToken: null,
  refreshToken: null,
};

function normalize(value) {
  return value ?? null;
}

function emit(nextTokens) {
  const snapshot = {
    accessToken: normalize(nextTokens.accessToken),
    refreshToken: normalize(nextTokens.refreshToken),
  };
  tokens = snapshot;
  notifyTokenChange({ ...snapshot });
  return tokens;
}

export function getTokens() {
  return { ...tokens };
}

export function getAccessToken() {
  return tokens.accessToken;
}

export function getRefreshToken() {
  return tokens.refreshToken;
}

export function setTokens(partial = {}) {
  const next = {
    accessToken:
      Object.prototype.hasOwnProperty.call(partial, "accessToken")
        ? normalize(partial.accessToken)
        : tokens.accessToken,
    refreshToken:
      Object.prototype.hasOwnProperty.call(partial, "refreshToken")
        ? normalize(partial.refreshToken)
        : tokens.refreshToken,
  };

  if (next.accessToken === tokens.accessToken && next.refreshToken === tokens.refreshToken) {
    return tokens;
  }

  return emit(next);
}

export function setAccessToken(token) {
  return setTokens({ accessToken: token });
}

export function setRefreshToken(token) {
  return setTokens({ refreshToken: token });
}

export function clearTokens() {
  return setTokens({ accessToken: null, refreshToken: null });
}
