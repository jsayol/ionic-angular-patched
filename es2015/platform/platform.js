import { EventEmitter, OpaqueToken } from '@angular/core';
import { ready, windowDimensions, flushDimensionCache } from '../util/dom';
import { removeArrayItem } from '../util/util';
/**
 * @name Platform
 * @description
 * The Platform service can be used to get information about your current device.
 * You can get all of the platforms associated with the device using the [platforms](#platforms)
 * method, including whether the app is being viewed from a tablet, if it's
 * on a mobile device or browser, and the exact platform (iOS, Android, etc).
 * You can also get the orientation of the device, if it uses right-to-left
 * language direction, and much much more. With this information you can completely
 * customize your app to fit any device.
 *
 * @usage
 * ```ts
 * import { Platform } from 'ionic-angular';
 *
 * @Component({...})
 * export MyPage {
 *   constructor(platform: Platform) {
 *     this.platform = platform;
 *   }
 * }
 * ```
 * @demo /docs/v2/demos/src/platform/
 */
export class Platform {
    constructor() {
        this._versions = {};
        this._onResizes = [];
        this._bbActions = [];
        this._pW = 0;
        this._pH = 0;
        this._lW = 0;
        this._lH = 0;
        this._isPortrait = null;
        /** @private */
        this._platforms = [];
        // Events meant to be triggered by the engine
        // **********************************************
        /**
         * @private
         */
        this.backButton = new EventEmitter();
        /**
         * The pause event emits when the native platform puts the application
         * into the background, typically when the user switches to a different
         * application. This event would emit when a Cordova app is put into
         * the background, however, it would not fire on a standard web browser.
         */
        this.pause = new EventEmitter();
        /**
         * The resume event emits when the native platform pulls the application
         * out from the background. This event would emit when a Cordova app comes
         * out from the background, however, it would not fire on a standard web browser.
         */
        this.resume = new EventEmitter();
        this._readyPromise = new Promise(res => { this._readyResolve = res; });
        this.backButton.subscribe(() => {
            // the hardware back button event has been fired
            (void 0) /* console.debug */;
            // decide which backbutton action should run
            this.runBackButtonAction();
        });
    }
    /**
     * @private
     */
    setZone(zone) {
        this.zone = zone;
    }
    // Methods
    // **********************************************
    /**
     * @returns {boolean} returns true/false based on platform.
     * @description
     * Depending on the platform the user is on, `is(platformName)` will
     * return `true` or `false`. Note that the same app can return `true`
     * for more than one platform name. For example, an app running from
     * an iPad would return `true` for the platform names: `mobile`,
     * `ios`, `ipad`, and `tablet`. Additionally, if the app was running
     * from Cordova then `cordova` would be true, and if it was running
     * from a web browser on the iPad then `mobileweb` would be `true`.
     *
     * ```
     * import { Platform } from 'ionic-angular';
     *
     * @Component({...})
     * export MyPage {
     *   constructor(platform: Platform) {
     *     this.platform = platform;
     *
     *     if (this.platform.is('ios')) {
     *       // This will only print when on iOS
     *       console.log("I'm an iOS device!");
     *     }
     *   }
     * }
     * ```
     *
     * | Platform Name   | Description                        |
     * |-----------------|------------------------------------|
     * | android         | on a device running Android.       |
     * | cordova         | on a device running Cordova.       |
     * | core            | on a desktop device.               |
     * | ios             | on a device running iOS.           |
     * | ipad            | on an iPad device.                 |
     * | iphone          | on an iPhone device.               |
     * | mobile          | on a mobile device.                |
     * | mobileweb       | in a browser on a mobile device.   |
     * | phablet         | on a phablet device.               |
     * | tablet          | on a tablet device.                |
     * | windows         | on a device running Windows.       |
     *
     * @param {string} platformName
     */
    is(platformName) {
        return (this._platforms.indexOf(platformName) > -1);
    }
    /**
     * @returns {array} the array of platforms
     * @description
     * Depending on what device you are on, `platforms` can return multiple values.
     * Each possible value is a hierarchy of platforms. For example, on an iPhone,
     * it would return `mobile`, `ios`, and `iphone`.
     *
     * ```
     * import { Platform } from 'ionic-angular';
     *
     * @Component({...})
     * export MyPage {
     *   constructor(platform: Platform) {
     *     this.platform = platform;
     *
     *     // This will print an array of the current platforms
     *     console.log(this.platform.platforms());
     *   }
     * }
     * ```
     */
    platforms() {
        // get the array of active platforms, which also knows the hierarchy,
        // with the last one the most important
        return this._platforms;
    }
    /**
     * Returns an object containing version information about all of the platforms.
     *
     * ```
     * import { Platform } from 'ionic-angular';
     *
     * @Component({...})
     * export MyPage {
     *   constructor(platform: Platform) {
     *     this.platform = platform;
     *
     *     // This will print an object containing
     *     // all of the platforms and their versions
     *     console.log(platform.versions());
     *   }
     * }
     * ```
     *
     * @returns {object} An object containing all of the platforms and their versions.
     */
    versions() {
        // get all the platforms that have a valid parsed version
        return this._versions;
    }
    /**
     * @private
     */
    version() {
        for (var platformName in this._versions) {
            if (this._versions[platformName]) {
                return this._versions[platformName];
            }
        }
        return {};
    }
    /**
     * Returns a promise when the platform is ready and native functionality
     * can be called. If the app is running from within a web browser, then
     * the promise will resolve when the DOM is ready. When the app is running
     * from an application engine such as Cordova, then the promise will
     * resolve when Cordova triggers the `deviceready` event.
     *
     * The resolved value is the `readySource`, which states which platform
     * ready was used. For example, when Cordova is ready, the resolved ready
     * source is `cordova`. The default ready source value will be `dom`. The
     * `readySource` is useful if different logic should run depending on the
     * platform the app is running from. For example, only Cordova can execute
     * the status bar plugin, so the web should not run status bar plugin logic.
     *
     * ```
     * import { Component } from '@angular/core';
     * import { Platform } from 'ionic-angular';
     *
     * @Component({...})
     * export MyApp {
     *   constructor(platform: Platform) {
     *     platform.ready().then((readySource) => {
     *       console.log('Platform ready from', readySource);
     *       // Platform now ready, execute any required native code
     *     });
     *   }
     * }
     * ```
     * @returns {promise}
     */
    ready() {
        return this._readyPromise;
    }
    /**
     * @private
     * This should be triggered by the engine when the platform is
     * ready. If there was no custom prepareReady method from the engine,
     * such as Cordova or Electron, then it uses the default DOM ready.
     */
    triggerReady(readySource) {
        this.zone.run(() => {
            this._readyResolve(readySource);
        });
    }
    /**
     * @private
     * This is the default prepareReady if it's not replaced by an engine,
     * such as Cordova or Electron. If there was no custom prepareReady
     * method from an engine then it uses the method below, which triggers
     * the platform ready on the DOM ready event, and the default resolved
     * value is `dom`.
     */
    prepareReady() {
        ready(() => {
            this.triggerReady('dom');
        });
    }
    /**
     * Set the app's language direction, which will update the `dir` attribute
     * on the app's root `<html>` element. We recommend the app's `index.html`
     * file already has the correct `dir` attribute value set, such as
     * `<html dir="ltr">` or `<html dir="rtl">`. This method is useful if the
     * direction needs to be dynamically changed per user/session.
     * [W3C: Structural markup and right-to-left text in HTML](http://www.w3.org/International/questions/qa-html-dir)
     * @param {string} dir  Examples: `rtl`, `ltr`
     */
    setDir(dir, updateDocument) {
        this._dir = (dir || '').toLowerCase();
        if (updateDocument !== false) {
            document.documentElement.setAttribute('dir', dir);
        }
    }
    /**
     * Returns app's language direction.
     * We recommend the app's `index.html` file already has the correct `dir`
     * attribute value set, such as `<html dir="ltr">` or `<html dir="rtl">`.
     * [W3C: Structural markup and right-to-left text in HTML](http://www.w3.org/International/questions/qa-html-dir)
     * @returns {string}
     */
    dir() {
        return this._dir;
    }
    /**
     * Returns if this app is using right-to-left language direction or not.
     * We recommend the app's `index.html` file already has the correct `dir`
     * attribute value set, such as `<html dir="ltr">` or `<html dir="rtl">`.
     * [W3C: Structural markup and right-to-left text in HTML](http://www.w3.org/International/questions/qa-html-dir)
     * @returns {boolean}
     */
    isRTL() {
        return (this._dir === 'rtl');
    }
    /**
     * Set the app's language and optionally the country code, which will update
     * the `lang` attribute on the app's root `<html>` element.
     * We recommend the app's `index.html` file already has the correct `lang`
     * attribute value set, such as `<html lang="en">`. This method is useful if
     * the language needs to be dynamically changed per user/session.
     * [W3C: Declaring language in HTML](http://www.w3.org/International/questions/qa-html-language-declarations)
     * @param {string} language  Examples: `en-US`, `en-GB`, `ar`, `de`, `zh`, `es-MX`
     */
    setLang(language, updateDocument) {
        this._lang = language;
        if (updateDocument !== false) {
            document.documentElement.setAttribute('lang', language);
        }
    }
    /**
     * Returns app's language and optional country code.
     * We recommend the app's `index.html` file already has the correct `lang`
     * attribute value set, such as `<html lang="en">`.
     * [W3C: Declaring language in HTML](http://www.w3.org/International/questions/qa-html-language-declarations)
     * @returns {string}
     */
    lang() {
        return this._lang;
    }
    // Methods meant to be overridden by the engine
    // **********************************************
    // Provided NOOP methods so they do not error when
    // called by engines (the browser)that do not provide them
    /**
     * @private
     */
    exitApp() { }
    /**
     * The back button event is triggered when the user presses the native
     * platform's back button, also referred to as the "hardware" back button.
     * This event is only used within Cordova apps running on Android and
     * Windows platforms. This event is not fired on iOS since iOS doesn't come
     * with a hardware back button in the same sense an Android or Windows device
     * does.
     *
     * Registering a hardware back button action and setting a priority allows
     * apps to control which action should be called when the hardware back
     * button is pressed. This method decides which of the registered back button
     * actions has the highest priority and should be called.
     *
     * @param {Function} callback Called when the back button is pressed,
     * if this registered action has the highest priority.
     * @param {number} priority Set the priority for this action. Only the highest priority will execute. Defaults to `0`.
     * @returns {Function} A function that, when called, will unregister
     * the its back button action.
     */
    registerBackButtonAction(fn, priority = 0) {
        const action = { fn, priority };
        this._bbActions.push(action);
        // return a function to unregister this back button action
        return () => {
            removeArrayItem(this._bbActions, action);
        };
    }
    /**
     * @private
     */
    runBackButtonAction() {
        // decide which one back button action should run
        let winner = null;
        this._bbActions.forEach((action) => {
            if (!winner || action.priority >= winner.priority) {
                winner = action;
            }
        });
        // run the winning action if there is one
        winner && winner.fn && winner.fn();
    }
    // Getter/Setter Methods
    // **********************************************
    /**
     * @private
     */
    setUserAgent(userAgent) {
        this._ua = userAgent;
    }
    /**
     * @private
     */
    setQueryParams(queryParams) {
        this._qp = queryParams;
    }
    /**
     * @private
     */
    userAgent() {
        return this._ua || '';
    }
    /**
     * @private
     */
    setNavigatorPlatform(navigatorPlatform) {
        this._bPlt = navigatorPlatform;
    }
    /**
     * @private
     */
    navigatorPlatform() {
        return this._bPlt || '';
    }
    /**
     * Gets the width of the platform's viewport using `window.innerWidth`.
     * Using this method is preferred since the dimension is a cached value,
     * which reduces the chance of multiple and expensive DOM reads.
     */
    width() {
        this._calcDim();
        return this._isPortrait ? this._pW : this._lW;
    }
    /**
     * Gets the height of the platform's viewport using `window.innerHeight`.
     * Using this method is preferred since the dimension is a cached value,
     * which reduces the chance of multiple and expensive DOM reads.
     */
    height() {
        this._calcDim();
        return this._isPortrait ? this._pH : this._lH;
    }
    /**
     * Returns `true` if the app is in portait mode.
     */
    isPortrait() {
        this._calcDim();
        return this._isPortrait;
    }
    /**
     * Returns `true` if the app is in landscape mode.
     */
    isLandscape() {
        return !this.isPortrait();
    }
    /**
     * @private
     */
    _calcDim() {
        if (this._isPortrait === null) {
            const winDimensions = windowDimensions();
            const screenWidth = window.screen.width || winDimensions.width;
            const screenHeight = window.screen.height || winDimensions.height;
            if (screenWidth < screenHeight) {
                this._isPortrait = true;
                if (this._pW < winDimensions.width) {
                    this._pW = winDimensions.width;
                }
                if (this._pH < winDimensions.height) {
                    this._pH = winDimensions.height;
                }
            }
            else {
                this._isPortrait = false;
                if (this._lW < winDimensions.width) {
                    this._lW = winDimensions.width;
                }
                if (this._lH < winDimensions.height) {
                    this._lH = winDimensions.height;
                }
            }
        }
    }
    /**
     * @private
     */
    windowResize() {
        clearTimeout(this._resizeTm);
        this._resizeTm = setTimeout(() => {
            flushDimensionCache();
            this._isPortrait = null;
            for (let i = 0; i < this._onResizes.length; i++) {
                try {
                    this._onResizes[i]();
                }
                catch (e) {
                    console.error(e);
                }
            }
        }, 200);
    }
    /**
     * @private
     */
    onResize(cb) {
        const self = this;
        self._onResizes.push(cb);
        return function () {
            removeArrayItem(self._onResizes, cb);
        };
    }
    // Platform Registry
    // **********************************************
    /**
     * @private
     */
    setPlatformConfigs(platformConfigs) {
        this._registry = platformConfigs || {};
    }
    /**
     * @private
     */
    getPlatformConfig(platformName) {
        return this._registry[platformName] || {};
    }
    /**
     * @private
     */
    registry() {
        return this._registry;
    }
    /**
     * @private
     */
    setDefault(platformName) {
        this._default = platformName;
    }
    /**
     * @private
     */
    testQuery(queryValue, queryTestValue) {
        const valueSplit = queryValue.toLowerCase().split(';');
        return valueSplit.indexOf(queryTestValue) > -1;
    }
    /**
     * @private
     */
    testNavigatorPlatform(navigatorPlatformExpression) {
        const rgx = new RegExp(navigatorPlatformExpression, 'i');
        return rgx.test(this._bPlt);
    }
    /**
     * @private
     */
    matchUserAgentVersion(userAgentExpression) {
        if (this._ua && userAgentExpression) {
            const val = this._ua.match(userAgentExpression);
            if (val) {
                return {
                    major: val[1],
                    minor: val[2]
                };
            }
        }
    }
    testUserAgent(expression) {
        if (this._ua) {
            return this._ua.indexOf(expression) >= 0;
        }
        return false;
    }
    /**
     * @private
     */
    isPlatformMatch(queryStringName, userAgentAtLeastHas, userAgentMustNotHave = []) {
        const queryValue = this._qp.get('ionicplatform');
        if (queryValue) {
            return this.testQuery(queryValue, queryStringName);
        }
        userAgentAtLeastHas = userAgentAtLeastHas || [queryStringName];
        const userAgent = this._ua.toLowerCase();
        for (var i = 0; i < userAgentAtLeastHas.length; i++) {
            if (userAgent.indexOf(userAgentAtLeastHas[i]) > -1) {
                for (var j = 0; j < userAgentMustNotHave.length; j++) {
                    if (userAgent.indexOf(userAgentMustNotHave[j]) > -1) {
                        return false;
                    }
                }
                return true;
            }
        }
        return false;
    }
    /** @private */
    init() {
        let rootPlatformNode;
        let enginePlatformNode;
        // figure out the most specific platform and active engine
        let tmpPlatform;
        for (let platformName in this._registry) {
            tmpPlatform = this.matchPlatform(platformName);
            if (tmpPlatform) {
                // we found a platform match!
                // check if its more specific than the one we already have
                if (tmpPlatform.isEngine) {
                    // because it matched then this should be the active engine
                    // you cannot have more than one active engine
                    enginePlatformNode = tmpPlatform;
                }
                else if (!rootPlatformNode || tmpPlatform.depth > rootPlatformNode.depth) {
                    // only find the root node for platforms that are not engines
                    // set this node as the root since we either don't already
                    // have one, or this one is more specific that the current one
                    rootPlatformNode = tmpPlatform;
                }
            }
        }
        if (!rootPlatformNode) {
            rootPlatformNode = new PlatformNode(this._registry, this._default);
        }
        // build a Platform instance filled with the
        // hierarchy of active platforms and settings
        if (rootPlatformNode) {
            // check if we found an engine node (cordova/node-webkit/etc)
            if (enginePlatformNode) {
                // add the engine to the first in the platform hierarchy
                // the original rootPlatformNode now becomes a child
                // of the engineNode, which is not the new root
                enginePlatformNode.child = rootPlatformNode;
                rootPlatformNode.parent = enginePlatformNode;
                rootPlatformNode = enginePlatformNode;
            }
            let platformNode = rootPlatformNode;
            while (platformNode) {
                insertSuperset(this._registry, platformNode);
                platformNode = platformNode.child;
            }
            // make sure the root noot is actually the root
            // incase a node was inserted before the root
            platformNode = rootPlatformNode.parent;
            while (platformNode) {
                rootPlatformNode = platformNode;
                platformNode = platformNode.parent;
            }
            platformNode = rootPlatformNode;
            while (platformNode) {
                platformNode.initialize(this);
                // set the array of active platforms with
                // the last one in the array the most important
                this._platforms.push(platformNode.name);
                // get the platforms version if a version parser was provided
                this._versions[platformNode.name] = platformNode.version(this);
                // go to the next platform child
                platformNode = platformNode.child;
            }
        }
        if (this._platforms.indexOf('mobile') > -1 && this._platforms.indexOf('cordova') === -1) {
            this._platforms.push('mobileweb');
        }
    }
    /**
     * @private
     */
    matchPlatform(platformName) {
        // build a PlatformNode and assign config data to it
        // use it's getRoot method to build up its hierarchy
        // depending on which platforms match
        let platformNode = new PlatformNode(this._registry, platformName);
        let rootNode = platformNode.getRoot(this);
        if (rootNode) {
            rootNode.depth = 0;
            let childPlatform = rootNode.child;
            while (childPlatform) {
                rootNode.depth++;
                childPlatform = childPlatform.child;
            }
        }
        return rootNode;
    }
}
function insertSuperset(registry, platformNode) {
    let supersetPlaformName = platformNode.superset();
    if (supersetPlaformName) {
        // add a platform in between two exist platforms
        // so we can build the correct hierarchy of active platforms
        let supersetPlatform = new PlatformNode(registry, supersetPlaformName);
        supersetPlatform.parent = platformNode.parent;
        supersetPlatform.child = platformNode;
        if (supersetPlatform.parent) {
            supersetPlatform.parent.child = supersetPlatform;
        }
        platformNode.parent = supersetPlatform;
    }
}
/**
 * @private
 */
class PlatformNode {
    constructor(registry, platformName) {
        this.registry = registry;
        this.c = registry[platformName];
        this.name = platformName;
        this.isEngine = this.c.isEngine;
    }
    settings() {
        return this.c.settings || {};
    }
    superset() {
        return this.c.superset;
    }
    isMatch(p) {
        return this.c.isMatch && this.c.isMatch(p) || false;
    }
    initialize(platform) {
        this.c.initialize && this.c.initialize(platform);
    }
    version(p) {
        if (this.c.versionParser) {
            const v = this.c.versionParser(p);
            if (v) {
                const str = v.major + '.' + v.minor;
                return {
                    str: str,
                    num: parseFloat(str),
                    major: parseInt(v.major, 10),
                    minor: parseInt(v.minor, 10)
                };
            }
        }
    }
    getRoot(p) {
        if (this.isMatch(p)) {
            let parents = this.getSubsetParents(this.name);
            if (!parents.length) {
                return this;
            }
            let platformNode = null;
            let rootPlatformNode = null;
            for (let i = 0; i < parents.length; i++) {
                platformNode = new PlatformNode(this.registry, parents[i]);
                platformNode.child = this;
                rootPlatformNode = platformNode.getRoot(p);
                if (rootPlatformNode) {
                    this.parent = platformNode;
                    return rootPlatformNode;
                }
            }
        }
        return null;
    }
    getSubsetParents(subsetPlatformName) {
        const parentPlatformNames = [];
        let platform = null;
        for (let platformName in this.registry) {
            platform = this.registry[platformName];
            if (platform.subsets && platform.subsets.indexOf(subsetPlatformName) > -1) {
                parentPlatformNames.push(platformName);
            }
        }
        return parentPlatformNames;
    }
}
/**
 * @private
 */
export function setupPlatform(platformConfigs, queryParams, userAgent, navigatorPlatform, docDirection, docLanguage, zone) {
    const p = new Platform();
    p.setDefault('core');
    p.setPlatformConfigs(platformConfigs);
    p.setUserAgent(userAgent);
    p.setQueryParams(queryParams);
    p.setNavigatorPlatform(navigatorPlatform);
    p.setDir(docDirection, false);
    p.setLang(docLanguage, false);
    p.setZone(zone);
    p.init();
    return p;
}
/**
 * @private
 */
export const UserAgentToken = new OpaqueToken('USERAGENT');
/**
 * @private
 */
export const NavigatorPlatformToken = new OpaqueToken('NAVPLT');
/**
 * @private
 */
export const DocumentDirToken = new OpaqueToken('DOCDIR');
/**
 * @private
 */
export const DocLangToken = new OpaqueToken('DOCLANG');
//# sourceMappingURL=platform.js.map