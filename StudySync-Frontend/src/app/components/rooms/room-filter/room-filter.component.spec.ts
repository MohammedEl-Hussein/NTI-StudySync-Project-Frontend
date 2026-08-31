import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomFilterComponent } from './room-filter.component';

describe('RoomFilterComponent', () => {
  let component: RoomFilterComponent;
  let fixture: ComponentFixture<RoomFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RoomFilterComponent]
    });
    fixture = TestBed.createComponent(RoomFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
