import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { UserService } from '../services/user.service';
import { PopupService } from '../services/popup.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PreventLogoutGuard implements CanDeactivate<any> {
  constructor(private userService: UserService, private popupService: PopupService) {}

  canDeactivate(
    component: any,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (nextState && (nextState.url === '/login' || nextState.url === '/' || nextState.url === '/home')) {
      // If the token is already gone (user clicked standard Log Out button), just allow navigation.
      if (!localStorage.getItem('token')) {
        return true;
      }

      // Otherwise, they are using the back button to leave the app layout
      return this.popupService.confirm('Warning: You are about to sign out and leave your account. Do you want to proceed?', 'Confirm Logout').pipe(
        map(confirmLogout => {
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
        })
      );
    }
    return true;
  }
}
