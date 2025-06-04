import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BtnDirective } from '@shared/directives';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [BtnDirective],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div
        class="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center"
      >
        <div class="mb-4">
          <svg
            class="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h1 class="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>

        <p class="text-gray-600 mb-6">
          You don't have permission to access this resource. Please contact your
          administrator if you believe this is an error.
        </p>

        <button appBtn color="primary" (click)="goBack()" class="w-full">
          Go Back
        </button>
      </div>
    </div>
  `,
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/']);
  }
}
