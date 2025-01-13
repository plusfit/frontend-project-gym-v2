import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Logout } from '@features/auth/state/auth.actions';
import { Actions, Store, ofActionSuccessful } from '@ngxs/store';
import { Subject, take, takeUntil } from 'rxjs';

/**
 * A component that displays the user area and allows the user to log out.
 */
@Component({
  selector: 'app-user-area',
  templateUrl: './user-area.component.html',
  styleUrls: ['./user-area.component.css'],
  standalone: true,
})
export class UserAreaComponent implements OnDestroy {
  private destroy = new Subject<void>();
  /**
   * The user data observable.
   */

  /**
   * Creates an instance of UserAreaComponent.
   * @param {Store} store - The Ngxs store.
   * @param {Actions} actions - The Ngxs actions.
   * @param {Router} router - The Angular router.
   */
  constructor(
    private store: Store,
    private actions: Actions,
    private router: Router,
  ) {}

  /**
   * Logs the user out and navigates to the authentication page.
   */
  logOut(): void {
    this.store.dispatch(new Logout());
    // this.actions
    //   .pipe(ofActionSuccessful(Logout), takeUntil(this.destroy))
    //   .subscribe(() => {
    //     console.log('logout successful');
    //   });
    this.router.navigate(['auth/login']); //no hace falta el subscribe, ya que no es un observable lo que devuelve
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
