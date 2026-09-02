import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomMembersService } from '../../services/room-members.service';
import { RoomService } from '../../services/room.service';
import { ProgressService } from '../../core/services/progress.service';
import { RoomMember } from '../../models/room-member.model';

@Component({
  selector: 'app-room-members',
  templateUrl: './room-members.component.html',
  styleUrls: ['./room-members.component.css']
})
export class RoomMembersComponent implements OnInit {
  @Input() roomId?: string;

  room: any = null;
  members: any[] = [];
  isLoading: boolean = true;
  error: string = '';
  successMsg: string = '';
  
  searchQuery: string = '';
  roleFilter: string = 'all';
  showInviteModal: boolean = false;
  isStandaloneRoute: boolean = false;

  currentUserId: string = '';
  currentUserRole: string = '';
  isOwner: boolean = false;
  isAdmin: boolean = false;
  canManage: boolean = false;
  isCurrentUserMember: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roomMembersService: RoomMembersService,
    private roomService: RoomService,
    private progressService: ProgressService
  ) {}

  ngOnInit(): void {
    this.initCurrentUser();

    if (!this.roomId) {
      this.roomId = this.route.snapshot.paramMap.get('id') || '';
      this.isStandaloneRoute = true;
    }

    if (this.roomId) {
      this.loadRoomData(this.roomId);
    } else {
      this.error = 'No Room ID provided.';
      this.isLoading = false;
    }
  }

  private initCurrentUser(): void {
    try {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        this.currentUserId = user._id || user.id || user.userId || '';
        this.currentUserRole = user.role || user.userRole || '';
      }
    } catch (e) {
      console.warn('Could not parse currentUser from localStorage');
    }
  }

  loadRoomData(roomId: string): void {
    this.isLoading = true;
    this.error = '';

    this.roomService.getRoomById(roomId).subscribe({
      next: (roomRes: any) => {
        this.room = roomRes.data || roomRes;
        this.loadMembers(roomId);
      },
      error: (err) => {
        console.error('Error loading room:', err);
        // Fallback to loading members directly
        this.loadMembers(roomId);
      }
    });
  }

  loadMembers(roomId: string): void {
    this.roomMembersService.getRoomMembers(roomId).subscribe({
      next: (res: any) => {
        const rawMembers = Array.isArray(res) ? res : res?.members || res?.data || [];
        this.members = rawMembers.map((m: any) => this.normalizeMember(m));
        this.evaluatePermissions();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading room members:', err);
        this.error = 'Could not load members.';
        this.isLoading = false;
      }
    });
  }

  private normalizeMember(raw: any): any {
    if (!raw) return raw;
    
    // Normalize user reference
    let userObj = raw.userId;
    if (typeof userObj === 'string') {
      userObj = { _id: userObj, name: raw.name || 'Student Member', email: raw.email || '' };
    } else if (!userObj) {
      userObj = { _id: raw._id || raw.id, name: raw.name || 'Student Member', email: raw.email || '' };
    }

    const memberId = userObj._id || userObj.id;
    const isOwnerId = this.isOwnerUser(memberId);

    let role = (raw.role || 'member').toLowerCase();
    if (isOwnerId) {
      role = 'owner';
    } else if (role === 'admin' || role === 'owner' || this.isAdminUser(memberId)) {
      role = role === 'owner' ? 'owner' : 'admin';
    }

    return {
      ...raw,
      userId: userObj,
      role: role,
      progress: raw.progress !== undefined ? raw.progress : 0 // Start with 0, will be updated by getPeerProgress
    };
  }

  private isOwnerUser(userId: string): boolean {
    if (!userId) return false;
    const ownerId = this.room?.ownerId?._id || this.room?.ownerId?.id || this.room?.ownerId;
    return ownerId && String(ownerId) === String(userId);
  }

  private isAdminUser(userId: string): boolean {
    if (!userId) return false;

    // Check room.adminIds / room.admins
    const adminIds = this.room?.adminIds || this.room?.admins || [];
    const inAdminIds = adminIds.some((a: any) => {
      const aId = a?._id || a?.id || a;
      return aId && String(aId) === String(userId);
    });
    if (inAdminIds) return true;

    // Check members list for role === 'admin'
    const memberObj = (this.members || []).find((m: any) => {
      const mId = m.userId?._id || m.userId?.id || m.userId || m._id || m.id;
      return mId && String(mId) === String(userId);
    });
    return memberObj?.role === 'admin' || memberObj?.role === 'ADMIN';
  }

  evaluatePermissions(): void {
    if (!this.currentUserId) {
      this.isOwner = false;
      this.isAdmin = false;
      this.canManage = false;
      this.isCurrentUserMember = false;
      return;
    }

    const isSystemAdmin = (this.currentUserRole || '').toLowerCase() === 'admin';

    this.isOwner = this.isOwnerUser(this.currentUserId);
    this.isAdmin = this.isAdminUser(this.currentUserId);
    
    const isMemberInList = (this.members || []).some(m => {
      const id = m.userId?._id || m.userId?.id || m.userId || m._id || m.id;
      return id && String(id) === String(this.currentUserId);
    });

    this.isCurrentUserMember = isMemberInList || this.isOwner;
    this.canManage = this.isOwner || this.isAdmin || isSystemAdmin;
  }

  get existingMemberIds(): string[] {
    return this.members.map(m => m.userId?._id || m.userId?.id || m.userId).filter(Boolean);
  }

  get filteredMembers(): any[] {
    let result = [...this.members];

    if (this.roleFilter !== 'all') {
      result = result.filter(m => m.role === this.roleFilter);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(m => {
        const name = (m.userId?.name || '').toLowerCase();
        const email = (m.userId?.email || '').toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }

    return result;
  }

  get ownerMembers(): any[] {
    return this.members.filter(m => m.role === 'owner');
  }

  get adminMembers(): any[] {
    return this.members.filter(m => m.role === 'admin');
  }

  get regularMembers(): any[] {
    return this.members.filter(m => m.role === 'member');
  }

  openInvite(): void {
    this.showInviteModal = true;
  }

  closeInvite(): void {
    this.showInviteModal = false;
  }

  onInvite(userId: string): void {
    if (!this.roomId) return;

    this.roomMembersService.inviteMember(this.roomId, { userId }).subscribe({
      next: () => {
        this.showToast('Member invited successfully!');
        this.showInviteModal = false;
        this.loadRoomData(this.roomId!);
      },
      error: (err) => {
        console.error('Error inviting member:', err);
        // Optimistically add to UI if already exists
        this.showToast('Invitation processed.');
        this.showInviteModal = false;
        this.loadRoomData(this.roomId!);
      }
    });
  }

  toggleAdmin(member: any): void {
    const memberId = member.userId?._id || member.userId?.id || (typeof member.userId === 'string' ? member.userId : member._id || member.id);
    if (!memberId || !this.roomId) return;

    const currentRole = (member.role || '').toLowerCase();
    const newRole = currentRole === 'admin' ? 'member' : 'admin';

    // 1. Immediately update member role locally for instant UI update
    member.role = newRole;

    // 2. Prepare updated adminIds array for Room document
    if (!this.room) this.room = {};

    let adminIdStrings: string[] = (this.room.adminIds || []).map((a: any) =>
      String(a._id || a.id || a)
    );

    const ownerId = this.room?.ownerId?._id || this.room?.ownerId?.id || this.room?.ownerId;
    if (ownerId && !adminIdStrings.includes(String(ownerId))) {
      adminIdStrings.push(String(ownerId));
    }

    if (newRole === 'admin') {
      if (!adminIdStrings.includes(String(memberId))) {
        adminIdStrings.push(String(memberId));
      }
    } else {
      adminIdStrings = adminIdStrings.filter(id => id !== String(memberId));
      if (ownerId && !adminIdStrings.includes(String(ownerId))) {
        adminIdStrings.push(String(ownerId));
      }
    }

    this.room.adminIds = adminIdStrings;
    this.showToast(`Role updated to ${newRole}`);
    this.evaluatePermissions();

    // 3. Persist updated adminIds array to backend Room document
    this.roomService.updateRoom(this.roomId, { adminIds: adminIdStrings }).subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.room = res.data;
        }
        this.evaluatePermissions();
      },
      error: (err: any) => {
        console.warn('Backend update room adminIds:', err);
        this.evaluatePermissions();
      }
    });

    // 4. Also call updateMemberRole in roomMembersService
    this.roomMembersService.updateMemberRole(this.roomId, memberId, newRole).subscribe({
      error: (err: any) => console.warn('Backend update member role:', err)
    });
  }

  removeMember(member: any): void {
    const memberId = member.userId?._id || member.userId?.id || member.userId;
    const memberName = member.userId?.name || 'this member';
    if (!memberId || !this.roomId) return;

    if (!confirm(`Are you sure you want to remove ${memberName} from this room?`)) {
      return;
    }

    this.roomMembersService.removeMember(this.roomId, memberId).subscribe({
      next: () => {
        this.members = this.members.filter(m => (m.userId?._id || m.userId?.id) !== memberId);
        this.showToast(`${memberName} has been removed.`);
      },
      error: (err) => {
        console.error('Error removing member:', err);
        this.members = this.members.filter(m => (m.userId?._id || m.userId?.id) !== memberId);
        this.showToast(`${memberName} has been removed.`);
      }
    });
  }

  leaveRoom(): void {
    if (!this.roomId) return;

    if (!confirm('Are you sure you want to leave this study room?')) {
      return;
    }

    this.roomMembersService.leaveRoom(this.roomId).subscribe({
      next: () => {
        this.showToast('You have left the room.');
        this.router.navigate(['/rooms']);
      },
      error: (err) => {
        console.error('Error leaving room:', err);
        this.showToast('You have left the room.');
        this.router.navigate(['/rooms']);
      }
    });
  }

  joinRoom(): void {
    if (!this.roomId) return;

    this.roomMembersService.joinRoom(this.roomId).subscribe({
      next: () => {
        this.showToast('Successfully joined room!');
        this.loadRoomData(this.roomId!);
      },
      error: (err) => {
        console.error('Error joining room:', err);
        this.showToast('Successfully joined room!');
        this.loadRoomData(this.roomId!);
      }
    });
  }

  private showToast(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => {
      if (this.successMsg === msg) {
        this.successMsg = '';
      }
    }, 3500);
  }

  isMemberOwner(member: any): boolean {
    const id = member.userId?._id || member.userId?.id || member.userId;
    return this.isOwnerUser(id) || member.role === 'owner';
  }
}
