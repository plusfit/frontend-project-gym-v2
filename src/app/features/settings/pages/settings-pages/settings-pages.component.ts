import { Component, OnInit } from '@angular/core';
import { SnackBarService } from '@core/services/snackbar.service';
import { GetSettings } from '@features/settings/state/settings.actions';
import { SettingsState } from '@features/settings/state/settings.state';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { tap } from 'rxjs';
import { SettingsFormComponent } from '../../components/settings-form/settings-form.component';

@Component({
  selector: 'app-settings-pages',
  standalone: true,
  imports: [SettingsFormComponent],
  templateUrl: './settings-pages.component.html',
  styleUrl: './settings-pages.component.css',
})
export class SettingsPagesComponent implements OnInit {
  settings!: any;

  constructor(
    private store: Store,
    private actions: Actions,
    private snackbar: SnackBarService,
  ) {}
  ngOnInit(): void {
    this.store.dispatch(new GetSettings());
    this.actions
      .pipe(
        ofActionSuccessful(GetSettings),
        tap(() => {
          const settings = this.store.selectSnapshot(SettingsState.settings);
          this.settings = settings?.data;
        }),
      )
      .subscribe(() => {});
  }
}
