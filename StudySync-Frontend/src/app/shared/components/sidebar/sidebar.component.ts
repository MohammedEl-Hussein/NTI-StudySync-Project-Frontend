import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  public currentUser: User | null = null;
  public collapsed = false;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  logout(): void {
    console.log('User logged out');
    this.router.navigate(['/login']);
  }
}
