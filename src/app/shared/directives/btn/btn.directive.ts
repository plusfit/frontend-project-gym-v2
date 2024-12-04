import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

/** The possible colors for the button. */
type BtnColor =
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'destructive-outline'
  | 'basic';

/**
 * The BtnDirective adds styles and an icon to a button element.
 * @directive
 */
@Directive({
  selector: '[appBtn]',
  standalone: true,
})
export class BtnDirective implements OnInit {
  /** The icon element. */
  private iconElement!: HTMLElement;

  /** The color of the button. */
  @Input() color: BtnColor = 'primary';

  /** The name of the icon to display. */
  @Input() icon = '';

  /** The position of the icon relative to the button text. */
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() animate = false;

  @Input() set loader(load: boolean) {
    this.toggle(load);
  }

  /**
   * Creates a new instance of the BtnDirective.
   * @param el The ElementRef.
   * @param renderer The Renderer2.
   */
  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  /**
   * Initializes the directive.
   */
  ngOnInit(): void {
    // Add the color class to the button element
    if (this.color && this.color.length > 0) {
      const iconClassColor = `btn-${this.color}`;
      this.renderer.addClass(this.el.nativeElement, iconClassColor);
    }

    if (this.icon && !this.animate) {
      this.addIcon();
    }

    if (this.icon && this.animate) {
      this.addIcon();
      this.iconElement.hidden = true;
    }
  }

  /**
   * Adds the icon to the button element.
   */
  addIcon(): void {
    this.iconElement = this.renderer.createElement('i');

    // Set the icon position classes
    if (this.iconPosition == 'left') {
      this.renderer.addClass(this.el.nativeElement, 'flex-row-reverse');
      this.renderer.addClass(this.el.nativeElement, 'space-x-reverse');
      this.renderer.addClass(this.iconElement, 'text-button-lg');
    } else {
      this.renderer.addClass(this.iconElement, 'text-button-lg');
    }

    // Set the icon class
    const iconClass = `ph-${this.icon}`;
    this.renderer.addClass(this.iconElement, iconClass);

    // Add the icon to the button element
    this.renderer.appendChild(this.el.nativeElement, this.iconElement);
  }

  /**
   * Toggles the visibility of an icon element based on a condition.
   * @param {boolean} condition A boolean value indicating whether to show or hide the icon element.
   */
  toggle(condition: boolean): void {
    condition ? this.show() : this.hide();
  }

  /**
   * Shows the icon element and adds a spinning animation class to it.
   */
  show(): void {
    if (this.iconElement) {
      this.iconElement.hidden = false;
      this.renderer.addClass(this.iconElement, 'animate-spin');
    }
  }

  /**
   * Hides the icon element.
   */
  hide(): void {
    if (this.iconElement) {
      this.iconElement.hidden = true;
    }
  }
}
