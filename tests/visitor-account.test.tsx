// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { VisitorAccount } from "../src/components/VisitorAccount";
const identity = vi.hoisted(() => ({ hydrate: vi.fn(), signup: vi.fn() }));
vi.mock("@netlify/identity", () => ({
  hydrateSession: identity.hydrate,
  signup: identity.signup,
  requestPasswordRecovery: vi.fn(),
  updateUser: vi.fn(),
  acceptInvite: vi.fn(),
}));
const respond = (data: object, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: async () => data });
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "fetch",
    vi.fn(() => respond({ attemptsRemaining: 3 })),
  );
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
const mount = (mode?: "reset" | "invite") =>
  render(
    <VisitorAccount
      onClose={vi.fn()}
      onSuccess={vi.fn(async () => {})}
      mode={mode}
    />,
  );
describe("visitor password controls", () => {
  it("keeps the password hidden by default and toggles visibility without submitting", () => {
    mount();
    const password = screen.getByLabelText("Password") as HTMLInputElement;
    fireEvent.change(password, { target: { value: "test-only-password" } });
    expect(password.type).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(password.type).toBe("text");
    expect(
      screen
        .getByRole("button", { name: "Hide password" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(password.type).toBe("password");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("also provides password visibility when choosing a replacement password", () => {
    mount("reset");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect((screen.getByLabelText(/Password/) as HTMLInputElement).type).toBe(
      "text",
    );
  });
  it("shows the timeout countdown, disables sign-in and permits password recovery", async () => {
    vi.mocked(fetch).mockImplementation(async (_url, init) => {
      const body = JSON.parse(String(init?.body));
      return (await respond(
        body.action === "visitor-login"
          ? { retryAfter: 900 }
          : { attemptsRemaining: 3 },
        body.action === "visitor-login" ? 429 : 200,
      )) as Response;
    });
    mount();
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "visitor@example.test" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong-test-password" },
    });
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Sign in" })),
    );
    expect(screen.getByRole("status").textContent).toContain("15:00");
    expect(
      (screen.getByRole("button", { name: "Sign in" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    await act(async () => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("status").textContent).toContain("14:59");
    fireEvent.click(
      screen.getByRole("button", { name: "Forgot your password?" }),
    );
    expect(
      (
        screen.getByRole("button", {
          name: "Send reset link",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
  });
  it("restores a server timeout when the visitor re-enters their email", async () => {
    vi.mocked(fetch).mockImplementation(
      () => respond({ retryAfter: 120 }, 429) as Promise<Response>,
    );
    mount();
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "visitor@example.test" },
    });
    await act(async () => vi.advanceTimersByTime(350));
    expect(screen.getByRole("status").textContent).toContain("2:00");
    expect(
      (screen.getByRole("button", { name: "Sign in" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    await act(async () => vi.advanceTimersByTime(120000));
    expect(
      (screen.getByRole("button", { name: "Sign in" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });
});
