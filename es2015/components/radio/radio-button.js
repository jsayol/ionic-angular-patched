import { Component, ElementRef, EventEmitter, HostListener, Input, Optional, Output, Renderer, ViewEncapsulation } from '@angular/core';
import { Config } from '../../config/config';
import { Form } from '../../util/form';
import { Ion } from '../ion';
import { isBlank, isCheckedProperty, isPresent, isTrueProperty } from '../../util/util';
import { Item } from '../item/item';
import { RadioGroup } from './radio-group';
/**
 * @description
 * A radio button is a button that can be either checked or unchecked. A user can tap
 * the button to check or uncheck it. It can also be checked from the template using
 * the `checked` property.
 *
 * Use an element with a `radio-group` attribute to group a set of radio buttons. When
 * radio buttons are inside a [radio group](../RadioGroup), exactly one radio button
 * in the group can be checked at any time. If a radio button is not placed in a group,
 * they will all have the ability to be checked at the same time.
 *
 * See the [Angular Forms Docs](https://angular.io/docs/ts/latest/guide/forms.html) for
 * more information on forms and input.
 *
 * @usage
 * ```html
 * <ion-list radio-group [(ngModel)]="relationship">
 *   <ion-item>
 *     <ion-label>Friends</ion-label>
 *     <ion-radio value="friends" checked></ion-radio>
 *   </ion-item>
 *   <ion-item>
 *     <ion-label>Family</ion-label>
 *     <ion-radio value="family"></ion-radio>
 *   </ion-item>
 *   <ion-item>
 *     <ion-label>Enemies</ion-label>
 *     <ion-radio value="enemies" [disabled]="isDisabled"></ion-radio>
 *   </ion-item>
 * </ion-list>
 * ```
 * @demo /docs/v2/demos/src/radio/
 * @see {@link /docs/v2/components#radio Radio Component Docs}
 * @see {@link ../RadioGroup RadioGroup API Docs}
 */
export class RadioButton extends Ion {
    constructor(_form, config, elementRef, renderer, _item, _group) {
        super(config, elementRef, renderer, 'radio');
        this._form = _form;
        this._item = _item;
        this._group = _group;
        /**
         * @internal
         */
        this._checked = false;
        /**
         * @internal
         */
        this._disabled = false;
        /**
         * @internal
         */
        this._value = null;
        /**
         * @output {any} expression to be evaluated when selected
         */
        this.ionSelect = new EventEmitter();
        _form.register(this);
        if (_group) {
            // register with the radiogroup
            this.id = 'rb-' + _group.add(this);
        }
        if (_item) {
            // register the input inside of the item
            // reset to the item's id instead of the radiogroup id
            this.id = 'rb-' + _item.registerInput('radio');
            this._labelId = 'lbl-' + _item.id;
            this._item.setElementClass('item-radio', true);
        }
    }
    /**
     * @input {string} The predefined color to use. For example: `"primary"`, `"secondary"`, `"danger"`.
     */
    set color(val) {
        this._setColor(val);
        if (this._item) {
            this._item._updateColor(val, 'item-radio');
        }
    }
    /**
     * @input {string} The mode to apply to this component.
     */
    set mode(val) {
        this._setMode(val);
    }
    /**
     * @input {any} The value of the radio button. Defaults to the generated id.
     */
    get value() {
        // if the value is not defined then use it's unique id
        return isBlank(this._value) ? this.id : this._value;
    }
    set value(val) {
        this._value = val;
    }
    /**
     * @input {boolean} Whether the radio button should be checked or not. Default false.
     */
    get checked() {
        return this._checked;
    }
    set checked(isChecked) {
        this._checked = isTrueProperty(isChecked);
        if (this._item) {
            this._item.setElementClass('item-radio-checked', this._checked);
        }
    }
    /**
     * @input {boolean} Whether the radio button should be disabled or not. Default false.
     */
    get disabled() {
        return this._disabled;
    }
    set disabled(val) {
        this._disabled = isTrueProperty(val);
        this._item && this._item.setElementClass('item-radio-disabled', this._disabled);
    }
    /**
     * @private
     */
    initFocus() {
        this._elementRef.nativeElement.querySelector('button').focus();
    }
    /**
     * @internal
     */
    _click(ev) {
        (void 0) /* console.debug */;
        ev.preventDefault();
        ev.stopPropagation();
        this.checked = true;
        this.ionSelect.emit(this.value);
    }
    /**
     * @internal
     */
    ngOnInit() {
        if (this._group && isPresent(this._group.value)) {
            this.checked = isCheckedProperty(this._group.value, this.value);
        }
    }
    /**
     * @internal
     */
    ngOnDestroy() {
        this._form.deregister(this);
        this._group && this._group.remove(this);
    }
}
RadioButton.decorators = [
    { type: Component, args: [{
                selector: 'ion-radio',
                template: '<div class="radio-icon" [class.radio-checked]="_checked"> ' +
                    '<div class="radio-inner"></div> ' +
                    '</div> ' +
                    '<button role="radio" ' +
                    'type="button" ' +
                    'ion-button="item-cover" ' +
                    '[id]="id" ' +
                    '[attr.aria-checked]="_checked" ' +
                    '[attr.aria-labelledby]="_labelId" ' +
                    '[attr.aria-disabled]="_disabled" ' +
                    'class="item-cover"> ' +
                    '</button>',
                host: {
                    '[class.radio-disabled]': '_disabled'
                },
                encapsulation: ViewEncapsulation.None,
            },] },
];
/** @nocollapse */
RadioButton.ctorParameters = [
    { type: Form, },
    { type: Config, },
    { type: ElementRef, },
    { type: Renderer, },
    { type: Item, decorators: [{ type: Optional },] },
    { type: RadioGroup, decorators: [{ type: Optional },] },
];
RadioButton.propDecorators = {
    'color': [{ type: Input },],
    'mode': [{ type: Input },],
    'ionSelect': [{ type: Output },],
    'value': [{ type: Input },],
    'checked': [{ type: Input },],
    'disabled': [{ type: Input },],
    '_click': [{ type: HostListener, args: ['click', ['$event'],] },],
};
//# sourceMappingURL=radio-button.js.map