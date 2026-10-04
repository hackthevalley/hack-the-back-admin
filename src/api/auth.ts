import fetchInstance from "@/lib/api";

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export function createSession(username: string, password: string) {
  return fetchInstance<TokenResponse>("account/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }).toString(),
  });
}

export function refreshSession() {
  return fetchInstance<TokenResponse>("account/tokens", {
    method: "POST",
  });
}
