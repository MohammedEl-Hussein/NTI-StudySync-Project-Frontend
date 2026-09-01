export interface SupportTicketUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
}

export interface SupportTicket {
  _id?: string;
  id?: string;
  userId?: SupportTicketUser | string;
  userName?: string;
  userEmail?: string;
  type: string;
  subject: string;
  content: string;
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateSupportTicketDto {
  type: string;
  subject: string;
  content: string;
}
