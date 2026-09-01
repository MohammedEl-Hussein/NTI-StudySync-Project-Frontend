import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupportService } from '../../../services/support.service';

@Component({
  selector: 'app-support-create',
  templateUrl: './support-create.component.html',
  styleUrls: ['./support-create.component.css']
})
export class SupportCreateComponent implements OnInit {
  @Output() ticketCreated = new EventEmitter<any>();

  supportForm!: FormGroup;
  isSubmitting: boolean = false;
  error: string = '';
  successMsg: string = '';

  requestTypes: string[] = [
    'Study Plan Help',
    'Technical Issue',
    'Reporting & Progress',
    'Room & Collaboration',
    'General Request'
  ];

  constructor(
    private fb: FormBuilder,
    private supportService: SupportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.supportForm = this.fb.group({
      type: ['Study Plan Help', [Validators.required]],
      subject: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(120)]],
      content: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
    });
  }

  get f() {
    return this.supportForm.controls;
  }

  submit(): void {
    if (this.supportForm.invalid) {
      this.supportForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = '';
    this.successMsg = '';

    const payload = this.supportForm.value;

    this.supportService.createTicket(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        this.successMsg = 'Support ticket submitted successfully!';
        const createdTicket = res.data || res;
        this.ticketCreated.emit(createdTicket);

        this.supportForm.reset({
          type: 'Study Plan Help',
          subject: '',
          content: ''
        });

        // If navigated directly to /support/create, route back to /support
        if (this.router.url.includes('/support/create')) {
          setTimeout(() => {
            this.router.navigate(['/support']);
          }, 1200);
        }
      },
      error: (err) => {
        console.error('Error submitting support ticket:', err);
        this.isSubmitting = false;
        this.error = 'Failed to submit ticket. Please try again.';
      }
    });
  }
}
