import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDetailPlanComponent } from './client-detail-plan.component';

describe('ClientDetailPlanComponent', () => {
  let component: ClientDetailPlanComponent;
  let fixture: ComponentFixture<ClientDetailPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDetailPlanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientDetailPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
