import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupportService } from '../../../services/support.service';
import { SupportTicket } from '../../../models/support.model';

@Component({
  selector: 'app-support-ticket-details',
  templateUrl: './support-ticket-details.component.html',
  styleUrls: ['./support-ticket-details.component.css']
})
export class SupportTicketDetailsComponent implements OnInit {
  ticketId: string = '';
  ticket: SupportTicket | null = null;
  isLoading: boolean = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supportService: SupportService
  ) {}

  ngOnInit(): void {
    this.ticketId = this.route.snapshot.paramMap.get('id') || '';
    if (this.ticketId) {
      this.loadTicketDetails(this.ticketId);
    } else {
      this.error = 'Ticket ID not specified.';
      this.isLoading = false;
    }
  }

  loadTicketDetails(id: string): void {
    this.isLoading = true;
    this.error = '';

    this.supportService.getTicketById(id).subscribe({
      next: (data) => {
        this.ticket = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading ticket details:', err);
        this.error = 'Could not find or load this support ticket.';
        this.isLoading = false;
      }
    });
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

  isStepActive(step: 'pending' | 'in_progress' | 'resolved'): boolean {
    if (!this.ticket) return false;
    const current = this.ticket.status;

    if (step === 'pending') return true;
    if (step === 'in_progress') return current === 'in_progress' || current === 'resolved';
    if (step === 'resolved') return current === 'resolved';
    return false;
  }

  goBack(): void {
    this.router.navigate(['/support']);
  }
}
