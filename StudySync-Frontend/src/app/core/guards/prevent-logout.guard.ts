import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MainLayoutComponent } from '../../components/layout/main-layout/main-layout.component';
import { UserService } from '../services/user.service';

@Injectable({ providedIn: 'root' })
export class PreventLogoutGuard implements CanDeactivate<MainLayoutComponent> {
  constructor(private userService: UserService) {}

  canDeactivate(
    component: MainLayoutComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): boolean {
    if (nextState && (nextState.url === '/login' || nextState.url === '/' || nextState.url === '/home')) {
      // If the token is already gone (user clicked standard Log Out button), just allow navigation.
      if (!localStorage.getItem('token')) {
        return true;
      }

      // Otherwise, they are using the back button to leave the app layout
      const confirmLogout = window.confirm('Warning: You are about to sign out and leave your account. Do you want to proceed?');
      if (confirmLogout) {
        // Log them out properly so they have to sign in if they come back
        this.userService.setCurrentUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('user');
        return true;
      } else {
        return false; // Cancel the back navigation!
      }
    }
    return true;
  }
}
