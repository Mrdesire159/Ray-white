import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { getUser, login, admin, AuthError } from "@netlify/identity";
import type { Context } from "@netlify/functions";
import { and, eq, gt, lt, lte, or, sql, desc, asc } from "drizzle-orm";
import { db } from "../../db/index.js";
import {
  conversations,
  messages,
  adminSessions,
  adminAttempts,
} from "../../db/schema.js";
import type {
  AdminRequest,
  RequestReply,
  RequestDetails,
} from "../../src/types/request.js";

const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const cookie = (value: string, age: number) =>
  `rw_staff=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${age}`;
const json = (
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
) =>
  Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
function text(value: unknown, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function sanitizeDetails(input: unknown): RequestDetails {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const source = input as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of [
    "propertyType",
    "requestedDate",
    "requestedTime",
    "subject",
    "message",
    "preferredOffice",
  ]) {
    if (typeof source[key] === "string")
      result[key] = text(source[key], key === "message" ? 10000 : 300);
  }
  for (const key of [
    "bedrooms",
    "bathrooms",
    "carSpaces",
    "attendeesCount",
    "offerAmount",
    "settlementDays",
    "depositPercentage",
  ]) {
    if (
      typeof source[key] === "number" &&
      Number.isFinite(source[key]) &&
      (source[key] as number) >= 0
    )
      result[key] = source[key];
  }
  if (typeof source.financeApproved === "boolean")
    result.financeApproved = source.financeApproved;
  if (["digital", "in_person"].includes(source.appraisalMode as string))
    result.appraisalMode = source.appraisalMode;
  if (
    ["private_vip", "general_open", "virtual_tour"].includes(
      source.inspectionType as string,
    )
  )
    result.inspectionType = source.inspectionType;
  const range = source.estimatedValueRange as
    Record<string, unknown> | undefined;
  if (
    range &&
    ["low", "high", "median"].every(
      (key) =>
        typeof range[key] === "number" &&
        Number.isFinite(range[key]) &&
        (range[key] as number) >= 0,
    )
  )
    result.estimatedValueRange = {
      low: range.low,
      high: range.high,
      median: range.median,
    };
  return result as RequestDetails;
}

export default async (req: Request, context: Context) => {
  try {
    if (!["GET", "POST"].includes(req.method))
      return json({ error: "Method not allowed." }, 405);
    const url = new URL(req.url);
    if (req.method === "POST" && req.headers.get("origin") !== url.origin)
      return json({ error: "Invalid origin." }, 403);
    if (Number(req.headers.get("content-length") || 0) > 40000)
      return json({ error: "Message too large." }, 413);
    const raw = req.method === "POST" ? await req.text() : "";
    if (raw.length > 40000) return json({ error: "Message too large." }, 413);
    let body: any = {};
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      return json({ error: "Invalid request." }, 400);
    }
    const action = req.method === "GET" ? "list" : body.action;
    if (action === "visitor-signup") {
      const email = text(body.email, 254).toLowerCase();
      const name = text(body.name, 120);
      const password = typeof body.password === "string" ? body.password : "";
      if (!name) return json({ error: "Enter your name." }, 400);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return json({ error: "Enter a valid email address." }, 400);
      if (password.length < 10 || password.length > 1024)
        return json({ error: "Use a password of at least 10 characters." }, 400);
      const localPart = email.split("@")[0];
      if (localPart.length > 2 && password.toLowerCase().includes(localPart))
        return json(
          { error: "Choose a password that doesn't contain your email name." },
          400,
        );
      // Limit new accounts per network to deter automated sign-ups.
      const key = `visitor-signup:${hash(context.ip || "unknown")}`;
      const now = new Date();
      const [attempt] = await db
        .insert(adminAttempts)
        .values({ key, attempts: 1, expiresAt: new Date(now.getTime() + 3600000) })
        .onConflictDoUpdate({
          target: adminAttempts.key,
          set: {
            attempts: sql`CASE WHEN ${adminAttempts.expiresAt} <= ${now} THEN 1 ELSE ${adminAttempts.attempts} + 1 END`,
            expiresAt: sql`CASE WHEN ${adminAttempts.expiresAt} <= ${now} THEN ${new Date(now.getTime() + 3600000)} ELSE ${adminAttempts.expiresAt} END`,
          },
        })
        .returning();
      if (attempt.attempts > 6)
        return json(
          { error: "Too many new accounts from this network. Try again later." },
          429,
        );
      try {
        await admin.createUser({
          email,
          password,
          data: { user_metadata: { full_name: name } },
        });
      } catch (error) {
        const duplicate =
          error instanceof AuthError &&
          (error.status === 422 || /already|registered|exists/i.test(error.message));
        if (!duplicate)
          return json(
            { error: "Account creation is unavailable. Please try again shortly." },
            503,
          );
        // The email is already registered: sign in if the password matches.
        try {
          await login(email, password);
          return json({ ok: true, existing: true });
        } catch {
          return json(
            {
              error:
                "An account with this email already exists. Sign in or reset your password.",
              code: "exists",
            },
            409,
          );
        }
      }
      try {
        await login(email, password);
      } catch {
        return json(
          { error: "Your account was created. Please sign in to continue.", code: "created" },
          503,
        );
      }
      return json({ ok: true });
    }
    if (action === "visitor-login" || action === "visitor-login-status") {
      const email = text(body.email, 254).toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return json({ error: "Enter a valid email address." }, 400);
      const key = `visitor-login:${hash(`${context.ip}:${email}`)}`;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 15 * 60000);
      const timeout = (until?: Date) => {
        const retryAfter = Math.max(
          1,
          Math.ceil(
            ((until?.getTime() || expiresAt.getTime()) - Date.now()) / 1000,
          ),
        );
        return json(
          {
            error:
              "Three unsuccessful sign-in attempts. Please wait before trying again.",
            retryAfter,
            attemptsRemaining: 0,
          },
          429,
          { "Retry-After": String(retryAfter) },
        );
      };
      if (action === "visitor-login-status") {
        const [state] = await db
          .select()
          .from(adminAttempts)
          .where(eq(adminAttempts.key, key));
        if (state && state.attempts >= 3 && state.expiresAt > now)
          return timeout(state.expiresAt);
        return json({
          attemptsRemaining:
            state && state.expiresAt > now
              ? Math.max(0, 3 - state.attempts)
              : 3,
        });
      }
      if (
        typeof body.password !== "string" ||
        !body.password ||
        body.password.length > 1024
      )
        return json({ error: "Enter your password." }, 400);
      // Reserve an attempt atomically so simultaneous requests cannot bypass the limit.
      const [attempt] = await db
        .insert(adminAttempts)
        .values({ key, attempts: 1, expiresAt })
        .onConflictDoUpdate({
          target: adminAttempts.key,
          set: {
            attempts: sql`CASE WHEN ${adminAttempts.expiresAt} <= ${now} THEN 1 ELSE ${adminAttempts.attempts} + 1 END`,
            expiresAt: sql`CASE WHEN ${adminAttempts.expiresAt} <= ${now} OR ${adminAttempts.attempts} = 2 THEN ${expiresAt} ELSE ${adminAttempts.expiresAt} END`,
          },
          setWhere: or(
            lte(adminAttempts.expiresAt, now),
            lt(adminAttempts.attempts, 3),
          ),
        })
        .returning();
      if (!attempt) {
        const [state] = await db
          .select()
          .from(adminAttempts)
          .where(eq(adminAttempts.key, key));
        return timeout(state?.expiresAt);
      }
      try {
        await login(email, body.password);
        await db.delete(adminAttempts).where(eq(adminAttempts.key, key));
        return json({ ok: true });
      } catch (error) {
        if (
          error instanceof AuthError &&
          [400, 401, 422].includes(error.status || 0)
        ) {
          if (attempt.attempts >= 3) return timeout(attempt.expiresAt);
          return json(
            {
              error: "Unable to sign in. Check your email and password.",
              attemptsRemaining: 3 - attempt.attempts,
            },
            401,
          );
        }
        // Service failures and unconfirmed accounts do not consume password attempts.
        await db
          .update(adminAttempts)
          .set({ attempts: sql`GREATEST(${adminAttempts.attempts} - 1, 0)` })
          .where(eq(adminAttempts.key, key));
        return json(
          {
            error:
              "Sign-in is unavailable. Confirm your email or try again shortly.",
          },
          503,
        );
      }
    }
    const token = req.headers
      .get("cookie")
      ?.match(/(?:^|;\s*)rw_staff=([a-f0-9]{64})(?:;|$)/)?.[1];
    const [session] = token
      ? await db
          .select()
          .from(adminSessions)
          .where(
            and(
              eq(adminSessions.tokenHash, hash(token)),
              gt(adminSessions.expiresAt, new Date()),
            ),
          )
      : [];
    const isAdmin = !!session;

    if (action === "admin-login") {
      const bucket = Math.floor(Date.now() / 900000);
      const key = hash(`${context.ip}:${bucket}`);
      const [attempt] = await db
        .insert(adminAttempts)
        .values({ key, attempts: 1, expiresAt: new Date(Date.now() + 900000) })
        .onConflictDoUpdate({
          target: adminAttempts.key,
          set: { attempts: sql`${adminAttempts.attempts} + 1` },
        })
        .returning();
      if (attempt.attempts > 8)
        return json(
          { error: "Too many attempts. Try again in 15 minutes." },
          429,
        );
      const expected = Netlify.env.get("ADMIN_PORTAL_CODE_HASH");
      const salt = Netlify.env.get("ADMIN_PORTAL_CODE_SALT");
      if (!expected || !salt)
        return json({ error: "Staff access is not configured." }, 503);
      const supplied = scryptSync(text(body.code, 128), salt, 64);
      const stored = Buffer.from(expected, "hex");
      if (
        stored.length !== supplied.length ||
        !timingSafeEqual(stored, supplied)
      )
        return json({ error: "Invalid access code." }, 401);
      const newToken = randomBytes(32).toString("hex");
      await db.insert(adminSessions).values({
        tokenHash: hash(newToken),
        expiresAt: new Date(Date.now() + 8 * 3600000),
      });
      return json({ isAdmin: true }, 200, {
        "Set-Cookie": cookie(newToken, 8 * 3600),
      });
    }
    if (action === "admin-logout") {
      if (token)
        await db
          .delete(adminSessions)
          .where(eq(adminSessions.tokenHash, hash(token)));
      return json({ isAdmin: false }, 200, { "Set-Cookie": cookie("", 0) });
    }
    const user = await getUser();
    if (!isAdmin && !user)
      return action === "list"
        ? json({ requests: [], readReplyIds: [], isAdmin: false })
        : json(
            { error: "Sign in to send a message and receive private replies." },
            401,
          );
    const ownerCondition = user
      ? or(
          eq(conversations.ownerId, user.id),
          and(
            sql`${conversations.ownerId} IS NULL`,
            eq(conversations.recipientEmail, user.email?.toLowerCase() || ""),
          ),
        )
      : sql`false`;

    if (action === "list") {
      const rows = await db
        .select()
        .from(conversations)
        .where(isAdmin ? undefined : ownerCondition)
        .orderBy(desc(conversations.createdAt))
        .limit(500);
      const ids = rows.map((r) => r.id);
      const allMessages = ids.length
        ? await db
            .select()
            .from(messages)
            .where(
              sql`${messages.conversationId} IN (${sql.join(
                ids.map((id) => sql`${id}`),
                sql`, `,
              )})`,
            )
            .orderBy(asc(messages.createdAt), asc(messages.id))
        : [];
      return json({
        isAdmin,
        requests: rows.map((row) => ({
          ...row.data,
          ...(isAdmin ? {} : { notes: [], auditLog: [] }),
          replies: allMessages
            .filter((m) => m.conversationId === row.id)
            .map((m) => ({ ...m.data, direction: m.direction })),
        })),
        readReplyIds: allMessages
          .filter((m) => m.readAt && m.direction === "staff")
          .map((m) => m.id),
      });
    }
    if (action === "create" || action === "direct") {
      if (action === "direct" && !isAdmin)
        return json({ error: "Staff access required." }, 403);
      const input = body.request || {};
      const direct = action === "direct";
      const email = (
        isAdmin ? text(input.client?.email, 254) : user?.email || ""
      ).toLowerCase();
      const name = text(input.client?.name) || user?.name || "Visitor";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return json({ error: "A valid email is required." }, 400);
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      const type = [
        "contact",
        "inspection",
        "appraisal",
        "valuation",
        "offer",
      ].includes(input.type)
        ? input.type
        : "contact";
      const allowedPropertyKeys = [
        "propertyId",
        "propertyTitle",
        "propertyAddress",
        "propertySuburb",
        "propertyState",
        "propertyPrice",
        "propertyImage",
        "assignedAgentId",
      ];
      const property = Object.fromEntries(
        allowedPropertyKeys
          .filter((k) => typeof input[k] === "string")
          .map((k) => [k, text(input[k], 2000)]),
      );
      const details = sanitizeDetails(input.details);
      const record: AdminRequest = {
        ...property,
        id,
        type,
        priority:
          isAdmin && ["urgent", "high", "normal"].includes(input.priority)
            ? input.priority
            : "normal",
        status: "pending",
        createdAt: now,
        updatedAt: now,
        client: {
          name,
          email,
          phone: text(input.client?.phone, 50),
          preferredContact: "email",
        },
        details,
        notes: [],
        auditLog: [
          {
            action: "Request Created",
            actor: isAdmin ? "Staff" : "Visitor",
            timestamp: now,
          },
        ],
        replies: [],
      };
      await db.transaction(async (tx) => {
        await tx.insert(conversations).values({
          id,
          ownerId: isAdmin ? null : user!.id,
          recipientEmail: email,
          data: record,
        });
        if (direct) {
          const message = text(body.message, 10000);
          if (!message) throw new Error("empty-message");
          const reply: RequestReply = {
            id: crypto.randomUUID(),
            senderEmail: "contact@raywhiterealestate.com",
            senderName: "Ray White Team",
            recipientEmail: email,
            recipientName: name,
            subject: text(details.subject),
            message,
            sentAt: now,
          };
          await tx.insert(messages).values({
            id: reply.id,
            conversationId: id,
            direction: "staff",
            data: reply,
          });
        }
      });
      return json({ id }, 201);
    }
    const id = text(body.id, 100);
    const [row] = await db
      .select()
      .from(conversations)
      .where(
        and(eq(conversations.id, id), isAdmin ? undefined : ownerCondition),
      );
    if (!row) return json({ error: "Conversation not found." }, 404);
    if (action === "reply") {
      const message = text(body.message, 10000);
      if (!message) return json({ error: "Enter a message." }, 400);
      const now = new Date().toISOString();
      const reply: RequestReply = {
        id: crypto.randomUUID(),
        senderName: isAdmin
          ? "Ray White Team"
          : user!.name || row.data.client.name,
        senderEmail: isAdmin ? "contact@raywhiterealestate.com" : user!.email!,
        recipientEmail: isAdmin
          ? row.recipientEmail
          : "contact@raywhiterealestate.com",
        recipientName: isAdmin ? row.data.client.name : "Ray White Team",
        subject: row.data.details.subject,
        message,
        sentAt: now,
      };
      await db.transaction(async (tx) => {
        await tx.insert(messages).values({
          id: reply.id,
          conversationId: id,
          direction: isAdmin ? "staff" : "visitor",
          data: reply,
        });
        await tx
          .update(conversations)
          .set({
            data: sql`${conversations.data} || ${JSON.stringify({ updatedAt: now, ...(!isAdmin ? { status: "pending" } : {}) })}::jsonb`,
          })
          .where(eq(conversations.id, id));
      });
      return json({ id: reply.id });
    }
    if (action === "read") {
      if (isAdmin) return json({ ok: true });
      await db
        .update(messages)
        .set({ readAt: new Date() })
        .where(
          and(
            eq(messages.conversationId, id),
            eq(messages.direction, "staff"),
            body.replyId ? eq(messages.id, text(body.replyId, 100)) : undefined,
          ),
        );
      return json({ ok: true });
    }
    if (!isAdmin) return json({ error: "Staff access required." }, 403);
    if (action === "delete") {
      await db.delete(conversations).where(eq(conversations.id, id));
      return json({ ok: true });
    }
    if (action === "update") {
      const patch = body.patch || {};
      const allowed = [
        "status",
        "priority",
        "assignedAgentId",
        "assignedAgentName",
        "assignedAgentEmail",
        "assignedAgentAvatar",
        "approvalDetails",
        "rejectionDetails",
      ];
      const clean = Object.fromEntries(
        allowed
          .filter((k) => Object.hasOwn(patch, k))
          .map((k) => [k, patch[k]]),
      );
      if (
        clean.status &&
        !["pending", "approved", "declined", "completed"].includes(clean.status)
      )
        return json({ error: "Invalid status." }, 400);
      if (
        clean.priority &&
        !["normal", "high", "urgent"].includes(clean.priority)
      )
        return json({ error: "Invalid priority." }, 400);
      await db
        .update(conversations)
        .set({
          data: sql`${conversations.data} || ${JSON.stringify({ ...clean, updatedAt: new Date().toISOString() })}::jsonb`,
        })
        .where(eq(conversations.id, id));
      return json({ ok: true });
    }
    if (action === "note") {
      const note = text(body.note, 5000);
      if (!note) return json({ error: "Enter a note." }, 400);
      const item = {
        id: crypto.randomUUID(),
        author: "Staff",
        text: note,
        createdAt: new Date().toISOString(),
      };
      await db
        .update(conversations)
        .set({
          data: sql`jsonb_set(${conversations.data}, '{notes}', COALESCE(${conversations.data}->'notes', '[]'::jsonb) || ${JSON.stringify([item])}::jsonb)`,
        })
        .where(eq(conversations.id, id));
      return json({ ok: true });
    }
    return json({ error: "Unknown action." }, 400);
  } catch {
    return json(
      { error: "Unable to connect to the message service. Please try again." },
      503,
    );
  }
};
