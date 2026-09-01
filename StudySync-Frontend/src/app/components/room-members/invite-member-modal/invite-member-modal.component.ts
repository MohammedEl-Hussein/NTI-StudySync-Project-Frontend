import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-invite-member-modal',
  templateUrl: './invite-member-modal.component.html',
  styleUrls: ['./invite-member-modal.component.css']
})
export class InviteMemberModalComponent implements OnInit {
  @Input() roomId: string = '';
  @Input() existingMemberIds: string[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() invite = new EventEmitter<string>();

  users: any[] = [];
  searchQuery: string = '';
  manualUserId: string = '';
  isLoading: boolean = false;
  submittingUserId: string | null = null;
  selectedRole: string = 'member';

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.usersService.getUsers().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        this.users = list;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching users for invite:', err);
        this.isLoading = false;
      }
    });
  }

  get availableUsers(): any[] {
    const query = this.searchQuery.toLowerCase().trim();
    return this.users.filter((user) => {
      const id = user._id || user.id;
      const isAlreadyMember = this.existingMemberIds.includes(id);
      if (isAlreadyMember) return false;

      if (!query) return true;
      const name = (user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      return name.includes(query) || email.includes(query);
    });
  }

  onInviteUser(userId: string): void {
    if (!userId) return;
    this.submittingUserId = userId;
    this.invite.emit(userId);
  }

  onManualInvite(): void {
    if (!this.manualUserId.trim()) return;
    this.invite.emit(this.manualUserId.trim());
  }

  onClose(): void {
    this.close.emit();
  }
}
