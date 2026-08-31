import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  public currentUser: User | null = null;
  public searchTerm = '';
  public notificationsOpen = false;

  public notifications = [
    { title: 'Zeyad completed task: Consensus RPCs', time: '10m ago' },
    { title: 'New study room invited: Compiler Design', time: '1h ago' },
    { title: 'Weekly progress goal reached 78%!', time: '2h ago' }
  ];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
  }

  markAllRead(): void {
    this.notifications = [];
    this.notificationsOpen = false;
  }
}
