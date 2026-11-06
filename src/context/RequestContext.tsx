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
  const response = await fetch("/.netlify/functions/portal", {
    method: body ? "POST" : "GET",
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      result.error || "Unable to reach the message service. Please try again.",
    );
  return result;
}
export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [readReplyIds, setReadReplyIds] = useState<string[]>([]);
  const [isAdminAuthenticated, setAdmin] = useState(false);
  const [visitor, setVisitor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
  const refresh = useCallback(async () => {
    if (refreshing.current) return;
    const current = generation.current;
    refreshing.current = true;
    try {
      const data = await api();
      if (current !== generation.current) return;
      setRequests(data.requests);
      setReadReplyIds(data.readReplyIds);
      setAdmin(data.isAdmin);
      setError(null);
      if (!data.isAdmin) {
        const unread = data.requests.flatMap((r: AdminRequest) =>
          (r.replies || [])
            .filter(
              (m) =>
                m.direction === "staff" && !data.readReplyIds.includes(m.id),
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
      setRequests([]);
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
    if (!visitor && !isAdminAuthenticated) {
      setAccountOpen(true);
      return null;
    }
    const result = await mutate({ action: "create", request });
    return result?.id || null;
  };
  const sendReply = async (id: string, message: string) =>
    !!(await mutate({ action: "reply", id, message }));
  const update = (id: string, patch: object) => {
    void mutate({ action: "update", id, patch });
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
      const request = requests.find((r) =>
        r.replies?.some((m) => m.id === replyId),
      );
      if (!request || isAdminAuthenticated) return;
      setReadReplyIds((prev) =>
        prev.includes(replyId) ? prev : [...prev, replyId],
      );
      void api({ action: "read", id: request.id, replyId }).catch((e) => {
        setError(e.message);
        void refresh();
      });
    },
    [requests, isAdminAuthenticated, refresh],
  );
  const logoutAdmin = () => {
    void (async () => {
      const result = await mutate({ action: "admin-logout" });
      if (result) {
        generation.current++;
        setAdmin(false);
        setRequests([]);
        await refresh();
      }
    })();
  };
  const value: RequestContextType = {
    requests,
    readReplyIds,
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
      setRequests([]);
      setReadReplyIds([]);
      setNotification(null);
      await logout();
      setVisitor(null);
      await refresh();
    },
    pendingCount: requests.filter((r) => r.status === "pending").length,
    urgentCount: requests.filter(
      (r) => r.status === "pending" && r.priority === "urgent",
    ).length,
    approvedCount: requests.filter((r) => r.status === "approved").length,
    completedCount: requests.filter((r) => r.status === "completed").length,
    unrepliedCount: requests.filter(
      (r) =>
        !(r.replies || []).some((m) => m.direction === "staff") ||
        r.replies?.at(-1)?.direction === "visitor",
    ).length,
    visitorUnreadReplyCount: isAdminAuthenticated
      ? 0
      : requests
          .flatMap((r) => r.replies || [])
          .filter(
            (m) => m.direction === "staff" && !readReplyIds.includes(m.id),
          ).length,
    markReplyAsRead,
    markAllRepliesAsRead: () => {
      requests.forEach((r) =>
        r.replies
          ?.filter(
            (m) => m.direction === "staff" && !readReplyIds.includes(m.id),
          )
          .forEach((m) => markReplyAsRead(m.id)),
      );
      setNotification(null);
    },
    latestVisitorNotification,
    dismissVisitorNotification: useCallback(() => setNotification(null), []),
    targetCustomEmail: "contact@raywhiterealestate.com",
    totalVolumeEstimate: requests.reduce(
      (s, r) =>
        s +
        (r.details.offerAmount || r.details.estimatedValueRange?.median || 0),
      0,
    ),
    addRequest,
    sendReply,
    sendDirectMessage: async (data) => {
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
      return result?.id || null;
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
    addNote: (id, note) => {
      void mutate({ action: "note", id, note });
    },
    deleteRequest: (id) => {
      void mutate({ action: "delete", id });
    },
    bulkApprove: (ids) => {
      ids.forEach((id) => approveRequest(id));
    },
    bulkDecline: (ids, reason) => {
      ids.forEach((id) => declineRequest(id, reason));
    },
    loginAdmin: async (code) => {
      const result = await mutate({ action: "admin-login", code });
      if (!result) return false;
      generation.current++;
      setAdmin(true);
      setNotification(null);
      await refresh();
      return true;
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
