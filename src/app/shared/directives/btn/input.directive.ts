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

@Directive({
  selector: '[appInput]',
  standalone: true,
})
export class InputDirective implements AfterViewInit, OnDestroy, OnChanges {
  unsubscription = new Subject();

  @Input() label = '';
  @Input() iconLeft = '';
  @Input() iconRight = '';
  @Input() iconError = '';
  @Input() helpDesc: IHelpDescription | null = null;
  @Input() notMessageError = false;
  @Input() outline = true; // New input property for outline style

  iconElementRight: any = null;
  iconElementLeft: any = null;
  iconRightParentDiv: any = null;
  iconLeftParentDiv: any = null;
  paragraphHelpDesc: any = null;
  paragraphErrorDesc: any = null;
  labelInputEl: ElementRef | null = null;
  wrap: HTMLElement | null = null;
  isRequired = false;

  constructor(
    public el: ElementRef,
    public rendered: Renderer2,
    public cd: ChangeDetectorRef,
    public validatorMessage: ValidatorMessage,
    @Optional() public ngModel: NgModel,
    @Optional() public ngControl: NgControl,
  ) {}

  @HostListener('blur', ['$event.target'])
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
    if (this.outline) {
      this.rendered.addClass(this.el.nativeElement, 'mat-form-field-outline');
    }
  }

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

  removeInputLabel(): void {
    if (this.labelInputEl) {
      const currentElement = this.el.nativeElement;
      this.rendered.removeChild(
        currentElement.parentNode.parentNode,
        this.labelInputEl,
      );
    }
  }

  addLabel(): void {
    const labelText = this.label;
    //labelText += this.isRequired ? '*' : '';
    this.rendered.setProperty(this.labelInputEl, 'textContent', labelText);
  }

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
    const labelText = this.label;
    //labelText += this.isRequired ? '*' : '';
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

  ngOnDestroy(): void {
    this.unsubscription.next(null);
    this.unsubscription.complete();
  }
}
