const DEFAULT_API_URL = import.meta.env.DEV ? "http://localhost:5000" : "https://expressbookreviews-xlyg.onrender.com";

export const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Could not reach the server. Please try again in a moment.", 0);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.message || `Error ${res.status}`, res.status);
  return data;
}

const enc = encodeURIComponent;

export async function getBooks() {
  const books = await request("/");
  return Object.entries(books).map(([isbn, book]) => ({ isbn, ...book }));
}

export async function searchBooks(field, query) {
  try {
    return await request(`/${field === "author" ? "author" : "title"}/${enc(query)}`);
  } catch (err) {
    if (err.status === 404) return [];
    throw err;
  }
}

export async function getBook(isbn) {
  const book = await request(`/isbn/${enc(isbn)}`);
  return { isbn, ...book };
}

export const register = (username, password) =>
  request("/register", { method: "POST", body: { username, password } });

export const login = (username, password) =>
  request("/customer/login", { method: "POST", body: { username, password } });

export const saveReview = (isbn, review, token) =>
  request(`/customer/auth/review/${enc(isbn)}`, { method: "PUT", body: { review }, token });

export const deleteReview = (isbn, token) =>
  request(`/customer/auth/review/${enc(isbn)}`, { method: "DELETE", token });
