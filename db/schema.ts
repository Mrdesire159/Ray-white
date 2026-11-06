import {
  pgTable,
  text,
  jsonb,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";
import type { AdminRequest, RequestReply } from "../src/types/request.js";

export const conversations = pgTable(
  "conversations",
  {
    id: text().primaryKey(),
    ownerId: text("owner_id"),
    recipientEmail: text("recipient_email").notNull(),
    data: jsonb().$type<AdminRequest>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index("conversations_owner_idx").on(t.ownerId),
    index("conversations_email_idx").on(t.recipientEmail),
  ],
);
export const messages = pgTable(
  "conversation_messages",
  {
    id: text().primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    direction: text().notNull(),
    data: jsonb().$type<RequestReply>().notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("messages_conversation_idx").on(t.conversationId)],
);
export const adminSessions = pgTable("admin_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
export const adminAttempts = pgTable("admin_attempts", {
  key: text().primaryKey(),
  attempts: integer().notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
