import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { SupportMessage } from '../../../core/models/admin.model';

@Component({
  selector: 'app-support-inbox',
  templateUrl: './support-inbox.component.html',
  styleUrls: ['./support-inbox.component.css']
})
export class SupportInboxComponent implements OnInit {
  tickets: SupportMessage[] = [];
  statusFilter: string = 'all';
  loading: boolean = true;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.adminService.getSupportMessages().subscribe({
      next: (data) => {
        this.tickets = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching support tickets:', err);
        this.loading = false;
      }
    });
  }

  get filteredTickets(): SupportMessage[] {
    if (this.statusFilter === 'all') {
      return this.tickets;
    }
    return this.tickets.filter((t) => t.status === this.statusFilter);
  }

  viewTicketDetails(ticket: SupportMessage): void {
    const id = ticket._id || ticket.id;
    if (id) {
      this.router.navigate(['/admin/support', id]);
    }
  }

  getUserName(ticket: SupportMessage): string {
    if (typeof ticket.userId === 'object' && ticket.userId?.name) {
      return ticket.userId.name;
    }
    return ticket.userName || 'Student User';
  }

  getUserEmail(ticket: SupportMessage): string {
    if (typeof ticket.userId === 'object' && ticket.userId?.email) {
      return ticket.userId.email;
    }
    return ticket.userEmail || '';
  }
}
