import { Directive, ElementRef, HostBinding, Input, Renderer } from '@angular/core';
import { isTrueProperty } from '../../util/util';
import { Config } from '../../config/config';
import { Ion } from '../ion';
/**
 * @name Icon
 * @description
 * Icons can be used on their own, or inside of a number of Ionic components.
 * For a full list of available icons, check out the
 * [Ionicons docs](../../../../ionicons).
 *
 * One feature of Ionicons in Ionic is when icon names are set, the actual icon
 * which is rendered can change slightly depending on the mode the app is
 * running from. For example, by setting the icon name of `alarm`, on iOS the
 * icon will automatically apply `ios-alarm`, and on Material Design it will
 * automatically apply `md-alarm`. This allows the developer to write the
 * markup once while Ionic applies the appropriate icon based on the mode.
 *
 * @usage
 * ```html
 * <!-- automatically uses the correct "star" icon depending on the mode -->
 * <ion-icon name="star"></ion-icon>
 *
 * <!-- explicity set the icon for each mode -->
 * <ion-icon ios="ios-home" md="md-home"></ion-icon>
 *
 * <!-- always use the same icon, no matter what the mode -->
 * <ion-icon name="ios-clock"></ion-icon>
 * <ion-icon name="logo-twitter"></ion-icon>
 * ```
 *
 * @demo /docs/v2/demos/src/icon/
 * @see {@link /docs/v2/components#icons Icon Component Docs}
 *
 */
export class Icon extends Ion {
    constructor(config, elementRef, renderer) {
        super(config, elementRef, renderer, 'icon');
        /** @private */
        this._isActive = true;
        /** @private */
        this._name = '';
        /** @private */
        this._ios = '';
        /** @private */
        this._md = '';
        /** @private */
        this._css = '';
        /**
         * @private
         */
        this._hidden = false;
        this._iconMode = config.get('iconMode');
    }
    /**
     * @input {string} The predefined color to use. For example: `"primary"`, `"secondary"`, `"danger"`.
     */
    get color() {
        return this._color;
    }
    set color(value) {
        this._setColor(value);
    }
    /**
     * @input {string} The mode to apply to this component.
     */
    set mode(val) {
        this._setMode(val);
    }
    /**
     * @private
     */
    ngOnDestroy() {
        if (this._css) {
            this.setElementClass(this._css, false);
        }
    }
    /**
     * @input {string} Icon to use. Will load the appropriate icon for each mode
     */
    get name() {
        return this._name;
    }
    set name(val) {
        if (!(/^md-|^ios-|^logo-/.test(val))) {
            // this does not have one of the defaults
            // so lets auto add in the mode prefix for them
            this._name = this._iconMode + '-' + val;
        }
        else {
            this._name = val;
        }
        this.update();
    }
    /**
     * @input {string} Explicitly set the icon to use on iOS
     */
    get ios() {
        return this._ios;
    }
    set ios(val) {
        this._ios = val;
        this.update();
    }
    /**
     * @input {string} Explicitly set the icon to use on MD
     */
    get md() {
        return this._md;
    }
    set md(val) {
        this._md = val;
        this.update();
    }
    /**
     * @input {bool} Whether or not the icon has an "active" appearance. On iOS an active icon is filled in or full appearance, and an inactive icon on iOS will use an outlined version of the icon same icon. Material Design icons do not change appearance depending if they're active or not. The `isActive` property is largely used by the tabbar.
     */
    get isActive() {
        return this._isActive;
    }
    set isActive(val) {
        this._isActive = isTrueProperty(val);
        this.update();
    }
    /**
     * @private
     */
    update() {
        let name;
        if (this._ios && this._iconMode === 'ios') {
            name = this._ios;
        }
        else if (this._md && this._iconMode === 'md') {
            name = this._md;
        }
        else {
            name = this._name;
        }
        let hidden = this._hidden = (name === null);
        if (hidden) {
            return;
        }
        let iconMode = name.split('-', 2)[0];
        if (iconMode === 'ios' &&
            !this._isActive &&
            name.indexOf('logo-') < 0 &&
            name.indexOf('-outline') < 0) {
            name += '-outline';
        }
        let css = 'ion-' + name;
        if (this._css === css) {
            return;
        }
        if (this._css) {
            this.setElementClass(this._css, false);
        }
        this._css = css;
        this.setElementClass(css, true);
        let label = name
            .replace('ios-', '')
            .replace('md-', '')
            .replace('-', ' ');
        this.setElementAttribute('aria-label', label);
    }
}
Icon.decorators = [
    { type: Directive, args: [{
                selector: 'ion-icon',
                host: {
                    'role': 'img'
                }
            },] },
];
/** @nocollapse */
Icon.ctorParameters = [
    { type: Config, },
    { type: ElementRef, },
    { type: Renderer, },
];
Icon.propDecorators = {
    'color': [{ type: Input },],
    'mode': [{ type: Input },],
    'name': [{ type: Input },],
    'ios': [{ type: Input },],
    'md': [{ type: Input },],
    'isActive': [{ type: Input },],
    '_hidden': [{ type: HostBinding, args: ['class.hide',] },],
};
//# sourceMappingURL=icon.js.map