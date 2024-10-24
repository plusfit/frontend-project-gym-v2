import { Component } from '@angular/core';
import { SettingsFormComponent } from '../../components/settings-form/settings-form.component';

@Component({
  selector: 'app-settings-pages',
  standalone: true,
  imports: [SettingsFormComponent],
  templateUrl: './settings-pages.component.html',
  styleUrl: './settings-pages.component.css',
})
export class SettingsPagesComponent {}
