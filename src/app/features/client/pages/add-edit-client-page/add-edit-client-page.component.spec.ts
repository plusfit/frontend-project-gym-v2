import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditClientPageComponent } from './add-edit-client-page.component';

describe('AddEditClientPageComponent', () => {
  let component: AddEditClientPageComponent;
  let fixture: ComponentFixture<AddEditClientPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditClientPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddEditClientPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
