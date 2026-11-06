import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CheckCheck,
  Inbox,
  LogOut,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  X,
} from "lucide-react";
import { useRequests } from "../context/RequestContext";

interface ReplyPortalProps {
  onBackToSite: () => void;
  onNavigateToProperty?: (id: string) => void;
}
export const ReplyPortal: React.FC<ReplyPortalProps> = ({
  onBackToSite,
  onNavigateToProperty,
}) => {
  const {
    requests,
    visitor,
    isAdminAuthenticated: admin,
    openAccount,
    logoutVisitor,
    sendReply,
    addRequest,
    sendDirectMessage,
    readReplyIds,
    inboxRequestId,
    markReplyAsRead,
    markAllRepliesAsRead,
    visitorUnreadReplyCount,
    loading,
    refresh,
    error,
  } = useRequests();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(inboxRequestId);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [compose, setCompose] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [mobileDetail, setMobileDetail] = useState(!!inboxRequestId);
  useEffect(() => {
    if (inboxRequestId) {
      setSelected(inboxRequestId);
      setMobileDetail(true);
    }
  }, [inboxRequestId]);
  const visible = useMemo(
    () =>
      requests
        .filter((r) =>
          `${r.client.name} ${r.client.email} ${r.details.subject || ""} ${r.propertyAddress || ""} ${r.details.message || ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [requests, query],
  );
  useEffect(() => {
    if (!selected && visible[0]) setSelected(visible[0].id);
  }, [selected, visible]);
  const thread = selected ? visible.find((r) => r.id === selected) : visible[0];
  const unread = (r: (typeof requests)[number]) =>
    !admin &&
    r.replies?.some(
      (m) => m.direction === "staff" && !readReplyIds.includes(m.id),
    );
  const unreadIds =
    !admin && thread
      ? (thread.replies || [])
          .filter(
            (m) => m.direction === "staff" && !readReplyIds.includes(m.id),
          )
          .map((m) => m.id)
          .join(",")
      : "";
  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches || mobileDetail)
      unreadIds.split(",").filter(Boolean).forEach(markReplyAsRead);
  }, [unreadIds, mobileDetail, markReplyAsRead]);
  async function reply(e: React.FormEvent) {
    e.preventDefault();
    if (!thread || !draft.trim() || busy) return;
    setBusy(true);
    const ok = await sendReply(thread.id, draft.trim());
    if (ok) {
      setDraft("");
      setNotice(
        admin
          ? "Reply delivered to the visitor’s inbox."
          : "Message sent to the Ray White team.",
      );
    }
    setBusy(false);
  }
  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !message.trim()) return;
    setBusy(true);
    const id = admin
      ? await sendDirectMessage({
          recipientName,
          recipientEmail,
          subject,
          message,
        })
      : await addRequest({
          type: "contact",
          client: {
            name: visitor?.name || "Visitor",
            email: visitor?.email || "",
            phone: "",
          },
          details: { subject, message },
        });
    if (id) {
      setSelected(id);
      setCompose(false);
      setSubject("");
      setMessage("");
      setMobileDetail(true);
      setNotice("Conversation created. Replies appear here.");
    }
    setBusy(false);
  }
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-neutral-900">
      <button
        onClick={onBackToSite}
        className="flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 mb-8"
      >
        <ArrowLeft size={14} /> Back to the website
      </button>
      <div className="flex flex-wrap items-end justify-between gap-5 mb-8">
        <div>
          <p className="text-[10px] tracking-[.25em] uppercase font-bold text-neutral-500">
            Ray White / {admin ? "Staff correspondence" : "Your conversations"}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl mt-3">
            A direct line to our team<span className="text-amber-500">.</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-3">
            {admin
              ? "Reply to enquiries. Every response stays in the visitor’s private inbox."
              : "Your enquiries and replies, together in one private place."}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {visitor && !admin && (
            <button
              onClick={() => void logoutVisitor()}
              title="Sign out"
              className="p-3 border rounded-xl"
            >
              <LogOut size={18} />
            </button>
          )}
          {(visitor || admin) && (
            <button
              onClick={() => setCompose(true)}
              className="flex items-center gap-2 bg-[#FFD200] rounded-xl px-4 py-3 text-sm font-bold hover:bg-amber-300"
            >
              <Plus size={17} /> New message
            </button>
          )}
        </div>
      </div>
      {!visitor && !admin ? (
        <div className="border border-neutral-200 rounded-2xl bg-neutral-50 p-8 sm:p-16 max-w-3xl">
          <Inbox size={36} strokeWidth={1.2} />
          <h2 className="font-serif text-3xl mt-6">
            An inbox that follows you.
          </h2>
          <p className="text-neutral-500 text-sm leading-relaxed mt-3 max-w-md">
            Create an account or sign in to send a message and receive a
            notification when our team replies. Your conversations are available
            on every device.
          </p>
          <button
            onClick={openAccount}
            className="mt-7 px-5 py-3 bg-neutral-900 text-white rounded-lg font-bold text-sm flex gap-4 items-center"
          >
            Sign in / Create account
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <>
          <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 bg-neutral-950 text-white border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <Inbox size={18} className="text-[#FFD200]" />
                <span className="font-semibold text-sm">
                  {admin ? "Enquiry inbox" : visitor?.email}
                </span>
                {visitorUnreadReplyCount > 0 && (
                  <span className="text-xs bg-[#FFD200] text-neutral-900 px-2 py-0.5 rounded-full">
                    {visitorUnreadReplyCount} unread
                  </span>
                )}
              </div>
              <div className="flex gap-4">
                {!admin && (
                  <button
                    onClick={markAllRepliesAsRead}
                    className="text-xs text-neutral-300 flex gap-1 items-center"
                  >
                    <CheckCheck size={15} /> Mark all read
                  </button>
                )}
                <button
                  onClick={() => void refresh()}
                  aria-label="Refresh messages"
                  className="p-1"
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>
            <div className="grid md:grid-cols-[320px_1fr] min-h-[520px]">
              <aside
                className={`border-r border-neutral-200 ${mobileDetail ? "hidden md:block" : ""}`}
              >
                <label className="flex items-center gap-2 px-5 py-4 border-b border-neutral-100">
                  <Search size={16} className="text-neutral-400" />
                  <input
                    aria-label="Search conversations"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search conversations"
                    className="text-sm w-full outline-none"
                  />
                </label>
                <div className="max-h-[600px] overflow-y-auto">
                  {loading ? (
                    <div className="p-5 space-y-4 animate-pulse">
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className="h-20 rounded-lg bg-neutral-100"
                        />
                      ))}
                    </div>
                  ) : visible.length ? (
                    visible.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setSelected(r.id);
                          setDraft("");
                          setNotice("");
                          setMobileDetail(true);
                        }}
                        className={`block w-full text-left p-5 border-b border-neutral-100 transition-colors hover:bg-amber-50 ${thread?.id === r.id ? "bg-amber-50 border-l-[3px] border-l-amber-400" : "border-l-[3px] border-l-transparent"}`}
                      >
                        <div className="flex justify-between gap-2 items-center">
                          <span className="text-sm font-bold truncate">
                            {admin ? r.client.name : "Ray White Team"}
                          </span>
                          {unread(r) && (
                            <span
                              aria-label="Unread reply"
                              className="h-2 w-2 rounded-full bg-amber-500 shrink-0"
                            />
                          )}
                        </div>
                        <p className="text-xs mt-1.5 font-medium truncate">
                          {r.details.subject ||
                            r.propertyTitle ||
                            `${r.type} enquiry`}
                        </p>
                        <p className="text-xs mt-2 text-neutral-500 line-clamp-2">
                          {r.replies?.at(-1)?.message ||
                            r.details.message ||
                            "Property enquiry"}
                        </p>
                        <div className="flex justify-between mt-3 text-[10px] text-neutral-400">
                          <time>
                            {new Date(r.updatedAt).toLocaleDateString()}
                          </time>
                          <span className="uppercase tracking-wider">
                            {r.status}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="p-6 text-sm text-neutral-500">
                      {query
                        ? "No conversations match your search."
                        : "No messages yet. Start a conversation above."}
                    </p>
                  )}
                </div>
              </aside>
              <div
                className={`flex flex-col min-w-0 ${!mobileDetail ? "hidden md:flex" : ""}`}
              >
                {thread ? (
                  <>
                    <div className="px-5 sm:px-7 py-5 border-b border-neutral-100">
                      <button
                        onClick={() => setMobileDetail(false)}
                        className="md:hidden mb-4 text-sm flex gap-2 items-center"
                      >
                        <ArrowLeft size={15} /> All conversations
                      </button>
                      <h2 className="font-serif text-2xl">
                        {thread.details.subject ||
                          thread.propertyTitle ||
                          `${thread.type} enquiry`}
                      </h2>
                      <p className="text-xs text-neutral-500 mt-2">
                        {admin
                          ? `${thread.client.name} · ${thread.client.email}`
                          : "Ray White Team"}
                        {thread.propertyAddress
                          ? ` · ${thread.propertyAddress}`
                          : ""}
                      </p>
                      {thread.propertyId && onNavigateToProperty && (
                        <button
                          onClick={() =>
                            onNavigateToProperty(thread.propertyId!)
                          }
                          className="text-xs underline mt-2"
                        >
                          View property
                        </button>
                      )}
                    </div>
                    <div
                      className="flex-1 bg-neutral-50/60 p-5 sm:p-7 space-y-5 max-h-[550px] overflow-y-auto"
                      aria-label="Conversation messages"
                    >
                      <div className="max-w-[90%] rounded-xl border border-neutral-200 bg-white p-4">
                        <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                          {thread.client.name} · Original enquiry
                        </p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words mt-2">
                          {thread.details.message ||
                            `New ${thread.type} request${thread.propertyAddress ? ` for ${thread.propertyAddress}` : ""}.`}
                        </p>
                        <time className="text-[10px] text-neutral-400 block mt-3">
                          {new Date(thread.createdAt).toLocaleString()}
                        </time>
                      </div>
                      {thread.replies?.map((m) => (
                        <article
                          key={m.id}
                          className={`max-w-[90%] rounded-xl p-4 ${m.direction === "staff" ? "ml-auto bg-neutral-900 text-white" : "bg-white border border-neutral-200"}`}
                        >
                          <p
                            className={`text-[10px] uppercase tracking-wider font-bold ${m.direction === "staff" ? "text-amber-300" : "text-neutral-500"}`}
                          >
                            {m.senderName}
                          </p>
                          <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {m.message}
                          </p>
                          <time
                            className={`block mt-3 text-[10px] ${m.direction === "staff" ? "text-neutral-400" : "text-neutral-500"}`}
                          >
                            {new Date(m.sentAt).toLocaleString()}
                          </time>
                        </article>
                      ))}
                    </div>
                    <form
                      onSubmit={reply}
                      className="p-5 sm:px-7 border-t border-neutral-200"
                    >
                      <label
                        htmlFor="reply-message"
                        className="text-xs font-bold"
                      >
                        {admin
                          ? `Reply to ${thread.client.name}`
                          : "Send a follow-up"}
                      </label>
                      <textarea
                        id="reply-message"
                        required
                        maxLength={10000}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        rows={3}
                        className="mt-2 w-full resize-y border border-neutral-300 rounded-lg p-3 text-sm focus:outline-amber-400"
                        placeholder="Write your message…"
                      />
                      <div className="mt-3 flex flex-wrap justify-between items-center gap-3">
                        <p className="text-[11px] text-neutral-400 flex gap-1.5 items-center">
                          <Bell size={13} />{" "}
                          {admin
                            ? "Visitor receives an on-site reply notification."
                            : "Replies appear here while you’re signed in."}
                        </p>
                        <button
                          disabled={busy || !draft.trim()}
                          className="bg-[#FFD200] rounded-lg px-4 py-2.5 text-sm font-bold flex gap-2 items-center disabled:opacity-50"
                        >
                          <Send size={14} />
                          {busy ? "Sending…" : "Send message"}
                        </button>
                      </div>
                      {notice && (
                        <p
                          role="status"
                          className="text-xs text-emerald-700 mt-3"
                        >
                          {notice}
                        </p>
                      )}
                      {error && (
                        <p role="alert" className="text-xs text-red-700 mt-3">
                          {error}
                        </p>
                      )}
                    </form>
                  </>
                ) : (
                  <div className="m-auto p-12 text-center max-w-sm">
                    <MessageSquare
                      className="mx-auto text-neutral-300"
                      size={40}
                      strokeWidth={1}
                    />
                    <h2 className="font-serif text-2xl mt-5">
                      Room for a conversation.
                    </h2>
                    <p className="text-sm text-neutral-500 mt-3">
                      Select an enquiry or start a new message. Replies stay
                      right here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      {compose && (
        <div className="fixed inset-0 z-[100] bg-neutral-950/70 flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="compose-title"
            className="bg-white rounded-2xl max-w-lg w-full p-7 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between">
              <h2 id="compose-title" className="font-serif text-2xl">
                New conversation
              </h2>
              <button
                onClick={() => setCompose(false)}
                aria-label="Close new message"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={create} className="mt-5 space-y-4">
              {admin && (
                <>
                  <p className="text-xs text-neutral-500">
                    The recipient sees this message when they sign in with this
                    email address.
                  </p>
                  <label className="block text-xs font-bold">
                    Recipient name
                    <input
                      autoFocus
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="block mt-1 w-full border rounded-lg p-3 text-sm font-normal"
                    />
                  </label>
                  <label className="block text-xs font-bold">
                    Recipient email
                    <input
                      required
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="block mt-1 w-full border rounded-lg p-3 text-sm font-normal"
                    />
                  </label>
                </>
              )}
              <label className="block text-xs font-bold">
                Subject
                <input
                  autoFocus={!admin}
                  required
                  maxLength={200}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="block mt-1 w-full border rounded-lg p-3 text-sm font-normal"
                />
              </label>
              <label className="block text-xs font-bold">
                Message
                <textarea
                  required
                  maxLength={10000}
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="block mt-1 w-full border rounded-lg p-3 text-sm font-normal"
                />
              </label>
              {error && (
                <p role="alert" className="text-sm text-red-700">
                  {error}
                </p>
              )}
              <button
                disabled={busy}
                className="w-full bg-[#FFD200] rounded-lg py-3 font-bold disabled:opacity-50"
              >
                {busy ? "Sending…" : "Send message"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
