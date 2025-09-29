import { NgClass } from "@angular/common";
import { Component, input, InputSignal } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-navigation",
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: "./navigation.component.html",
  styleUrl: "./navigation.component.css",
})
export class NavigationComponent {
  isMenuOpen: InputSignal<boolean> = input<boolean>(false);

  appName = "+Fit";

  // Estado de submenús
  submenuStates = {
    acceso: false,
    rewards: false,
  };

  toggleSubmenu(menu: keyof typeof this.submenuStates) {
    this.submenuStates[menu] = !this.submenuStates[menu];
  }
}
