import { auth } from "./firebase";

// Wraps fetch() and automatically attaches the current user's Firebase ID token.
// Usage: await apiRequest("/medicines", { method: "POST", body: {...} })
export async function apiRequest(path, { method = "GET", body } = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");
  const token = await user.getIdToken();

  const res = await fetch("/api" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}
