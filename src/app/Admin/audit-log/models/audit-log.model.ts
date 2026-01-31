export interface AuditLog {
  id: number;
  actorUserId: number;
  userName: string | null;
  actorRole: string | null;
  entityType: string | null;
  entityId: number;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  oldValues: string | null;
  newValues: string | null;
  createdAt: string;
  ipAddress: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
}