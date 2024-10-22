import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { NgControl, NgModel } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ValidatorMessage } from '../../api/validator_message.service';
import { IHelpDescription } from '../../interfaces/help_description.interface';

/**
 * The InputDirective is a directive for input elements.
 * @directive
 */
@Directive({
  selector: '[appInput]',
  standalone: true,
})
export class InputDirective implements AfterViewInit, OnDestroy, OnChanges {
  /**
   * A subject for managing unsubscriptions.
   */
  unsubscription = new Subject();

  /** The label text of the input. */
  @Input() label = '';

  /** The class of the left icon. */
  @Input() iconLeft = '';

  /**  The class of the right icon. */
  @Input() iconRight = '';

  /** The class of the error icon. */
  @Input() iconError = '';
  /**
   * The description and help text for the input.
   */
  @Input() helpDesc: IHelpDescription | null = null;

  /**  Defines whether error message is displayed or not. */
  @Input() notMessageError = false;

  /**
   * The icon element for the right side of the input element.
   */
  iconElementRight: any = null;
  /**
   * The icon element for the left side of the input element.
   */
  iconElementLeft: any = null;
  /**
   * The parent div for the icon element on the right side of the input element.
   */
  iconRightParentDiv: any = null;
  /**
   * The parent div for the icon element on the left side of the input element.
   */
  iconLeftParentDiv: any = null;
  /**
   * The paragraph element for the help description of the input element.
   */
  paragraphHelpDesc: any = null;
  /**
   * The paragraph element for the error description of the input element.
   */
  paragraphErrorDesc: any = null;
  /**
   * The label input element for the input directive.
   */
  labelInputEl: ElementRef | null = null;
  /**
   * The wrap element for the input directive.
   */
  wrap: HTMLElement | null = null;
  /**
   * A boolean indicating whether the input element is required or not.
   */
  isRequired = false;

  /**
   * Creates an instance of the InputDirective class.
   * @param {ElementRef} el - The element reference to use for the directive.
   * @param {Renderer2} rendered - The renderer to use for the directive.
   * @param {ChangeDetectorRef} cd - The change detector reference to use for the directive.
   * @param {ValidatorMessage} validatorMessage - The validator message to use for the directive.
   * @param {NgModel} ngModel - The ngModel to use for the directive.
   * @param {NgControl} ngControl - The ngControl to use for the directive.
   */
  constructor(
    public el: ElementRef,
    public rendered: Renderer2,
    public cd: ChangeDetectorRef,
    public validatorMessage: ValidatorMessage,
    @Optional() public ngModel: NgModel,
    @Optional() public ngControl: NgControl,
  ) {}

  /**
   * Handles the blur event for the input element.
   * @param {any} target - The target of the blur event.
   */
  @HostListener('blur', ['$event.target'])
  /**
   * Handles the blur event of the input element.
   * If the input is invalid, adds an error class to the element and displays an error message.
   * If the input is valid, removes the error class and error message.
   */
  onBlur(): void {
    if (this.ngControl.invalid) {
      this.addClass(true);
      if (this.notMessageError) return;
      const errors = this.ngControl?.control?.errors || {};
      const errorMessage = this.validatorMessage.getFirstErrorMessage(
        errors,
      ) as string;

      this.addErrorDescription(errorMessage);
      this.removeDescription();
      return;
    }

    this.addClass(false);
    this.addErrorDescription('');
  }

  ngOnChanges(changes: SimpleChanges): void {
    const iconRightChange = changes['iconRight'];
    const iconLeftChange = changes['iconLeft'];
    const helpDescChange = changes['helpDesc'];
    if (
      (!iconRightChange?.firstChange &&
        iconRightChange?.currentValue != iconRightChange?.previousValue) ||
      (!iconLeftChange?.firstChange &&
        iconLeftChange?.currentValue != iconLeftChange?.previousValue)
    ) {
      this.updateIcon();
    }

    if (!helpDescChange?.firstChange) {
      this.addDescription();
    }
  }

  ngAfterViewInit(): void {
    this.isRequired = this.ngControl.hasError('required');
    this.subscribeToStatusChanges();
    this.initializeInput();
  }

  private subscribeToStatusChanges(): void {
    this.ngControl.statusChanges
      ?.pipe(takeUntil(this.unsubscription))
      .subscribe((status) => {
        if (status === 'INVALID' && this.paragraphErrorDesc) {
          this.handleInvalidStatus();
        }

        if (status === 'VALID') {
          this.handleValidStatus();
        }

        this.updateRequiredValidator();
      });
  }

  private handleInvalidStatus(): void {
    this.addClass(true);
    if (this.notMessageError) return;
    const errors = this.ngControl?.control?.errors || {};
    const errorMessage = this.validatorMessage.getFirstErrorMessage(
      errors,
    ) as string;
    this.addErrorDescription(errorMessage);
  }

  private handleValidStatus(): void {
    this.addClass(false);
    this.addErrorDescription('');
    if (!this.paragraphHelpDesc) {
      this.addDescription();
    }
  }

  private updateRequiredValidator(): void {
    const validators =
      this.ngControl.control?.validator &&
      this.ngControl.control.validator({} as any);
    const validatorRequired = validators && validators['required'];

    if (this.isRequired !== validatorRequired) {
      this.isRequired = this.ngControl.hasError('required');
      this.addLabel();
    }
  }

  private initializeInput(): void {
    this.addInputLabel();
    this.updateIcon();
    this.addDescription();
    this.rendered.addClass(this.el.nativeElement, 'input-default');
  }

  /**
   * Remove the description paragraph from the DOM.
   */
  removeDescription(): void {
    if (this.paragraphHelpDesc) {
      const currentElement = this.el.nativeElement;
      this.rendered.removeChild(
        currentElement.parentNode.parentNode,
        this.paragraphHelpDesc,
      );
      this.paragraphHelpDesc = null;
    }
  }

  /**
   * Add the help description to the DOM.
   */
  addDescription(): void {
    if (this.helpDesc) {
      const currentElement = this.el.nativeElement;
      const parentCurrentElement = currentElement.parentNode;

      this.removeDescription();

      this.paragraphHelpDesc = this.rendered.createElement('p');
      this.rendered.addClass(this.paragraphHelpDesc, 'input-description');

      this.rendered.appendChild(
        parentCurrentElement.parentNode,
        this.paragraphHelpDesc,
      );
      const text = this.rendered.createText(this.helpDesc.desc);
      this.rendered.appendChild(this.paragraphHelpDesc, text);

      if (this.helpDesc.icon) {
        const iconClass = `ph-${this.helpDesc.icon}`;
        const iconElement = this.rendered.createElement('i');
        this.rendered.addClass(iconElement, iconClass);
        this.rendered.addClass(iconElement, 'block');
        this.rendered.addClass(iconElement, 'mt-0.5');
        this.rendered.addClass(iconElement, 'mr-1');
        this.rendered.insertBefore(this.paragraphHelpDesc, iconElement, text);
      }
    }
  }

  /**
   * Add an error message to the DOM.
   * @param {string} message The error message to be displayed.
   */
  addErrorDescription(message = ''): void {
    const currentElement = this.el.nativeElement;
    const parentCurrentElement = currentElement.parentNode;
    if (message) {
      this.paragraphErrorDesc
        ? this.rendered.removeChild(
            currentElement.parentNode.parentNode,
            this.paragraphErrorDesc,
          )
        : null;
      this.paragraphErrorDesc = this.rendered.createElement('p');
      this.rendered.addClass(this.paragraphErrorDesc, 'input-description');
      this.rendered.addClass(this.paragraphErrorDesc, 'text-error-100');

      this.rendered.appendChild(
        parentCurrentElement.parentNode,
        this.paragraphErrorDesc,
      );
      const text = this.rendered.createText(message);
      this.rendered.appendChild(this.paragraphErrorDesc, text);

      if (this.iconError) {
        const iconClass = `ph-${this.iconError}`;
        const iconElement = this.rendered.createElement('i');
        this.rendered.addClass(iconElement, iconClass);
        this.rendered.addClass(iconElement, 'block');
        this.rendered.addClass(iconElement, 'mt-0.5');
        this.rendered.addClass(iconElement, 'mr-1');
        this.rendered.insertBefore(this.paragraphErrorDesc, iconElement, text);
      }
    } else {
      this.paragraphErrorDesc
        ? this.rendered.removeChild(
            currentElement.parentNode.parentNode,
            this.paragraphErrorDesc,
          )
        : null;
      this.paragraphErrorDesc = null;
    }
  }
  /**
   * Remove the label from the input field in the DOM.
   */
  removeInputLabel(): void {
    if (this.labelInputEl) {
      const currentElement = this.el.nativeElement;
      this.rendered.removeChild(
        currentElement.parentNode.parentNode,
        this.labelInputEl,
      );
    }
  }
  /**
   * Add a label to the input field in the DOM.
   */
  addLabel(): void {
    let labelText = this.label;
    labelText += this.isRequired ? '*' : '';
    this.rendered.setProperty(this.labelInputEl, 'textContent', labelText);
  }
  /**
   * Adds the label element to the input field in the DOM.
   */
  addInputLabel(): void {
    const currentElement = this.el.nativeElement;

    const div = this.rendered.createElement('div');

    this.wrap = this.rendered.createElement('div');
    this.rendered.addClass(currentElement, 'my-2');
    this.rendered.insertBefore(currentElement.parentNode, div, currentElement);
    this.rendered.appendChild(div, currentElement);
    this.rendered.insertBefore(div.parentNode, this.wrap, div);
    this.rendered.appendChild(this.wrap, div);

    this.labelInputEl = this.rendered.createElement('label');
    let labelText = this.label;
    labelText += this.isRequired ? '*' : '';
    const text = this.rendered.createText(labelText);
    this.rendered.addClass(this.labelInputEl, 'block');

    this.rendered.addClass(this.labelInputEl, 'text-body-lg');
    this.rendered.addClass(this.labelInputEl, 'text-neutral-800');

    this.rendered.appendChild(this.labelInputEl, text);
    this.rendered.insertBefore(div.parentNode, this.labelInputEl, div);
    this.rendered.addClass(this.wrap, 'wrap');
    this.rendered.addClass(this.wrap, 'w-full');
    this.rendered.addClass(div, 'w-full');

    this.rendered.addClass(currentElement, 'w-full');
  }
  /**
   * Updates the icon on the right side of the input field.
   */
  updateIcon(): void {
    const currentElement = this.el.nativeElement;
    const parentNode = currentElement.parentNode;

    if (this.iconRight) {
      const iconClass = `ph-${this.iconRight}`;
      this.rendered.addClass(parentNode, 'relative');
      this.rendered.addClass(currentElement, 'pr-8');

      if (this.iconElementRight && this.iconRightParentDiv) {
        this.rendered.removeChild(parentNode, this.iconRightParentDiv);
      }

      this.iconRightParentDiv = this.rendered.createElement('div');
      this.iconElementRight = this.rendered.createElement('i');
      this.rendered.addClass(this.iconElementRight, iconClass);

      this.rendered.addClass(this.iconRightParentDiv, 'icon-right-parent-div');
      this.rendered.appendChild(parentNode, this.iconRightParentDiv);
      this.rendered.appendChild(this.iconRightParentDiv, this.iconElementRight);
    }
    if (!this.iconRight && this.iconElementRight) {
      this.rendered.removeChild(parentNode, this.iconRightParentDiv);
      this.rendered.removeClass(currentElement, 'pr-8');
      this.iconElementRight = null;
    }

    if (this.iconLeft) {
      const iconClass = `ph-${this.iconLeft}`;
      this.rendered.addClass(parentNode, 'relative');
      this.rendered.addClass(currentElement, 'pl-8');

      if (this.iconElementLeft && this.iconLeftParentDiv) {
        this.rendered.removeChild(parentNode, this.iconLeftParentDiv);
      }

      this.iconLeftParentDiv = this.rendered.createElement('div');
      this.iconElementLeft = this.rendered.createElement('i');
      this.rendered.addClass(this.iconElementLeft, iconClass);

      this.rendered.addClass(this.iconLeftParentDiv, 'icon-left-parent-div');

      this.rendered.appendChild(parentNode, this.iconLeftParentDiv);
      this.rendered.appendChild(this.iconLeftParentDiv, this.iconElementLeft);
    }

    if (!this.iconLeft && this.iconElementLeft) {
      this.rendered.removeChild(parentNode, this.iconLeftParentDiv);
      this.rendered.removeClass(currentElement, 'pl-8');
      this.iconElementLeft = null;
    }
  }

  /**
   * Add or remove class depending on error status.
   * @param {boolean} error The error status.
   */
  addClass(error: boolean): void {
    if (error) {
      this.rendered.removeClass(this.el.nativeElement, 'input-default');
      this.rendered.addClass(this.el.nativeElement, 'input-error');

      this.iconElementLeft
        ? this.rendered.addClass(this.iconElementLeft, 'text-error-200')
        : null;
      this.iconElementRight
        ? this.rendered.addClass(this.iconElementRight, 'text-error-200')
        : null;
    } else {
      this.rendered.removeClass(this.el.nativeElement, 'input-error');
      this.rendered.addClass(this.el.nativeElement, 'input-default');
      this.iconElementLeft
        ? this.rendered.removeClass(this.iconElementLeft, 'text-error-200')
        : null;
      this.iconElementRight
        ? this.rendered.removeClass(this.iconElementRight, 'text-error-200')
        : null;
    }
  }

  /**
   * Clean up any subscriptions when the directive is destroyed.
   */
  ngOnDestroy(): void {
    this.unsubscription.next(null);
    this.unsubscription.complete();
  }
}
