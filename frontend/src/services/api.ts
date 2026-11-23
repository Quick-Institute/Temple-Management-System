// Centralized API Client for Temple Management System
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ApiFamilyRecord {
  id: string;
  familyCode: string;
  templeId: string;
  templeName?: string;
  templeCode?: string;
  firstName: string;
  lastName: string;
  name: string;
  alias?: string;
  nic: string;
  email?: string;
  phone: string;
  address: string;
  village: string;
  district: string;
  postalCode?: string;
  ward: string;
  status: string;
  enrollmentMode: string;
  enrollmentType: string;
  certificateNumber?: string;
  familyQrPass?: string;
  deactivateReason?: string;
  deactivateNotes?: string;
  danaTurnNotes?: string;
  clericalNotes?: string;
  members?: Array<{ id?: string; name: string; role: string; age?: number; gender?: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiUserRecord {
  id: number;
  templeId?: string;
  templeName?: string;
  templeCode?: string;
  firstName: string;
  lastName: string;
  name: string;
  alias?: string;
  email: string;
  phone?: string;
  nic?: string;
  committeeName: string;
  customCommitteeName?: string;
  designation: string;
  customDesignation?: string;
  role: string;
  status: string;
  isPermanent: boolean;
  avatar?: string;
  avatarBg?: string;
  avatarColor?: string;
  permFamily: boolean;
  permDana: boolean;
  permNotices: boolean;
  permFinance: boolean;
  deactivateReason?: string;
  deactivateNotes?: string;
  deactivatedAt?: string;
}

export interface DuplicateCheckResult {
  duplicate: boolean;
  matchType?: string;
  name?: string;
  familyCode?: string;
  phone?: string;
  templeName?: string;
  templeCode?: string;
  village?: string;
  message?: string;
}

// Generic Fetch Wrapper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;

  if (!response.ok) {
    const errorMsg = (data?.message as string) || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    throw error;
  }

  return data as T;
}

// ==========================================
// FAMILIES API (FR-23, FR-31, FR-37, FR-16, FR-35, FR-36)
// ==========================================
export const familiesApi = {
  checkDuplicate: (params: { nic?: string; phone?: string; email?: string }) => {
    const searchParams = new URLSearchParams();
    if (params.nic) searchParams.append('nic', params.nic);
    if (params.phone) searchParams.append('phone', params.phone);
    if (params.email) searchParams.append('email', params.email);
    return request<DuplicateCheckResult>(`/families/check-duplicate?${searchParams.toString()}`);
  },

  getAll: (params?: { q?: string; ward?: string; status?: string; templeCode?: string; templeName?: string; templeId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.append('q', params.q);
    if (params?.ward) searchParams.append('ward', params.ward);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.templeCode) searchParams.append('templeCode', params.templeCode);
    if (params?.templeName) searchParams.append('templeName', params.templeName);
    if (params?.templeId) searchParams.append('templeId', params.templeId);
    return request<{ success: boolean; count: number; data: ApiFamilyRecord[] }>(`/families?${searchParams.toString()}`);
  },

  getById: (id: string) => {
    return request<{ success: boolean; data: ApiFamilyRecord }>(`/families/${encodeURIComponent(id)}`);
  },

  create: (data: Record<string, unknown>) => {
    return request<{ success: boolean; message: string; data: ApiFamilyRecord }>('/families', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: Record<string, unknown>) => {
    return request<{ success: boolean; message: string }>(`/families/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateStatus: (id: string, data: { status: string; deactivateReason?: string; deactivateNotes?: string }) => {
    return request<{ success: boolean; message: string }>(`/families/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  transfer: (id: string, data: Record<string, unknown>) => {
    return request<{ success: boolean; message: string; certificateNumber?: string }>(
      `/families/${encodeURIComponent(id)}/transfer`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  delete: (id: string) => {
    return request<{ success: boolean; message: string }>(`/families/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  getTempleQr: (templeCode: string) => {
    return request<{ success: boolean; templeCode: string; templeName: string; qrUrl: string; flyerTitle: string }>(
      `/families/temple-qr/${encodeURIComponent(templeCode)}`
    );
  },
};

// ==========================================
// USERS & ROLES API (FR-01, FR-08, FR-09, FR-16)
// ==========================================
export const usersApi = {
  getAll: (params?: { q?: string; committee?: string; status?: string; templeCode?: string; templeName?: string; templeId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.append('q', params.q);
    if (params?.committee) searchParams.append('committee', params.committee);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.templeCode) searchParams.append('templeCode', params.templeCode);
    if (params?.templeName) searchParams.append('templeName', params.templeName);
    if (params?.templeId) searchParams.append('templeId', params.templeId);
    return request<{ success: boolean; count: number; data: ApiUserRecord[] }>(`/users?${searchParams.toString()}`);
  },

  getById: (id: number | string) => {
    return request<{ success: boolean; data: ApiUserRecord }>(`/users/${id}`);
  },

  create: (data: Record<string, unknown>) => {
    return request<{ success: boolean; message: string; data: ApiUserRecord }>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: number | string, data: Record<string, unknown>) => {
    return request<{ success: boolean; message: string; data: ApiUserRecord }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  updateStatus: (id: number | string, data: { status: string; deactivateReason?: string; deactivateNotes?: string }) => {
    return request<{ success: boolean; message: string; data: ApiUserRecord }>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: (id: number | string) => {
    return request<{ success: boolean; message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==========================================
// AUDIT LOGS API (FR-14)
// ==========================================
export const auditApi = {
  getAll: (params?: { targetType?: string; action?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.targetType) searchParams.append('targetType', params.targetType);
    if (params?.action) searchParams.append('action', params.action);
    if (params?.limit) searchParams.append('limit', String(params.limit));
    return request<{ success: boolean; count: number; data: Record<string, unknown>[] }>(`/audit-logs?${searchParams.toString()}`);
  },
};
