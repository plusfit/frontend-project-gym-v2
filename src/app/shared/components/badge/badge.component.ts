import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { EColorBadge } from "../../enums/badge-color.enum";
import { Eicon } from "../../enums/icon.enum";
import { Eshape } from "../../enums/shape.enum";
import { IBadgeClass } from "../../interfaces/badge_class.interface";
import { TranslationPipe } from "@shared/pipes/translation.pipe";

/**
 * A component that displays a badge with an optional icon and text.
 */
@Component({
  selector: "app-badge",
  templateUrl: "./badge.component.html",
  imports: [TranslationPipe],
  standalone: true,
})
export class BadgeComponent implements OnChanges {
  /**
   * The color of the badge.
   */
  @Input()
  colorBadge: EColorBadge = EColorBadge.NEUTRAL;

  /**
   * The available badge colors.
   */
  eColorBadge: typeof EColorBadge = EColorBadge;

  /**
   * The text to display in the badge.
   */
  @Input()
  textBadge: string;

  /**
   * The icon to display in the badge.
   */
  @Input()
  icon: Eicon = Eicon.OFF;

  /**
   * The shape of the badge.
   */
  @Input()
  shapeBadge: Eshape = Eshape.ROUNDED;

  /**
   * The class for the badge.
   */
  badgeClass: string;
  /**
   * The classes for the icon in the badge.
   */
  iconClasses: string;
  /**
   * The classes for the shape of the badge.
   */
  shapeClasses: string;

  /**
   * Creates an instance of BadgeComponent.
   */
  constructor() {
    this.textBadge = "Badge";
    this.iconClasses = " ";
    this.shapeClasses = " rounded-lg ";
    this.badgeClass =
      "inline-flex items-center px-2 py-1 body-xs bg-primary-100 font-semibold text-primary-500";
  }

  /**
   * Called when any of the input properties change.
   * @param {SimpleChanges} changes - The changes object.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["colorBadge"]) {
      this.setColorBadge(changes["colorBadge"].currentValue);
    }
    if (changes["shapeBadge"]) {
      this.getShapeBadge(changes["shapeBadge"].currentValue);
    }
    if (changes["icon"]) {
      this.getIcon(changes["icon"].currentValue);
    }
    this.badgeClass = this.badgeClass + this.shapeClasses;
  }

  /**
   * Sets the shape classes based on the shape input.
   * @param {string} shape - The shape input value.
   */
  getShapeBadge(shape: string): void {
    if (shape == Eshape.SQUARE) {
      this.shapeClasses = " rounded-sm";
    }
  }

  /**
   * Sets the icon classes based on the icon input.
   * @param {string} icon - The icon input value.
   */
  getIcon(icon: string): void {
    switch (icon) {
      case Eicon.ARROW:
        this.iconClasses = "ph-arrow-up mr-1";
        break;
      case Eicon.DOT:
        this.iconClasses = "text-sm ph-circle-fill mr-1";
        break;
      default:
        this.iconClasses = " ";
        break;
    }
  }

  /**
   * Sets the badge class based on the color input.
   * @param {string} color - The color input value.
   */
  setColorBadge(color = ""): void {
    const badgeClassAux: IBadgeClass = {
      primary:
        "inline-flex items-center py-1 px-2 body-xs font-semibold bg-primary-100 text-primary-500",
      success:
        "inline-flex items-center py-1 px-2 body-xs font-semibold bg-success-50 text-success-200",
      warning:
        "inline-flex items-center py-1 px-2 body-xs font-semibold bg-warning-50 text-warning-200",
      error: "inline-flex items-center py-1 px-2 body-xs font-semibold bg-error-50 text-error-200",
      info: "inline-flex items-center py-1 px-2 body-xs font-semibold bg-info-50 text-info-200",
      neutral:
        "inline-flex items-center py-1 px-2 font-semibold body-xs bg-neutral-300 text-neutral-1000",
      pink: "inline-flex items-center py-1 px-2 body-xs font-semibold bg-pink-100 text-pink-600",
    };

    this.badgeClass = badgeClassAux[color as keyof IBadgeClass];
  }
}
