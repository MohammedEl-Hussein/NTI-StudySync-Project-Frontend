import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { SupportMessage } from '../../../core/models/admin.model';

@Component({
  selector: 'app-admin-support-details',
  templateUrl: './admin-support-details.component.html',
  styleUrls: ['./admin-support-details.component.css']
})
export class AdminSupportDetailsComponent implements OnInit {
  ticket: SupportMessage | null = null;
  ticketId: string = '';
  loading: boolean = true;
  updatingStatus: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.ticketId = this.route.snapshot.paramMap.get('id') || '';
    if (this.ticketId) {
      this.loadTicket(this.ticketId);
    } else {
      this.loading = false;
    }
  }

  loadTicket(id: string): void {
    this.loading = true;
    this.adminService.getSupportMessageById(id).subscribe({
      next: (data) => {
        this.ticket = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching support ticket details:', err);
        this.loading = false;
      }
    });
  }

  changeStatus(newStatus: 'pending' | 'in_progress' | 'resolved'): void {
    if (!this.ticket || !this.ticketId) return;

    this.updatingStatus = true;
    this.adminService.updateSupportStatus(this.ticketId, newStatus).subscribe({
      next: (updated) => {
        if (this.ticket) {
          this.ticket.status = newStatus;
        }
        this.updatingStatus = false;
        alert(`Ticket status updated to "${newStatus}".`);
      },
      error: (err) => {
        console.error('Error updating status:', err);
        alert('Failed to update ticket status.');
        this.updatingStatus = false;
      }
    });
  }

  getUserName(): string {
    if (!this.ticket) return '';
    if (typeof this.ticket.userId === 'object' && this.ticket.userId?.name) {
      return this.ticket.userId.name;
    }
    return this.ticket.userName || 'Student User';
  }

  getUserEmail(): string {
    if (!this.ticket) return '';
    if (typeof this.ticket.userId === 'object' && this.ticket.userId?.email) {
      return this.ticket.userId.email;
    }
    return this.ticket.userEmail || '';
  }

  goBack(): void {
    this.router.navigate(['/admin/support']);
  }
}
