import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardRoutineComponent } from './card-routine.component';

describe('CardRoutineComponent', () => {
  let component: CardRoutineComponent;
  let fixture: ComponentFixture<CardRoutineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardRoutineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardRoutineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
