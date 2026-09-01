import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '../../../services/search.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  searchTerm = '';
  notificationsOpen = false;
  currentUser: any;
  notifications: any[] = [
    { title: 'Welcome to StudySync!', time: 'Just now' }
  ];

  constructor(private router: Router, private searchService: SearchService) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }
  }

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
  }

  markAllRead(): void {
    this.notifications = [];
    this.notificationsOpen = false;
  }

  onSearchInput(): void {
    this.searchService.setSearchTerm(this.searchTerm);
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/rooms']);
    }
  }
}
