import { Component, ViewChild } from '@angular/core';
import { MySupportTicketsComponent } from './my-support-tickets/my-support-tickets.component';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent {
  @ViewChild('myTickets') myTicketsComponent?: MySupportTicketsComponent;

  activeFaq: number | null = null;

  faqs = [
    {
      question: 'How do I invite members to my study room?',
      answer: 'As a room owner or admin, open your room details, click on the Members tab, and click the "+ Invite Student" button to select peers or enter their User ID.'
    },
    {
      question: 'Can I promote other students to room admins?',
      answer: 'Yes! Room owners can promote any member to an Admin or demote them back to a student role directly from the Members tab.'
    },
    {
      question: 'How long does it take for support tickets to be resolved?',
      answer: 'Our dedicated support team typically responds to inquiries within 2 hours during active study cycles.'
    }
  ];

  onTicketCreated(ticket: any): void {
    if (this.myTicketsComponent) {
      this.myTicketsComponent.loadTickets();
    }
  }

  toggleFaq(index: number): void {
    this.activeFaq = this.activeFaq === index ? null : index;
  }
}
