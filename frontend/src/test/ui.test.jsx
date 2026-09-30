import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { AuthProvider } from "../auth/AuthProvider";

const BOOKS = {
  1: { author: "Marco Aurelio", title: "Meditazioni", category: "Stoicismo", reviews: { sofia: "Da comodino" } },
  10: { author: "Friedrich Nietzsche", title: "Così parlò Zarathustra", category: "Filosofia moderna", reviews: {} },
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

    expect(await screen.findByRole("heading", { name: "Meditazioni" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Così parlò Zarathustra" })).toBeInTheDocument();
    expect(screen.getByText("1 recensione")).toBeInTheDocument();
  });

  it("filters the catalog by category", async () => {
    vi.stubGlobal("fetch", vi.fn(() => respond(200, BOOKS)));
    renderApp();

    await userEvent.click(await screen.findByRole("button", { name: "Stoicismo" }));
    expect(screen.getByRole("heading", { name: "Meditazioni" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Così parlò Zarathustra" })).not.toBeInTheDocument();
  });
});

describe("login", () => {
  it("shows the server error for wrong credentials", async () => {
    vi.stubGlobal("fetch", vi.fn(() => respond(401, { message: "Username o password non corretti" })));
    renderApp("/login");

    await userEvent.type(screen.getByLabelText("Username"), "mario");
    await userEvent.type(screen.getByLabelText("Password"), "sbagliata");
    await userEvent.click(screen.getByRole("button", { name: "Accedi" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Username o password non corretti");
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
    await userEvent.click(screen.getByRole("button", { name: "Accedi" }));

    expect(await screen.findByText("mario")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Esci/ })).toBeInTheDocument();
  });
});
