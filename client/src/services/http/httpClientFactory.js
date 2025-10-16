import axios from "axios";
import { getApiBaseUrl } from "../../config/env";
import {
  getAccessToken,
  setTokens,
  clearTokens,
} from "./tokenStorage";
import { notifyUnauthorized } from "../auth/authEvents";

const ACCESS_RESPONSE_HEADER = "x-access-token";
const REFRESH_ENDPOINT = "/auth/refresh";
const refreshClients = new Map();
const refreshPromises = new Map();

function getRefreshClient(baseURL) {
  if (!refreshClients.has(baseURL)) {
    refreshClients.set(
      baseURL,
      axios.create({
        baseURL,
        withCredentials: true,
        headers: {
          Accept: "application/json",
        },
      }),
    );
  }
  return refreshClients.get(baseURL);
}

function rememberTokenFromResponse(response) {
  const header = response?.headers?.[ACCESS_RESPONSE_HEADER];
  if (header) {
    setTokens({ accessToken: header });
  }
}

async function refreshAccessToken(baseURL) {
  if (!refreshPromises.has(baseURL)) {
    const client = getRefreshClient(baseURL);
    const attempt = client
      .post(REFRESH_ENDPOINT)
      .then((response) => {
        rememberTokenFromResponse(response);
        return response?.headers?.[ACCESS_RESPONSE_HEADER] ?? null;
      })
      .catch((error) => {
        clearTokens();
        throw error;
      })
      .finally(() => {
        refreshPromises.delete(baseURL);
      });
    refreshPromises.set(baseURL, attempt);
  }
  return refreshPromises.get(baseURL);
}

function shouldSkipRefresh(error) {
  const { response, config } = error ?? {};
  if (!response || !config) return true;
  if (response.status !== 401) return true;
  if (config.__isRetryRequest) return true;
  if (config.skipAuthRefresh) return true;
  if (config.url && config.url.includes(REFRESH_ENDPOINT)) return true;
  return false;
}

function ensureHeaders(config) {
  if (!config.headers) config.headers = {};
  return config.headers;
}

export function createApiClient({
  baseURL = getApiBaseUrl(),
  feature,
  axiosConfig = {},
} = {}) {
  const { headers: customHeaders = {}, ...restConfig } = axiosConfig;

  const instance = axios.create({
    baseURL,
    withCredentials: true,
    responseType: "json",
    ...restConfig,
    headers: {
      Accept: "application/json",
      ...(feature ? { "X-Feature": feature } : {}),
      ...customHeaders,
    },
  });

  instance.interceptors.request.use(
    (config) => {
      const headers = ensureHeaders(config);
      if (feature && !headers["X-Feature"]) {
        headers["X-Feature"] = feature;
      }
      const token = getAccessToken();
      if (token && !headers.Authorization) {
        headers.Authorization = "Bearer " + token;
      }
      config.withCredentials = true;
      return config;
    },
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => {
      rememberTokenFromResponse(response);
      return response;
    },
    async (error) => {
      const { config, response } = error ?? {};
      if (shouldSkipRefresh(error)) {
        if (response?.status === 401) {
          clearTokens();
          notifyUnauthorized(error);
        }
        return Promise.reject(error);
      }

      const token = getAccessToken();
      if (!token) {
        clearTokens();
        notifyUnauthorized(error);
        return Promise.reject(error);
      }

      try {
        const newToken = await refreshAccessToken(instance.defaults.baseURL);
        if (!newToken) {
          clearTokens();
          throw error;
        }
        config.__isRetryRequest = true;
        const headers = ensureHeaders(config);
        headers.Authorization = "Bearer " + newToken;
        return instance(config);
      } catch (refreshErr) {
        notifyUnauthorized(refreshErr);
        return Promise.reject(refreshErr);
      }
    },
  );

  return instance;
}
