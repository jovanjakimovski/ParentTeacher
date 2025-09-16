import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingRequestsComponent } from './meeting-requests';

describe('MeetingRequestsComponent', () => {
  let component: MeetingRequestsComponent;
  let fixture: ComponentFixture<MeetingRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetingRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
