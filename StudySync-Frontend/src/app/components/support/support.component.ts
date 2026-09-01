import { Component, ViewChild } from '@angular/core';
import { MySupportTicketsComponent } from './my-support-tickets/my-support-tickets.component';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent {
  @ViewChild('myTickets') myTicketsComponent?: MySupportTicketsComponent;



  onTicketCreated(ticket: any): void {
    if (this.myTicketsComponent) {
      this.myTicketsComponent.loadTickets();
    }
  }
}
