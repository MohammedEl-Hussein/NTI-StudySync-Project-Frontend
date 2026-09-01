import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomSearchComponent } from './room-search.component';

describe('RoomSearchComponent', () => {
  let component: RoomSearchComponent;
  let fixture: ComponentFixture<RoomSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RoomSearchComponent]
    });
    fixture = TestBed.createComponent(RoomSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
