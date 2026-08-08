import { useEffect, useCallback, useState, createContext } from "react";
import * as jose from "jose";
import { refreshSession as requestSessionRefresh } from "@/api/auth";
import { ApiError } from "@/lib/api";

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
    localStorage.removeItem("auth-token");
    setIsAuthenticated(false);
  }, []);

  const login = useCallback((token: string) => {
    try {
      assertAdminToken(token);
      localStorage.setItem("auth-token", token);
      setIsAuthenticated(true);
    } catch (err) {
      localStorage.removeItem("auth-token");
      throw err;
    }
  }, []);

  useEffect(() => {
    let active = true;

    const refreshSession = async () => {
      const token = localStorage.getItem("auth-token");
      if (!token) {
        if (active) {
          setIsAuthenticated(false);
          setLoading(false);
        }
        return;
      }
      try {
        const response = await requestSessionRefresh();
        assertAdminToken(response.access_token);
        if (!active) return;
        localStorage.setItem("auth-token", response.access_token);
        setIsAuthenticated(true);
      } catch (err) {
        if (!active) return;
        if (err instanceof ApiError && err.status === 401) {
          logout();
        } else {
          try {
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
    }, 30000);

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
