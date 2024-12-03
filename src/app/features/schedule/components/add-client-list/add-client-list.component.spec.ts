import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClientListComponent } from './add-client-list.component';

describe('AddClientListComponent', () => {
  let component: AddClientListComponent;
  let fixture: ComponentFixture<AddClientListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddClientListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddClientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
