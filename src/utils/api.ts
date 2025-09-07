const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

const fetchInstance = async (
  endpoint: string,
  options: FetchOptions = {},
  responseType: "json" | "blob" = "json"
) => {
  const token = localStorage.getItem("auth-token");
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const config = {
    ...options,
    headers: { ...headers, ...options.headers },
  };

  const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);

  if (!response.ok) {
    if (responseType === "json") {
      const errorData = await response.json();
      throw new Error(errorData.message || "Something went wrong");
    } else {
      throw new Error("Failed to fetch file");
    }
  }

  return responseType === "json"
    ? await response.json()
    : await response.blob();
};

export default fetchInstance;
