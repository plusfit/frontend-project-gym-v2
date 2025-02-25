import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenPagesComponent } from './screen-pages.component';

describe('ScreenPagesComponent', () => {
  let component: ScreenPagesComponent;
  let fixture: ComponentFixture<ScreenPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreenPagesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScreenPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
