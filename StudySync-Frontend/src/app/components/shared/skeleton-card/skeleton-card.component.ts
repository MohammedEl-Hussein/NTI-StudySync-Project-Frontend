import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  templateUrl: './skeleton-card.component.html',
  styleUrls: ['./skeleton-card.component.css']
})
export class SkeletonCardComponent implements OnInit {
  @Input() count: number = 3;
  items: any[] = [];

  ngOnInit() {
    this.items = Array(this.count).fill(0);
  }
}
