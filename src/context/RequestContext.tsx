import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminRequest, RequestPriority, RequestStatus, RequestType } from '../types/request';
import { INITIAL_REQUESTS } from '../data/mockRequests';
import { AGENTS, getAgentById } from '../data/agents';

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
  totalVolumeEstimate: number;
  addRequest: (newReq: Partial<AdminRequest> & { type: RequestType; client: AdminRequest['client'] }) => string;
  approveRequest: (id: string, payload?: ApprovePayload) => void;
  declineRequest: (id: string, reason: string, note?: string, actorName?: string) => void;
  completeRequest: (id: string, note?: string, actorName?: string) => void;
  assignAgent: (requestId: string, agentId: string, actorName?: string) => void;
  updatePriority: (requestId: string, priority: RequestPriority) => void;
  addNote: (requestId: string, noteText: string, author?: string) => void;
  deleteRequest: (id: string) => void;
  bulkApprove: (ids: string[], actorName?: string) => void;
  bulkDecline: (ids: string[], reason: string, actorName?: string) => void;
  resetToDefaults: () => void;
  isAdminAuthenticated: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
}

const STORAGE_KEY = 'raywhite_admin_requests_v1';

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const RequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<AdminRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved requests from localStorage, loading defaults.', e);
    }
    return INITIAL_REQUESTS;
  });

  // Admin authentication state with passcode 000333999
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('rw_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const loginAdmin = (password: string): boolean => {
    if (password.trim() === '000333999') {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('rw_admin_authenticated', 'true');
      } catch {}
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('rw_admin_authenticated');
    } catch {}
  };

  // Save to localStorage whenever requests change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    } catch (e) {
      console.warn('Failed to save requests to localStorage', e);
    }
  }, [requests]);

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const urgentCount = requests.filter((r) => r.status === 'pending' && r.priority === 'urgent').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;

  // Calculate estimated total pipeline volume
  const totalVolumeEstimate = requests.reduce((sum, req) => {
    if (req.details.offerAmount) return sum + req.details.offerAmount;
    if (req.details.estimatedValueRange?.median) return sum + req.details.estimatedValueRange.median;
    return sum;
  }, 0);

  const addRequest = (
    newReq: Partial<AdminRequest> & { type: RequestType; client: AdminRequest['client'] }
  ): string => {
    const timestamp = new Date().toISOString();
    const nextNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `REQ-2026-${nextNum}`;

    let assignedAgent = undefined;
    if (newReq.assignedAgentId) {
      const ag = getAgentById(newReq.assignedAgentId);
      assignedAgent = {
        assignedAgentId: ag.id,
        assignedAgentName: ag.name,
        assignedAgentEmail: ag.email,
        assignedAgentAvatar: ag.avatar,
      };
    }

    const created: AdminRequest = {
      id: newId,
      type: newReq.type,
      status: 'pending',
      priority: newReq.priority || 'normal',
      createdAt: timestamp,
      updatedAt: timestamp,
      client: newReq.client,
      propertyId: newReq.propertyId,
      propertyTitle: newReq.propertyTitle,
      propertyAddress: newReq.propertyAddress,
      propertySuburb: newReq.propertySuburb,
      propertyState: newReq.propertyState || 'NSW',
      propertyPrice: newReq.propertyPrice,
      propertyImage: newReq.propertyImage,
      details: newReq.details || {},
      ...assignedAgent,
      notes: newReq.notes || [],
      auditLog: [
        {
          action: 'Request Created',
          timestamp,
          actor: 'Website Form Submission',
          details: `Client ${newReq.client.name} submitted a new ${newReq.type} request.`,
        },
      ],
    };

    setRequests((prev) => [created, ...prev]);
    return newId;
  };

  const approveRequest = (id: string, payload?: ApprovePayload) => {
    const now = new Date().toISOString();
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== id) return req;

        let agentDetails = {};
        if (payload?.assignedAgentId) {
          const ag = getAgentById(payload.assignedAgentId);
          agentDetails = {
            assignedAgentId: ag.id,
            assignedAgentName: ag.name,
            assignedAgentEmail: ag.email,
            assignedAgentAvatar: ag.avatar,
          };
        }

        const actor = payload?.actorName || 'Executive Admin';
        const approvalEntry = {
          action: 'Request Approved',
          timestamp: now,
          actor,
          details: payload?.decisionNote
            ? `Approved: ${payload.decisionNote}`
            : 'Request approved and moved to active status.',
        };

        return {
          ...req,
          ...agentDetails,
          status: 'approved',
          updatedAt: now,
          approvalDetails: {
            approvedAt: now,
            approvedBy: actor,
            scheduledDateTime: payload?.scheduledDateTime,
            meetingLocation: payload?.meetingLocation,
            decisionNote: payload?.decisionNote,
          },
          auditLog: [approvalEntry, ...req.auditLog],
        };
      })
    );
  };

  const declineRequest = (id: string, reason: string, note?: string, actorName = 'Executive Admin') => {
    const now = new Date().toISOString();
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== id) return req;

        const declineEntry = {
          action: 'Request Declined',
          timestamp: now,
          actor: actorName,
          details: `Declined reason: ${reason}. ${note ? `Note: ${note}` : ''}`,
        };

        return {
          ...req,
          status: 'declined',
          updatedAt: now,
          rejectionDetails: {
            rejectedAt: now,
            rejectedBy: actorName,
            reason,
            rejectionNote: note,
          },
          auditLog: [declineEntry, ...req.auditLog],
        };
      })
    );
  };

  const completeRequest = (id: string, note?: string, actorName = 'Executive Admin') => {
    const now = new Date().toISOString();
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== id) return req;

        const completeEntry = {
          action: 'Request Completed',
          timestamp: now,
          actor: actorName,
          details: note || 'Request fulfilled and archived as completed.',
        };

        return {
          ...req,
          status: 'completed',
          updatedAt: now,
          auditLog: [completeEntry, ...req.auditLog],
        };
      })
    );
  };

  const assignAgent = (requestId: string, agentId: string, actorName = 'Executive Admin') => {
    const now = new Date().toISOString();
    const agent = getAgentById(agentId);

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;

        const assignEntry = {
          action: 'Assigned to Agent',
          timestamp: now,
          actor: actorName,
          details: `Assigned to ${agent.name} (${agent.office}).`,
        };

        return {
          ...req,
          assignedAgentId: agent.id,
          assignedAgentName: agent.name,
          assignedAgentEmail: agent.email,
          assignedAgentAvatar: agent.avatar,
          updatedAt: now,
          auditLog: [assignEntry, ...req.auditLog],
        };
      })
    );
  };

  const updatePriority = (requestId: string, priority: RequestPriority) => {
    const now = new Date().toISOString();
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;
        return {
          ...req,
          priority,
          updatedAt: now,
          auditLog: [
            {
              action: 'Priority Updated',
              timestamp: now,
              actor: 'Executive Admin',
              details: `Priority changed to ${priority.toUpperCase()}.`,
            },
            ...req.auditLog,
          ],
        };
      })
    );
  };

  const addNote = (requestId: string, noteText: string, author = 'Executive Admin') => {
    if (!noteText.trim()) return;
    const now = new Date().toISOString();
    const newNote = {
      id: `note-${Date.now()}`,
      author,
      text: noteText.trim(),
      createdAt: now,
    };

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;
        return {
          ...req,
          updatedAt: now,
          notes: [newNote, ...req.notes],
          auditLog: [
            {
              action: 'Note Appended',
              timestamp: now,
              actor: author,
              details: `Added note: "${noteText.slice(0, 40)}${noteText.length > 40 ? '...' : ''}"`,
            },
            ...req.auditLog,
          ],
        };
      })
    );
  };

  const deleteRequest = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const bulkApprove = (ids: string[], actorName = 'Executive Admin') => {
    const now = new Date().toISOString();
    setRequests((prev) =>
      prev.map((req) => {
        if (!ids.includes(req.id) || req.status === 'approved') return req;
        return {
          ...req,
          status: 'approved',
          updatedAt: now,
          approvalDetails: {
            approvedAt: now,
            approvedBy: actorName,
            decisionNote: 'Bulk approved via executive admin console.',
          },
          auditLog: [
            {
              action: 'Bulk Approved',
              timestamp: now,
              actor: actorName,
              details: 'Approved in batch operation.',
            },
            ...req.auditLog,
          ],
        };
      })
    );
  };

  const bulkDecline = (ids: string[], reason: string, actorName = 'Executive Admin') => {
    const now = new Date().toISOString();
    setRequests((prev) =>
      prev.map((req) => {
        if (!ids.includes(req.id) || req.status === 'declined') return req;
        return {
          ...req,
          status: 'declined',
          updatedAt: now,
          rejectionDetails: {
            rejectedAt: now,
            rejectedBy: actorName,
            reason,
            rejectionNote: 'Bulk declined.',
          },
          auditLog: [
            {
              action: 'Bulk Declined',
              timestamp: now,
              actor: actorName,
              details: `Declined in batch: ${reason}`,
            },
            ...req.auditLog,
          ],
        };
      })
    );
  };

  const resetToDefaults = () => {
    setRequests(INITIAL_REQUESTS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REQUESTS));
    } catch (e) {
      console.warn('Failed to reset requests in localStorage', e);
    }
  };

  return (
    <RequestContext.Provider
      value={{
        requests,
        pendingCount,
        urgentCount,
        approvedCount,
        completedCount,
        totalVolumeEstimate,
        addRequest,
        approveRequest,
        declineRequest,
        completeRequest,
        assignAgent,
        updatePriority,
        addNote,
        deleteRequest,
        bulkApprove,
        bulkDecline,
        resetToDefaults,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = (): RequestContextType => {
  const context = useContext(RequestContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
};
