import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { EColorBadge } from '../../enums/badge-color.enum';
import { Eicon } from '../../enums/icon.enum';
import { Eshape } from '../../enums/shape.enum';
import { IBadgeClass } from '../../interfaces/badge_class.interface';
import { TranslationPipe } from '@shared/pipes/translation.pipe';

/**
 * A component that displays a badge with an optional icon and text.
 */
@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
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
    this.textBadge = 'Badge';
    this.iconClasses = ' ';
    this.shapeClasses = ' rounded-lg ';
    this.badgeClass =
      'inline-flex items-center px-2 py-1 body-xs bg-primary-100 font-semibold text-primary-500';
  }

  /**
   * Called when any of the input properties change.
   * @param {SimpleChanges} changes - The changes object.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if ('colorBadge' in changes) {
      this.setColorBadge(changes['colorBadge'].currentValue);
    }
    if ('shapeBadge' in changes) {
      this.getShapeBadge(changes['shapeBadge'].currentValue);
    }
    if ('icon' in changes) {
      this.getIcon(changes['icon'].currentValue);
    }
    this.badgeClass = this.badgeClass + this.shapeClasses;
  }

  /**
   * Sets the shape classes based on the shape input.
   * @param {string} shape - The shape input value.
   */
  getShapeBadge(shape: string): void {
    if (shape === Eshape.SQUARE) {
      this.shapeClasses = ' rounded-sm';
    }
  }

  /**
   * Sets the icon classes based on the icon input.
   * @param {string} icon - The icon input value.
   */
  getIcon(icon: string): void {
    switch (icon) {
      case Eicon.ARROW:
        this.iconClasses = 'ph-arrow-up mr-1';
        break;
      case Eicon.DOT:
        this.iconClasses = 'text-sm ph-circle-fill mr-1';
        break;
      default:
        this.iconClasses = ' ';
        break;
    }
  }

  /**
   * Sets the badge class based on the color input.
   * @param {string} color - The color input value.
   */
  setColorBadge(color = ''): void {
    const badgeClassAux = {
      primary:
        'inline-flex items-center py-2 px-3 text-xs font-semibold rounded-lg bg-gradient-to-r from-primary-100 to-blue-100 text-primary-700 border border-primary-200 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200',
      success:
        'inline-flex items-center py-2 px-3 text-xs font-semibold rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200',
      warning:
        'inline-flex items-center py-2 px-3 text-xs font-semibold rounded-lg bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200',
      error:
        'inline-flex items-center py-2 px-3 text-xs font-semibold rounded-lg bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200',
      info: 'inline-flex items-center py-2 px-3 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border border-blue-200 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200',
      neutral:
        'inline-flex items-center py-2 px-3 text-xs font-semibold rounded-lg bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200',
    };

    switch (color) {
      case 'primary':
        this.badgeClass = badgeClassAux.primary;
        break;
      case 'success':
        this.badgeClass = badgeClassAux.success;
        break;
      case 'warning':
        this.badgeClass = badgeClassAux.warning;
        break;
      case 'error':
        this.badgeClass = badgeClassAux.error;
        break;
      case 'info':
        this.badgeClass = badgeClassAux.info;
        break;
      case 'neutral':
        this.badgeClass = badgeClassAux.neutral;
        break;
      default:
        this.badgeClass = badgeClassAux.primary;
        break;
    }
  }
}
