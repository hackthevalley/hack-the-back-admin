import { useEffect, useCallback, useState, createContext } from "react";
import * as jose from "jose";
import {
  deleteSession,
  refreshSession as requestSessionRefresh,
} from "@/api/auth";
import { ApiError } from "@/lib/api";
import { getAccessToken, setAccessToken } from "@/lib/access-token";

interface UserContextType {
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const UserContext = createContext<UserContextType | null>(null);

function assertAdminToken(token: string) {
  const { scopes } = jose.decodeJwt(token);
  if (!Array.isArray(scopes) || !scopes.includes("admin")) {
    throw new Error("You do not have access");
  }
}

export { UserContext };

export function AuthProvider({ children }: AuthProviderProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = useCallback(() => {
    setAccessToken(null);
    setIsAuthenticated(false);
    void deleteSession().catch(() => undefined);
  }, []);

  const login = useCallback((token: string) => {
    try {
      assertAdminToken(token);
      setAccessToken(token);
      setIsAuthenticated(true);
    } catch (err) {
      setAccessToken(null);
      throw err;
    }
  }, []);

  useEffect(() => {
    let active = true;
    localStorage.removeItem("auth-token");

    const refreshSession = async () => {
      try {
        const response = await requestSessionRefresh();
        assertAdminToken(response.access_token);
        if (!active) return;
        setAccessToken(response.access_token);
        setIsAuthenticated(true);
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError && err.status === 401) {
          logout();
        } else {
          const token = getAccessToken();
          try {
            if (!token) throw new Error("No access token");
            assertAdminToken(token);
            setIsAuthenticated(true);
          } catch {
            logout();
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void refreshSession();
    const timer = window.setInterval(() => {
      void refreshSession();
    }, 10 * 60 * 1000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [logout]);

  useEffect(() => {
    window.addEventListener("auth:unauthorized", logout);
    return () => {
      window.removeEventListener("auth:unauthorized", logout);
    };
  }, [logout]);

  return (
    <UserContext.Provider value={{ login, logout, loading, isAuthenticated }}>
      {loading ? "Loading..." : children}
    </UserContext.Provider>
  );
}
