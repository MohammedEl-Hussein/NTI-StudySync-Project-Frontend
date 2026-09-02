import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface ConfirmRequest {
  title?: string;
  message: string;
  resolve: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private toastsSubject = new Subject<ToastMessage>();
  public toasts$ = this.toastsSubject.asObservable();

  private confirmSubject = new Subject<ConfirmRequest>();
  public confirm$ = this.confirmSubject.asObservable();

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  public toastSuccess(message: string): void {
    this.toastsSubject.next({ id: this.generateId(), type: 'success', message });
  }

  public toastError(message: string): void {
    this.toastsSubject.next({ id: this.generateId(), type: 'error', message });
  }

  public toastInfo(message: string): void {
    this.toastsSubject.next({ id: this.generateId(), type: 'info', message });
  }

  public confirm(message: string, title: string = 'Confirm'): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.confirmSubject.next({
        message,
        title,
        resolve: (result: boolean) => {
          observer.next(result);
          observer.complete();
        }
      });
    });
  }
}
