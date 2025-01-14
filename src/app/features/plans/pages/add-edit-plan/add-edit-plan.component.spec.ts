import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditPlanComponent } from './add-edit-plan.component';

describe('AddEditPlanComponent', () => {
  let component: AddEditPlanComponent;
  let fixture: ComponentFixture<AddEditPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditPlanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddEditPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
