import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDetailRoutineComponent } from './client-detail-routine.component';

describe('ClientDetailRoutineComponent', () => {
  let component: ClientDetailRoutineComponent;
  let fixture: ComponentFixture<ClientDetailRoutineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDetailRoutineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientDetailRoutineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
