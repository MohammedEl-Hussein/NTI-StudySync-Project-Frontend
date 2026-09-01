import { Component, OnInit } from '@angular/core';
import { SupportService } from '../../../services/support.service';
import { SupportTicket } from '../../../models/support.model';

@Component({
  selector: 'app-my-support-tickets',
  templateUrl: './my-support-tickets.component.html',
  styleUrls: ['./my-support-tickets.component.css']
})
export class MySupportTicketsComponent implements OnInit {
  tickets: SupportTicket[] = [];
  isLoading: boolean = true;
  error: string = '';
  statusFilter: string = 'all';
  searchQuery: string = '';

  constructor(private supportService: SupportService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.isLoading = true;
    this.error = '';

    this.supportService.getMyTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching my support tickets:', err);
        this.isLoading = false;
        // Fallback to empty list or graceful state
        this.tickets = [];
      }
    });
  }

  get filteredTickets(): SupportTicket[] {
    let list = [...this.tickets];

    if (this.statusFilter !== 'all') {
      list = list.filter(t => t.status === this.statusFilter);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(t => {
        const subj = (t.subject || '').toLowerCase();
        const type = (t.type || '').toLowerCase();
        const id = (t._id || t.id || '').toLowerCase();
        return subj.includes(q) || type.includes(q) || id.includes(q);
      });
    }

    return list;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'resolved': return 'status-resolved';
      case 'in_progress': return 'status-in-progress';
      case 'pending': default: return 'status-pending';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'resolved': return 'Resolved';
      case 'in_progress': return 'In Review';
      case 'pending': default: return 'Pending';
    }
  }

  getPendingCount(): number {
    return this.tickets.filter(t => t.status === 'pending').length;
  }

  getInProgressCount(): number {
    return this.tickets.filter(t => t.status === 'in_progress').length;
  }

  getResolvedCount(): number {
    return this.tickets.filter(t => t.status === 'resolved').length;
  }
}
