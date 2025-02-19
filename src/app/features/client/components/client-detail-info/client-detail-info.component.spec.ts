import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDetailInfoComponent } from './client-detail-info.component';

describe('ClientDetailInfoComponent', () => {
  let component: ClientDetailInfoComponent;
  let fixture: ComponentFixture<ClientDetailInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDetailInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientDetailInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
