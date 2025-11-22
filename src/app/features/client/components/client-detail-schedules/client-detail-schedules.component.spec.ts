import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDetailSchedulesComponent } from './client-detail-schedules.component';

describe('ClientDetailSchedulesComponent', () => {
    let component: ClientDetailSchedulesComponent;
    let fixture: ComponentFixture<ClientDetailSchedulesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ClientDetailSchedulesComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ClientDetailSchedulesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
