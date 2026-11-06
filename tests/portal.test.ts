import { beforeEach, describe, expect, it, vi } from "vitest";
import { scryptSync } from "node:crypto";
import { PgDialect } from "drizzle-orm/pg-core";

const mocks = vi.hoisted(() => ({
  user: null as any,
  reads: [] as any[],
  filters: [] as any[],
  inserts: [] as any[],
  writes: [] as any[],
  attempts: 9,
  reservation: true,
  loginError: null as any,
  loginCalls: 0,
  deletes: 0,
  conflicts: [] as any[],
  AuthError: class extends Error {
    status: number;
    constructor(status: number) {
      super("Authentication failed");
      this.status = status;
    }
  },
}));
vi.mock("@netlify/identity", () => ({
  getUser: async () => mocks.user,
  AuthError: mocks.AuthError,
  login: async () => {
    mocks.loginCalls++;
    if (mocks.loginError) throw mocks.loginError;
    return {};
  },
}));
vi.mock("../db/index.js", () => {
  const chain = (result: any[] = []) => {
    const q: any = {
      where: (condition: any) => {
        mocks.filters.push(condition);
        return q;
      },
      orderBy: () => q,
      limit: () => q,
      then: (resolve: any) => Promise.resolve(result).then(resolve),
    };
    return q;
  };
  const db: any = {
    select: () => ({ from: () => chain(mocks.reads.shift() || []) }),
    insert: (table: any) => ({
      values: (values: any) => {
        mocks.inserts.push({ table, values });
        return {
          onConflictDoUpdate: (config: any) => {
            mocks.conflicts.push(config);
            return {
              returning: async () =>
                mocks.reservation
                  ? [
                      {
                        attempts: mocks.attempts,
                        expiresAt: new Date(Date.now() + 900000),
                      },
                    ]
                  : [],
            };
          },
          then: (resolve: any) => Promise.resolve().then(resolve),
        };
      },
    }),
    update: () => ({
      set: (values: any) => {
        mocks.writes.push(values);
        return chain();
      },
    }),
    delete: () => {
      mocks.deletes++;
      return chain();
    },
    transaction: async (fn: any) => fn(db),
  };
  return { db };
});
import handler from "../netlify/functions/portal.mts";
const context = { ip: "127.0.0.1" } as any;
const call = (
  body?: object,
  origin = "https://example.test",
  cookie?: string,
) =>
  handler(
    new Request("https://example.test/.netlify/functions/portal", {
      method: body ? "POST" : "GET",
      headers: {
        ...(body ? { origin, "Content-Type": "application/json" } : {}),
        ...(cookie ? { cookie } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    }),
    context,
  );
const query = (value: any) => new PgDialect().sqlToQuery(value);
const row = {
  id: "thread-owned",
  ownerId: "visitor-a",
  recipientEmail: "visitor@example.test",
  data: {
    id: "thread-owned",
    client: { name: "Visitor", email: "visitor@example.test" },
    details: { subject: "An enquiry" },
    notes: [{ text: "Private staff note" }],
    auditLog: [{ actor: "Staff" }],
  },
};

beforeEach(() => {
  mocks.user = null;
  mocks.reads = [];
  mocks.filters = [];
  mocks.inserts = [];
  mocks.writes = [];
  mocks.attempts = 9;
  mocks.reservation = true;
  mocks.loginError = null;
  mocks.loginCalls = 0;
  mocks.deletes = 0;
  mocks.conflicts = [];
  vi.unstubAllGlobals();
});
describe("private site messaging", () => {
  it("returns no conversations to signed-out visitors", async () => {
    const response = await call();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      requests: [],
      readReplyIds: [],
      isAdmin: false,
    });
    expect(mocks.filters).toHaveLength(0);
  });
  it("requires an account to submit an enquiry", async () => {
    expect((await call({ action: "create", request: {} })).status).toBe(401);
    expect(mocks.inserts).toHaveLength(0);
  });
  it("rejects mutations from another origin", async () => {
    expect(
      (
        await call(
          { action: "admin-login", code: "invalid" },
          "https://elsewhere.test",
        )
      ).status,
    ).toBe(403);
    expect(mocks.inserts).toHaveLength(0);
  });
  it("scopes visitor inbox queries to the account and unclaimed messages for its email", async () => {
    mocks.user = { id: "visitor-a", email: "visitor@example.test" };
    mocks.reads = [[row], []];
    const response = await call();
    const filter = query(mocks.filters[0]);
    expect(filter.params).toEqual(["visitor-a", "visitor@example.test"]);
    expect(filter.sql).toContain('"owner_id" IS NULL');
    const data = await response.json();
    expect(data.requests[0].notes).toEqual([]);
    expect(data.requests[0].auditLog).toEqual([]);
  });
  it("prevents visitors from choosing another account as the enquiry owner", async () => {
    mocks.user = { id: "visitor-a", email: "visitor@example.test" };
    const response = await call({
      action: "create",
      request: {
        type: "contact",
        client: { name: "Visitor", email: "someone-else@example.test" },
        status: "approved",
        replies: [{ message: "forged staff reply" }],
        notes: [{ text: "forged" }],
      },
    });
    expect(response.status).toBe(201);
    const created = mocks.inserts[0].values;
    expect(created.ownerId).toBe("visitor-a");
    expect(created.recipientEmail).toBe("visitor@example.test");
    expect(created.data.status).toBe("pending");
    expect(created.data.replies).toEqual([]);
    expect(created.data.notes).toEqual([]);
  });
  it("denies access to another visitor’s conversation", async () => {
    mocks.user = { id: "visitor-a", email: "visitor@example.test" };
    mocks.reads = [[]];
    const response = await call({
      action: "reply",
      id: "another-thread",
      message: "Hello",
    });
    expect(response.status).toBe(404);
    expect(query(mocks.filters[0]).params).toEqual([
      "another-thread",
      "visitor-a",
      "visitor@example.test",
    ]);
    expect(mocks.inserts).toHaveLength(0);
  });
  it("denies visitor access to staff message creation and administrative updates", async () => {
    mocks.user = { id: "visitor-a", email: "visitor@example.test" };
    expect((await call({ action: "direct" })).status).toBe(403);
    mocks.reads = [[row]];
    expect(
      (
        await call({
          action: "update",
          id: row.id,
          patch: { status: "approved" },
        })
      ).status,
    ).toBe(403);
    expect(mocks.writes).toHaveLength(0);
  });
  it("persists visitor follow-ups without allowing a forged staff sender", async () => {
    mocks.user = { id: "visitor-a", email: "visitor@example.test" };
    mocks.reads = [[row]];
    const response = await call({
      action: "reply",
      id: row.id,
      message: "Thank you",
      senderName: "Staff",
      direction: "staff",
    });
    expect(response.status).toBe(200);
    expect(mocks.inserts[0].values.direction).toBe("visitor");
    expect(mocks.inserts[0].values.data.senderEmail).toBe(
      "visitor@example.test",
    );
    expect(mocks.inserts[0].values.data.message).toBe("Thank you");
  });
  it("marks only staff replies in an authorized conversation as read", async () => {
    mocks.user = { id: "visitor-a", email: "visitor@example.test" };
    mocks.reads = [[row]];
    expect(
      (await call({ action: "read", id: row.id, replyId: "reply-a" })).status,
    ).toBe(200);
    expect(mocks.writes[0].readAt).toBeInstanceOf(Date);
    expect(query(mocks.filters[1]).params).toEqual([
      row.id,
      "staff",
      "reply-a",
    ]);
  });
  it("limits access code guesses before checking the code", async () => {
    expect(
      (await call({ action: "admin-login", code: "invalid" })).status,
    ).toBe(429);
  });
  it("clears the server-side session and its cookie on staff sign-out", async () => {
    const response = await call({ action: "admin-logout" });
    expect(response.status).toBe(200);
    expect(response.headers.get("Set-Cookie")).toContain("Max-Age=0");
    expect(response.headers.get("Set-Cookie")).toContain("HttpOnly");
  });
  it("never caches private inbox responses", async () => {
    expect((await call()).headers.get("Cache-Control")).toBe("no-store");
  });
});

describe("staff correspondence and sessions", () => {
  const staffCookie = "rw_staff=" + "a".repeat(64);
  it("restores a valid staff session and can load the enquiry inbox", async () => {
    mocks.reads = [
      [{ tokenHash: "opaque", expiresAt: new Date(Date.now() + 60000) }],
      [row],
      [],
    ];
    const response = await call(undefined, undefined, staffCookie);
    const data = await response.json();
    expect(data.isAdmin).toBe(true);
    expect(data.requests[0].notes).toEqual(row.data.notes);
    expect(mocks.filters[1]).toBeUndefined();
    expect(query(mocks.filters[0]).sql).toContain('"expires_at" >');
  });
  it("rejects a missing or expired staff session", async () => {
    mocks.reads = [[]];
    const response = await call(
      { action: "reply", id: row.id, message: "Hello" },
      undefined,
      staffCookie,
    );
    expect(response.status).toBe(401);
  });
  it("sends staff replies as staff messages for visitor notifications", async () => {
    mocks.reads = [[{ tokenHash: "opaque" }], [row]];
    const response = await call(
      {
        action: "reply",
        id: row.id,
        message: "Your appointment is confirmed.",
      },
      undefined,
      staffCookie,
    );
    expect(response.status).toBe(200);
    const message = mocks.inserts[0].values;
    expect(message.direction).toBe("staff");
    expect(message.conversationId).toBe(row.id);
    expect(message.data.recipientEmail).toBe(row.recipientEmail);
    expect(message.readAt).toBeUndefined();
  });
  it("returns persisted unread and read replies to a returning visitor", async () => {
    mocks.user = { id: "visitor-a", email: row.recipientEmail };
    mocks.reads = [
      [row],
      [
        {
          id: "reply-unread",
          conversationId: row.id,
          direction: "staff",
          data: { id: "reply-unread", message: "New reply" },
          readAt: null,
        },
        {
          id: "reply-read",
          conversationId: row.id,
          direction: "staff",
          data: { id: "reply-read", message: "Previous reply" },
          readAt: new Date(),
        },
      ],
    ];
    const data = await (await call()).json();
    expect(data.readReplyIds).toEqual(["reply-read"]);
    expect(data.requests[0].replies.map((m: any) => m.direction)).toEqual([
      "staff",
      "staff",
    ]);
  });
  it("issues an expiring secure HttpOnly session only for a matching code", async () => {
    mocks.attempts = 1;
    const salt = "unit-test-salt";
    const code = "unit-test-value";
    const digest = scryptSync(code, salt, 64).toString("hex");
    vi.stubGlobal("Netlify", {
      env: {
        get: (key: string) =>
          key === "ADMIN_PORTAL_CODE_SALT" ? salt : digest,
      },
    });
    const response = await call({ action: "admin-login", code });
    expect(response.status).toBe(200);
    const cookie = response.headers.get("Set-Cookie")!;
    expect(cookie).toContain(
      "HttpOnly; Secure; SameSite=Strict; Max-Age=28800",
    );
    expect(mocks.inserts[1].values.tokenHash).not.toBe(
      cookie.match(/rw_staff=([^;]+)/)?.[1],
    );
    expect(mocks.inserts[1].values.expiresAt).toBeInstanceOf(Date);
    expect((await call({ action: "admin-login", code: "wrong" })).status).toBe(
      401,
    );
  });
  it("sanitizes visitor-supplied details before they reach the staff interface", async () => {
    mocks.user = { id: "visitor-a", email: row.recipientEmail };
    await call({
      action: "create",
      request: {
        type: "contact",
        client: { name: "Visitor" },
        details: {
          message: { malicious: "object" },
          subject: "An enquiry",
          offerAmount: -10,
          bedrooms: "many",
          unexpectedField: true,
        },
      },
    });
    expect(mocks.inserts[0].values.data.details).toEqual({
      subject: "An enquiry",
    });
  });
});

describe("visitor password timeout", () => {
  const credentials = {
    action: "visitor-login",
    email: "visitor@example.test",
    password: "test-only-password",
  };
  it("reports the remaining attempts after an invalid password", async () => {
    mocks.attempts = 1;
    mocks.loginError = new mocks.AuthError(401);
    const response = await call(credentials);
    expect(response.status).toBe(401);
    expect((await response.json()).attemptsRemaining).toBe(2);
  });
  it("starts a full fifteen-minute timeout on the third wrong password", async () => {
    mocks.attempts = 3;
    mocks.loginError = new mocks.AuthError(401);
    const response = await call(credentials);
    expect(response.status).toBe(429);
    expect(Number(response.headers.get("Retry-After"))).toBeGreaterThanOrEqual(
      899,
    );
    expect((await response.json()).attemptsRemaining).toBe(0);
  });
  it("blocks a fourth attempt without calling the password provider", async () => {
    mocks.reservation = false;
    mocks.reads = [[{ attempts: 3, expiresAt: new Date(Date.now() + 60000) }]];
    const response = await call(credentials);
    expect(response.status).toBe(429);
    expect(mocks.loginCalls).toBe(0);
    expect(Number(response.headers.get("Retry-After"))).toBeLessThanOrEqual(60);
  });
  it("restores the timeout from shared storage after reopening sign-in", async () => {
    mocks.reads = [[{ attempts: 3, expiresAt: new Date(Date.now() + 400000) }]];
    const response = await call({
      action: "visitor-login-status",
      email: credentials.email,
    });
    expect(response.status).toBe(429);
    expect((await response.json()).retryAfter).toBeGreaterThan(390);
    expect(mocks.loginCalls).toBe(0);
  });
  it("allows sign-in again after timeout and atomically reserves only three attempts", async () => {
    mocks.reads = [[{ attempts: 3, expiresAt: new Date(Date.now() - 1000) }]];
    expect(
      (await call({ action: "visitor-login-status", email: credentials.email }))
        .status,
    ).toBe(200);
    mocks.attempts = 1;
    expect((await call(credentials)).status).toBe(200);
    const constraint = query(mocks.conflicts[0].setWhere);
    expect(constraint.sql).toContain('"expires_at" <=');
    expect(constraint.params).toContain(3);
    expect(mocks.deletes).toBe(1);
  });
  it("clears failed attempts when the third attempt succeeds", async () => {
    mocks.attempts = 3;
    expect((await call(credentials)).status).toBe(200);
    expect(mocks.deletes).toBe(1);
  });
  it("does not count service errors as wrong passwords", async () => {
    mocks.attempts = 2;
    mocks.loginError = new Error("Service unavailable");
    expect((await call(credentials)).status).toBe(503);
    expect(mocks.writes).toHaveLength(1);
    expect(query(mocks.writes[0].attempts).sql).toContain("GREATEST");
  });
  it("rejects cross-origin visitor sign-in before checking credentials", async () => {
    expect((await call(credentials, "https://elsewhere.test")).status).toBe(
      403,
    );
    expect(mocks.loginCalls).toBe(0);
  });
});
