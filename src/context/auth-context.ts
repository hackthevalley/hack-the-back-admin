import { createContext } from "react";

export interface UserContextType {
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export const UserContext = createContext<UserContextType | null>(null);
