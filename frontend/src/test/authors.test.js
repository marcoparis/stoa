import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import books from "../../../backend/router/booksdb.js";
import { AUTHORS, authorPortrait } from "../data/authors";

// vitest runs from the frontend folder
const publicDir = resolve(process.cwd(), "public");

describe("author portraits", () => {
  const catalogAuthors = [...new Set(Object.values(books).map((b) => b.author))];

  it.each(catalogAuthors)("%s has a portrait file and a credit", (name) => {
    const entry = AUTHORS[name];
    expect(entry).toBeDefined();
    expect(existsSync(resolve(publicDir, "images/authors", `${entry.image}.webp`))).toBe(true);
    expect(entry.credit).toMatchObject({
      author: expect.any(String),
      license: expect.any(String),
      source: expect.stringMatching(/^https:\/\/commons\.wikimedia\.org\//),
    });
  });

  it("falls back to no portrait for unknown authors", () => {
    expect(authorPortrait("Unknown author")).toBeNull();
  });
});
