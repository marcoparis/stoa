import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, API_URL, getBooks, saveReview, searchBooks } from "../api";

const jsonResponse = (status, body) =>
  Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("api client", () => {
  it("turns the books object into an array with the ISBN", async () => {
    vi.stubGlobal("fetch", vi.fn(() => jsonResponse(200, { 1: { title: "A", author: "X", reviews: {} } })));
    await expect(getBooks()).resolves.toEqual([{ isbn: "1", title: "A", author: "X", reviews: {} }]);
  });

  it("treats a 404 search as no results", async () => {
    vi.stubGlobal("fetch", vi.fn(() => jsonResponse(404, { message: "Nessun libro" })));
    await expect(searchBooks("author", "nobody")).resolves.toEqual([]);
  });

  it("encodes the search term in the URL", async () => {
    const fetch = vi.fn(() => jsonResponse(200, []));
    vi.stubGlobal("fetch", fetch);
    await searchBooks("title", "divine comedy/2");
    expect(fetch.mock.calls[0][0]).toBe(`${API_URL}/title/divine%20comedy%2F2`);
  });

  it("sends the review as JSON with the Bearer token", async () => {
    const fetch = vi.fn(() => jsonResponse(201, { message: "ok", reviews: {} }));
    vi.stubGlobal("fetch", fetch);
    await saveReview("3", "Bello", "tok123");
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe(`${API_URL}/customer/auth/review/3`);
    expect(options.method).toBe("PUT");
    expect(options.headers).toMatchObject({ Authorization: "Bearer tok123", "Content-Type": "application/json" });
    expect(JSON.parse(options.body)).toEqual({ review: "Bello" });
  });

  it("surfaces the server message and status on errors", async () => {
    vi.stubGlobal("fetch", vi.fn(() => jsonResponse(401, { message: "Username o password non corretti" })));
    await expect(saveReview("1", "x", "bad")).rejects.toMatchObject({
      message: "Username o password non corretti",
      status: 401,
    });
  });

  it("reports network failures with status 0", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))));
    const error = await getBooks().catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(0);
  });
});
