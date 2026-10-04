import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { AuthProvider } from "../auth/AuthProvider";

const BOOKS = {
  1: { author: "Marcus Aurelius", title: "Meditations", category: "Stoicism", reviews: { sofia: "Bedside reading" } },
  10: { author: "Friedrich Nietzsche", title: "Thus Spoke Zarathustra", category: "Modern philosophy", reviews: {} },
};

const respond = (status, body) =>
  Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });

const renderApp = (path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("catalog", () => {
  it("lists the books with their review count", async () => {
    vi.stubGlobal("fetch", vi.fn(() => respond(200, BOOKS)));
    renderApp();

    expect(await screen.findByRole("heading", { name: "Meditations" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Thus Spoke Zarathustra" })).toBeInTheDocument();
    expect(screen.getByText("1 review")).toBeInTheDocument();
  });

  it("filters the catalog by category", async () => {
    vi.stubGlobal("fetch", vi.fn(() => respond(200, BOOKS)));
    renderApp();

    await userEvent.click(await screen.findByRole("button", { name: "Stoicism" }));
    expect(screen.getByRole("heading", { name: "Meditations" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Thus Spoke Zarathustra" })).not.toBeInTheDocument();
  });
});

describe("login", () => {
  it("shows the server error for wrong credentials", async () => {
    vi.stubGlobal("fetch", vi.fn(() => respond(401, { message: "Incorrect username or password" })));
    renderApp("/login");

    await userEvent.type(screen.getByLabelText("Username"), "mario");
    await userEvent.type(screen.getByLabelText("Password"), "sbagliata");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Incorrect username or password");
  });

  it("logs in and shows the username in the header", async () => {
    const payload = btoa(JSON.stringify({ username: "mario", exp: Date.now() / 1000 + 3600 }));
    vi.stubGlobal(
      "fetch",
      vi.fn((url) =>
        url.endsWith("/customer/login") ? respond(200, { token: `h.${payload}.s` }) : respond(200, BOOKS),
      ),
    );
    renderApp("/login");

    await userEvent.type(screen.getByLabelText("Username"), "mario");
    await userEvent.type(screen.getByLabelText("Password"), "segreta1");
    await userEvent.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("mario")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Log out/ })).toBeInTheDocument();
  });
});
