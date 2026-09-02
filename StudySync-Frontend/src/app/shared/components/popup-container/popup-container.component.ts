import { Component, OnDestroy, OnInit } from '@angular/core';
import { PopupService, ToastMessage, ConfirmRequest } from '../../../core/services/popup.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-popup-container',
  templateUrl: './popup-container.component.html',
  styleUrls: ['./popup-container.component.css']
})
export class PopupContainerComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  confirmRequest: ConfirmRequest | null = null;
  private subscriptions = new Subscription();

  constructor(private popupService: PopupService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.popupService.toasts$.subscribe(toast => {
        this.toasts.push(toast);
        setTimeout(() => this.removeToast(toast.id), 5000); // Auto remove after 5s
      })
    );

    this.subscriptions.add(
      this.popupService.confirm$.subscribe(request => {
        this.confirmRequest = request;
      })
    );
  }

  removeToast(id: string): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  onConfirm(result: boolean): void {
    if (this.confirmRequest) {
      this.confirmRequest.resolve(result);
      this.confirmRequest = null;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
