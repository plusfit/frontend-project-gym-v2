import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GetClientById } from '@features/client/state/clients.actions';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Subject, takeUntil } from 'rxjs';
import { ClientFormComponent } from '../../components/client-form/client-form.component';

@Component({
  selector: 'app-add-edit-client-page',
  standalone: true,
  imports: [ClientFormComponent],
  templateUrl: './add-edit-client-page.component.html',
  styleUrl: './add-edit-client-page.component.css',
})
export class AddEditClientPageComponent implements OnInit, OnDestroy {
  id: string = '';
  isEdit = false;

  private destroy = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private actions: Actions,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';

    if (this.id && this.id !== 'crear') {
      this.store.dispatch(new GetClientById(this.id));
      this.actions
        .pipe(ofActionSuccessful(GetClientById), takeUntil(this.destroy))
        .subscribe(() => {
          this.store
            .select((state) => state.clients.selectedClient)
            .pipe(takeUntil(this.destroy))
            .subscribe(() => {
              this.isEdit = true;
            });
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
