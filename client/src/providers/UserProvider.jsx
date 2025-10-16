import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createApiClient,
  getTokens,
  getAccessToken,
  setTokens as persistTokens,
  clearTokens as clearStoredTokens,
} from "../services/http";
import { onTokenChange, onUnauthorized } from "../services/auth/authEvents";

const UserContext = createContext(null);

const STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  AUTHENTICATED: "authenticated",
  UNAUTHENTICATED: "unauthenticated",
  ERROR: "error",
};

export function UserProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [error, setError] = useState(null);
  const [tokens, setTokenState] = useState(() => getTokens());
  const isMounted = useRef(false);
  const statusRef = useRef(status);

  if (!statusRef.current) {
    statusRef.current = status;
  }

  const apiClientRef = useRef(null);
  if (!apiClientRef.current) {
    apiClientRef.current = createApiClient({ feature: "profile" });
  }
  const profileClient = apiClientRef.current;

  const updateStatus = useCallback((nextStatus) => {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
  }, []);

  const refreshProfile = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setProfile(null);
      setError(null);
      updateStatus(STATUS.UNAUTHENTICATED);
      return null;
    }

    updateStatus(STATUS.LOADING);
    setError(null);

    try {
      const response = await profileClient.get("/profile");
      const data = response?.data?.data;
      const nextProfile = data?.profile ?? data ?? null;
      if (!isMounted.current) return nextProfile;
      setProfile(nextProfile);
      updateStatus(STATUS.AUTHENTICATED);
      return nextProfile;
    } catch (err) {
      if (!isMounted.current) throw err;
      if (err?.response?.status === 401) {
        setProfile(null);
        updateStatus(STATUS.UNAUTHENTICATED);
        setError(null);
      } else {
        setError(err);
        updateStatus(STATUS.ERROR);
      }
      throw err;
    }
  }, [profileClient, updateStatus]);

  const setSessionTokens = useCallback((nextTokens) => {
    persistTokens(nextTokens);
  }, []);

  const clearSessionTokens = useCallback(() => {
    clearStoredTokens();
  }, []);

  const setProfileValue = useCallback(
    (nextProfile, nextError = null) => {
      setProfile(nextProfile);
      setError(nextError);
      updateStatus(nextProfile ? STATUS.AUTHENTICATED : STATUS.UNAUTHENTICATED);
    },
    [updateStatus],
  );

  useEffect(() => {
    isMounted.current = true;
    if (getAccessToken()) {
      refreshProfile().catch(() => {});
    } else {
      updateStatus(STATUS.UNAUTHENTICATED);
    }
    return () => {
      isMounted.current = false;
    };
  }, [refreshProfile, updateStatus]);

  useEffect(() => {
    const unsubscribeToken = onTokenChange((nextTokens) => {
      const normalized = {
        accessToken: nextTokens?.accessToken ?? null,
        refreshToken: nextTokens?.refreshToken ?? null,
      };
      setTokenState((prev) => {
        if (prev.accessToken === normalized.accessToken && prev.refreshToken === normalized.refreshToken) {
          return prev;
        }
        return normalized;
      });

      if (normalized.accessToken) {
        if (
          statusRef.current === STATUS.UNAUTHENTICATED ||
          statusRef.current === STATUS.IDLE ||
          statusRef.current === STATUS.ERROR
        ) {
          refreshProfile().catch(() => {});
        }
      } else {
        setProfileValue(null);
      }
    });

    const unsubscribeUnauthorized = onUnauthorized((reason) => {
      setError(reason);
      setProfile(null);
      updateStatus(STATUS.UNAUTHENTICATED);
    });

    return () => {
      unsubscribeToken();
      unsubscribeUnauthorized();
    };
  }, [refreshProfile, setProfileValue, updateStatus]);

  const value = useMemo(
    () => ({
      profile,
      status,
      error,
      tokens,
      isAuthenticated: status === STATUS.AUTHENTICATED,
      refreshProfile,
      setProfile: setProfileValue,
      setTokens: setSessionTokens,
      clearTokens: clearSessionTokens,
    }),
    [profile, status, error, tokens, refreshProfile, setProfileValue, setSessionTokens, clearSessionTokens],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const USER_STATUS = STATUS;

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return ctx;
}
