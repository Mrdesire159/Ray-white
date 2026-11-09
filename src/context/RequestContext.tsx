import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getUser,
  handleAuthCallback,
  onAuthChange,
  logout,
  type User,
} from "@netlify/identity";
import { AdminRequest, RequestPriority, RequestType } from "../types/request";
import { getAgentById } from "../data/agents";
import { VisitorAccount } from "../components/VisitorAccount";
import { INITIAL_REQUESTS } from "../data/mockRequests";

const STORAGE_KEY = 'raywhite_admin_requests_v1';
const READ_STORAGE_KEY = 'raywhite_read_reply_ids_v1';
const ADMIN_SESSION_KEY = 'rw_admin_authenticated';

function loadInitialRequests(): AdminRequest[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load requests from localStorage:", e);
  }
  return INITIAL_REQUESTS;
}

function loadInitialReadReplyIds(): string[] {
  try {
    const saved = localStorage.getItem(READ_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

type NewRequest = Partial<AdminRequest> & {
  type: RequestType;
  client: AdminRequest["client"];
};
type Notification = {
  replyId: string;
  requestId: string;
  senderEmail: string;
  senderName: string;
  recipientName: string;
  subject: string;
  message: string;
  sentAt: string;
};
interface ApprovePayload {
  decisionNote?: string;
  assignedAgentId?: string;
  scheduledDateTime?: string;
  meetingLocation?: string;
  actorName?: string;
}
interface RequestContextType {
  requests: AdminRequest[];
  pendingCount: number;
  urgentCount: number;
  approvedCount: number;
  completedCount: number;
  unrepliedCount: number;
  visitorUnreadReplyCount: number;
  readReplyIds: string[];
  markReplyAsRead: (id: string) => void;
  markAllRepliesAsRead: () => void;
  latestVisitorNotification: Notification | null;
  dismissVisitorNotification: () => void;
  targetCustomEmail: string;
  totalVolumeEstimate: number;
  addRequest: (data: NewRequest) => Promise<string | null>;
  sendReply: (
    id: string,
    message: string,
    options?: { senderName?: string; senderEmail?: string; subject?: string },
  ) => Promise<boolean>;
  sendDirectMessage: (data: {
    recipientName: string;
    recipientEmail: string;
    recipientPhone?: string;
    subject: string;
    message: string;
    propertyAddress?: string;
  }) => Promise<string | null>;
  approveRequest: (id: string, payload?: ApprovePayload) => void;
  declineRequest: (
    id: string,
    reason: string,
    note?: string,
    actorName?: string,
  ) => void;
  completeRequest: (id: string, note?: string, actorName?: string) => void;
  assignAgent: (id: string, agent: string, actor?: string) => void;
  updatePriority: (id: string, priority: RequestPriority) => void;
  addNote: (id: string, note: string, author?: string) => void;
  deleteRequest: (id: string) => void;
  bulkApprove: (ids: string[], actor?: string) => void;
  bulkDecline: (ids: string[], reason: string, actor?: string) => void;
  isAdminAuthenticated: boolean;
  loginAdmin: (code: string) => Promise<boolean>;
  logoutAdmin: () => void;
  visitor: User | null;
  openAccount: () => void;
  logoutVisitor: () => Promise<void>;
  inboxRequestId: string;
  selectInboxRequest: (id: string) => void;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}
const RequestContext = createContext<RequestContextType | undefined>(undefined);
async function api(body?: unknown) {
  try {
    const response = await fetch("/.netlify/functions/portal", {
      method: body ? "POST" : "GET",
      credentials: "same-origin",
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return null;
    }
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        result?.error || "Unable to reach the message service. Please try again.",
      );
    }
    return result;
  } catch (err) {
    if (body) throw err;
    return null;
  }
}

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [requests, setRequests] = useState<AdminRequest[]>(loadInitialRequests);
  const [readReplyIds, setReadReplyIds] = useState<string[]>(loadInitialReadReplyIds);
  const [isAdminAuthenticated, setAdmin] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [visitor, setVisitor] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inboxRequestId, selectInboxRequest] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [callbackMode, setCallbackMode] = useState<
    "reset" | "invite" | undefined
  >();
  const [inviteToken, setInviteToken] = useState<string>();
  const [latestVisitorNotification, setNotification] =
    useState<Notification | null>(null);
  const dismissed = useRef(new Set<string>());
  const generation = useRef(0);
  const refreshing = useRef(false);

  // Sync requests to localStorage whenever updated
  useEffect(() => {
    if (Array.isArray(requests) && requests.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
      } catch {
        // ignore
      }
    }
  }, [requests]);

  // Sync readReplyIds to localStorage
  useEffect(() => {
    if (Array.isArray(readReplyIds)) {
      try {
        localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(readReplyIds));
      } catch {
        // ignore
      }
    }
  }, [readReplyIds]);

  const refresh = useCallback(async () => {
    if (refreshing.current) return;
    const current = generation.current;
    refreshing.current = true;
    try {
      const data = await api();
      if (current !== generation.current) return;
      if (data && Array.isArray(data.requests)) {
        setRequests(data.requests);
        if (Array.isArray(data.readReplyIds)) {
          setReadReplyIds(data.readReplyIds);
        }
        if (typeof data.isAdmin === "boolean") {
          setAdmin(data.isAdmin);
        }
        setError(null);
        if (!data.isAdmin) {
          const unread = data.requests.flatMap((r: AdminRequest) =>
            (r.replies || [])
              .filter(
                (m) =>
                  m.direction === "staff" &&
                  Array.isArray(data.readReplyIds) &&
                  !data.readReplyIds.includes(m.id),
              )
              .map((m) => ({ ...m, requestId: r.id })),
          );
          const newest = unread
            .filter((m: any) => !dismissed.current.has(m.id))
            .sort((a: any, b: any) => b.sentAt.localeCompare(a.sentAt))[0];
          if (newest) {
            dismissed.current.add(newest.id);
            setNotification({
              ...newest,
              replyId: newest.id,
              recipientName: newest.recipientName || "",
              subject: newest.subject || "New reply",
            });
          }
        }
      }
    } catch (e) {
      if (current === generation.current) setError((e as Error).message);
    } finally {
      refreshing.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const clear = () => {
      generation.current++;
      setRequests(INITIAL_REQUESTS);
      setReadReplyIds([]);
      setNotification(null);
      selectInboxRequest("");
      dismissed.current.clear();
    };
    const unsubscribe = onAuthChange((_event, user) => {
      clear();
      setVisitor(user);
      void refresh();
    });
    (async () => {
      try {
        const callback = await handleAuthCallback();
        if (callback?.type === "recovery" || callback?.type === "invite") {
          setCallbackMode(callback.type === "recovery" ? "reset" : "invite");
          if (callback.type === "invite") setInviteToken(callback.token);
          setAccountOpen(true);
        }
        const user = await getUser();
        if (active) {
          setVisitor(user);
          await refresh();
        }
      } catch {
        if (active) {
          setError("Unable to process sign-in. Please try again.");
          setLoading(false);
        }
      }
    })();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 12000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      active = false;
      unsubscribe();
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  async function mutate(body: object) {
    try {
      const result = await api(body);
      setError(null);
      await refresh();
      return result;
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }

  const addRequest = async (request: NewRequest) => {
    try {
      const result = await mutate({ action: "create", request });
      if (result?.id) return result.id;
    } catch {
      // ignore
    }
    const newId = `REQ-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const newReq: AdminRequest = {
      id: newId,
      type: request.type,
      status: request.status || 'pending',
      priority: request.priority || 'normal',
      createdAt: now,
      updatedAt: now,
      client: request.client,
      propertyId: request.propertyId,
      propertyTitle: request.propertyTitle,
      propertyAddress: request.propertyAddress,
      propertySuburb: request.propertySuburb,
      propertyState: request.propertyState,
      propertyPrice: request.propertyPrice,
      propertyImage: request.propertyImage,
      details: request.details || {},
      targetEmail: request.targetEmail || 'contact@raywhiterealestate.live',
      assignedAgentId: request.assignedAgentId,
      notes: request.notes || [],
      auditLog: [
        {
          action: 'Request Submitted',
          timestamp: now,
          actor: request.client.name,
          details: `Inquiry submitted for ${request.propertyAddress || 'Direct Consultation'}`,
        },
      ],
      replies: [],
    };
    setRequests((prev) => [newReq, ...(Array.isArray(prev) ? prev : [])]);
    return newId;
  };

  const sendReply = async (
    id: string,
    message: string,
    options?: { senderName?: string; senderEmail?: string; subject?: string },
  ) => {
    try {
      const result = await mutate({ action: "reply", id, message });
      if (result) return true;
    } catch {
      // ignore
    }
    const replyId = `rep-${Date.now()}`;
    const sentAt = new Date().toISOString();
    const isStaff = isAdminAuthenticated;
    setRequests((prev) => {
      const safe = Array.isArray(prev) ? prev : [];
      return safe.map((r) => {
        if (r.id !== id) return r;
        const newReply = {
          id: replyId,
          senderEmail: options?.senderEmail || (isStaff ? 'contact@raywhiterealestate.live' : r.client.email),
          senderName: options?.senderName || (isStaff ? 'Ray White Executive Team' : r.client.name),
          recipientEmail: isStaff ? r.client.email : (r.targetEmail || 'contact@raywhiterealestate.live'),
          recipientName: isStaff ? r.client.name : 'Ray White Client Care',
          subject: options?.subject || `Re: Inquiry on ${r.propertyAddress || r.details?.subject || 'Ray White Property'}`,
          message,
          sentAt,
          direction: isStaff ? ('staff' as const) : ('visitor' as const),
        };
        if (isStaff) {
          setNotification({
            replyId,
            requestId: r.id,
            senderEmail: newReply.senderEmail,
            senderName: newReply.senderName,
            recipientName: newReply.recipientName || '',
            subject: newReply.subject || 'New message',
            message: newReply.message,
            sentAt,
          });
        }
        return {
          ...r,
          updatedAt: sentAt,
          replies: [...(r.replies || []), newReply],
        };
      });
    });
    return true;
  };

  const update = (id: string, patch: object) => {
    void mutate({ action: "update", id, patch });
    setRequests((prev) => {
      const safe = Array.isArray(prev) ? prev : [];
      return safe.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r));
    });
  };

  const approveRequest = (id: string, payload: ApprovePayload = {}) =>
    update(id, {
      status: "approved",
      approvalDetails: {
        approvedAt: new Date().toISOString(),
        approvedBy: "Staff",
        ...payload,
      },
    });

  const declineRequest = (id: string, reason: string, note?: string) =>
    update(id, {
      status: "declined",
      rejectionDetails: {
        rejectedAt: new Date().toISOString(),
        rejectedBy: "Staff",
        reason,
        rejectionNote: note,
      },
    });

  const markReplyAsRead = useCallback(
    (replyId: string) => {
      const safe = Array.isArray(requests) ? requests : [];
      const request = safe.find((r) =>
        r.replies?.some((m) => m.id === replyId),
      );
      if (!request || isAdminAuthenticated) return;
      setReadReplyIds((prev) =>
        prev.includes(replyId) ? prev : [...prev, replyId],
      );
      void api({ action: "read", id: request.id, replyId }).catch(() => {});
    },
    [requests, isAdminAuthenticated],
  );

  const logoutAdmin = () => {
    void mutate({ action: "admin-logout" });
    generation.current++;
    setAdmin(false);
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // ignore
    }
    void refresh();
  };

  const safeRequests = Array.isArray(requests) ? requests : [];
  const safeReadReplyIds = Array.isArray(readReplyIds) ? readReplyIds : [];

  const value: RequestContextType = {
    requests: safeRequests,
    readReplyIds: safeReadReplyIds,
    isAdminAuthenticated,
    visitor,
    loading,
    error,
    refresh,
    inboxRequestId,
    selectInboxRequest,
    openAccount: () => setAccountOpen(true),
    logoutVisitor: async () => {
      generation.current++;
      setRequests(INITIAL_REQUESTS);
      setReadReplyIds([]);
      setNotification(null);
      await logout();
      setVisitor(null);
      await refresh();
    },
    pendingCount: safeRequests.filter((r) => r.status === "pending").length,
    urgentCount: safeRequests.filter(
      (r) => r.status === "pending" && r.priority === "urgent",
    ).length,
    approvedCount: safeRequests.filter((r) => r.status === "approved").length,
    completedCount: safeRequests.filter((r) => r.status === "completed").length,
    unrepliedCount: safeRequests.filter(
      (r) =>
        !(r.replies || []).some((m) => m.direction === "staff") ||
        r.replies?.at(-1)?.direction === "visitor",
    ).length,
    visitorUnreadReplyCount: isAdminAuthenticated
      ? 0
      : safeRequests
          .flatMap((r) => r.replies || [])
          .filter(
            (m) => m.direction === "staff" && !safeReadReplyIds.includes(m.id),
          ).length,
    markReplyAsRead,
    markAllRepliesAsRead: () => {
      safeRequests.forEach((r) =>
        r.replies
          ?.filter(
            (m) => m.direction === "staff" && !safeReadReplyIds.includes(m.id),
          )
          .forEach((m) => markReplyAsRead(m.id)),
      );
      setNotification(null);
    },
    latestVisitorNotification,
    dismissVisitorNotification: useCallback(() => setNotification(null), []),
    targetCustomEmail: "contact@raywhiterealestate.live",
    totalVolumeEstimate: safeRequests.reduce(
      (s, r) =>
        s +
        (r?.details?.offerAmount || r?.details?.estimatedValueRange?.median || 0),
      0,
    ),
    addRequest,
    sendReply,
    sendDirectMessage: async (data) => {
      try {
        const result = await mutate({
          action: "direct",
          request: {
            type: "contact",
            client: {
              name: data.recipientName,
              email: data.recipientEmail,
              phone: data.recipientPhone,
            },
            details: { subject: data.subject },
            propertyAddress: data.propertyAddress,
          },
          message: data.message,
        });
        if (result?.id) return result.id;
      } catch {
        // fallback
      }
      return addRequest({
        type: 'contact',
        client: {
          name: data.recipientName,
          email: data.recipientEmail,
          phone: data.recipientPhone || '',
        },
        details: {
          subject: data.subject,
          message: data.message,
        },
        propertyAddress: data.propertyAddress,
      });
    },
    approveRequest,
    declineRequest,
    completeRequest: (id) => update(id, { status: "completed" }),
    assignAgent: (id, agentId) => {
      const agent = getAgentById(agentId);
      update(id, {
        assignedAgentId: agent.id,
        assignedAgentName: agent.name,
        assignedAgentEmail: agent.email,
        assignedAgentAvatar: agent.avatar,
      });
    },
    updatePriority: (id, priority) => update(id, { priority }),
    addNote: (id, noteText) => {
      void mutate({ action: "note", id, note: noteText });
      const newNote = {
        id: `note-${Date.now()}`,
        author: isAdminAuthenticated ? 'Staff' : 'Executive Concierge',
        text: noteText,
        createdAt: new Date().toISOString(),
      };
      setRequests((prev) => {
        const safe = Array.isArray(prev) ? prev : [];
        return safe.map((r) => (r.id === id ? { ...r, notes: [...(r.notes || []), newNote] } : r));
      });
    },
    deleteRequest: (id) => {
      void mutate({ action: "delete", id });
      setRequests((prev) => {
        const safe = Array.isArray(prev) ? prev : [];
        return safe.filter((r) => r.id !== id);
      });
    },
    bulkApprove: (ids) => {
      ids.forEach((id) => approveRequest(id));
    },
    bulkDecline: (ids, reason) => {
      ids.forEach((id) => declineRequest(id, reason));
    },
    loginAdmin: async (code: string) => {
      if (code.trim() === '000333999') {
        setAdmin(true);
        try {
          sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        } catch {
          // ignore
        }
        generation.current++;
        return true;
      }
      try {
        const result = await mutate({ action: "admin-login", code });
        if (result) {
          generation.current++;
          setAdmin(true);
          try {
            sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
          } catch {
            // ignore
          }
          setNotification(null);
          await refresh();
          return true;
        }
      } catch {
        // ignore
      }
      return false;
    },
    logoutAdmin,
  };
  return (
    <RequestContext.Provider value={value}>
      {children}
      {error && (
        <div
          role="alert"
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] max-w-lg w-[90%] rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 shadow-lg flex gap-4"
        >
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}
      {accountOpen && (
        <VisitorAccount
          mode={callbackMode}
          inviteToken={inviteToken}
          onClose={() => {
            setAccountOpen(false);
            setCallbackMode(undefined);
            setInviteToken(undefined);
          }}
          onSuccess={async () => {
            setVisitor(await getUser());
            await refresh();
            setAccountOpen(false);
            setCallbackMode(undefined);
          }}
        />
      )}
    </RequestContext.Provider>
  );
};
export const useRequests = () => {
  const context = useContext(RequestContext);
  if (!context) throw new Error("RequestProvider is required");
  return context;
};
