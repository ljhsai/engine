/****************************************************************************
 Copyright (c) 2013-2016 Chukong Technologies Inc.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and  non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Chukong Aipu reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

require('../platform/CCObject');
require('../CCNode');
var IdGenerater = require('../platform/id-generater');

var Flags = cc.Object.Flags;
var IsOnEnableCalled = Flags.IsOnEnableCalled;
var IsOnLoadStarted = Flags.IsOnLoadStarted;
var IsOnLoadCalled = Flags.IsOnLoadCalled;
var IsOnStartCalled = Flags.IsOnStartCalled;

var ExecInTryCatchTmpl = CC_EDITOR && '(function call_FUNC_InTryCatch(c){try{c._FUNC_()}catch(e){cc._throw(e)}})';
if (CC_TEST) {
    ExecInTryCatchTmpl = '(function call_FUNC_InTryCatch (c) { c._FUNC_() })';
}
var callOnEnableInTryCatch = CC_EDITOR && eval(ExecInTryCatchTmpl.replace(/_FUNC_/g, 'onEnable'));
var callOnDisableInTryCatch = CC_EDITOR && eval(ExecInTryCatchTmpl.replace(/_FUNC_/g, 'onDisable'));
var callOnLoadInTryCatch = CC_EDITOR && eval(ExecInTryCatchTmpl.replace(/_FUNC_/g, 'onLoad'));
var callStartInTryCatch = CC_EDITOR && eval(ExecInTryCatchTmpl.replace(/_FUNC_/g, 'start'));
var callOnDestroyInTryCatch = CC_EDITOR && eval(ExecInTryCatchTmpl.replace(/_FUNC_/g, 'onDestroy'));
var callOnFocusInTryCatch = CC_EDITOR && eval(ExecInTryCatchTmpl.replace(/_FUNC_/g, 'onFocusInEditor'));
var callOnLostFocusInTryCatch = CC_EDITOR && eval(ExecInTryCatchTmpl.replace(/_FUNC_/g, 'onLostFocusInEditor'));

function callOnEnable (self, enable) {
    if (CC_EDITOR) {
        //if (enable ) {
        //    if ( !(self._objFlags & IsEditorOnEnabledCalled) ) {
        //        editorCallback.onComponentEnabled(self);
        //        self._objFlags |= IsEditorOnEnabledCalled;
        //    }
        //}
        //else {
        //    if (self._objFlags & IsEditorOnEnabledCalled) {
        //        editorCallback.onComponentDisabled(self);
        //        self._objFlags &= ~IsEditorOnEnabledCalled;
        //    }
        //}
        if ( !(cc.engine.isPlaying || self.constructor._executeInEditMode) ) {
            return;
        }
    }
    var enableCalled = self._objFlags & IsOnEnableCalled;
    if (enable) {
        if (!enableCalled) {
            if (self.onEnable) {
                if (CC_EDITOR) {
                    callOnEnableInTryCatch(self);
                }
                else {
                    self.onEnable();
                }
            }

            cc.director.getScheduler().resumeTarget(self);

            _registerEvent(self, true);

            self._objFlags |= IsOnEnableCalled;
        }
    }
    else {
        if (enableCalled) {
            if (self.onDisable) {
                if (CC_EDITOR) {
                    callOnDisableInTryCatch(self);
                }
                else {
                    self.onDisable();
                }
            }

            cc.director.getScheduler().pauseTarget(self);

            _registerEvent(self, false);

            self._objFlags &= ~IsOnEnableCalled;
        }
    }
}

function _registerEvent (self, on) {
    if (CC_EDITOR && !(self.constructor._executeInEditMode || cc.engine._isPlaying)) return;

    if (on && self.start && !(self._objFlags & IsOnStartCalled)) {
        cc.director.once(cc.Director.EVENT_BEFORE_UPDATE, _callStart, self);
    }

    if (self.update) {
        if (on) cc.director.on(cc.Director.EVENT_COMPONENT_UPDATE, _callUpdate, self);
        else cc.director.off(cc.Director.EVENT_COMPONENT_UPDATE, _callUpdate, self);
    }

    if (self.lateUpdate) {
        if (on) cc.director.on(cc.Director.EVENT_COMPONENT_LATE_UPDATE, _callLateUpdate, self);
        else cc.director.off(cc.Director.EVENT_COMPONENT_LATE_UPDATE, _callLateUpdate, self);
    }
}

var _callStart = CC_EDITOR ? function () {
    callStartInTryCatch(this);
    this._objFlags |= IsOnStartCalled;
} : function () {
    this.start();
    this._objFlags |= IsOnStartCalled;
};

var _callUpdate = CC_EDITOR ? function (event) {
    try {
        this.update(event.detail);
    }
    catch (e) {
        cc._throw(e);
    }
} : function (event) {
    this.update(event.detail);
};

var _callLateUpdate = CC_EDITOR ? function (event) {
    try {
        this.lateUpdate(event.detail);
    }
    catch (e) {
        cc._throw(e);
    }
} : function (event) {
    this.lateUpdate(event.detail);
};

//var createInvoker = function (timerFunc, timerWithKeyFunc, errorInfo) {
//    return function (functionOrMethodName, time) {
//        var ms = (time || 0) * 1000;
//        var self = this;
//        if (typeof functionOrMethodName === "function") {
//            return timerFunc(function () {
//                if (self.isValid) {
//                    functionOrMethodName.call(self);
//                }
//            }, ms);
//        }
//        else {
//            var method = this[functionOrMethodName];
//            if (typeof method === 'function') {
//                var key = this.id + '.' + functionOrMethodName;
//                timerWithKeyFunc(function () {
//                    if (self.isValid) {
//                        method.call(self);
//                    }
//                }, ms, key);
//            }
//            else {
//                cc.error('Can not %s %s.%s because it is not a valid function.', errorInfo, JS.getClassName(this), functionOrMethodName);
//            }
//        }
//    };
//};

var idGenerater = new IdGenerater('Comp');

/**
 * !#en
 * Base class for everything attached to Node(Entity).<br/>
 * <br/>
 * NOTE: Not allowed to use construction parameters for Component's subclasses,
 *       because Component is created by the engine.
 * !#zh
 * 所有附加到节点的基类。<br/>
 * <br/>
 * 注意：不允许使用组件的子类构造参数，因为组件是由引擎创建的。
 *
 * @class Component
 * @extends Object
 * @constructor
 */
var Component = cc.Class({
    name: 'cc.Component',
    extends: cc.Object,

    ctor: function () {
        if (CC_EDITOR && !CC_TEST && window._Scene) {
            _Scene.AssetsWatcher.initComponent(this);
        }

        // dont reset _id when destroyed
        Object.defineProperty(this, '_id', {
            value: '',
            enumerable: false
        });

        // Support for Scheduler
        this.__instanceId = cc.ClassManager.getNewInstanceId();
    },

    properties: {
        /**
         * !#en The node this component is attached to. A component is always attached to a node.
         * !#zh 该组件被附加到的节点。组件总会附加到一个节点。
         * @property node
         * @type {Node}
         * @example
         * cc.log(comp.node);
         */
        node: {
            default: null,
            visible: false
        },

        name: {
            get: function () {
                return this._name || this.node.name;
                //var className = cc.js.getClassName(this);
                //var index = className.lastIndexOf('.');
                //if (index >= 0) {
                //    // strip prefix
                //    className = className.slice(index + 1);
                //}
                //return this.node.name + '<' + className + '>';
            },
            set: function (value) {
                this._name = value;
            },
            visible: false
        },

        _id: {
            default: '',
            serializable: false
        },

        /**
         * !#en The uuid for editor.
         * !#zh 组件的 uuid，用于编辑器。
         * @property uuid
         * @type {String}
         * @readOnly
         * @example
         * cc.log(comp.uuid);
         */
        uuid: {
            get: function () {
                var id = this._id;
                if ( !id ) {
                    id = this._id = idGenerater.getNewId();
                    if (CC_DEV) {
                        cc.engine.attachedObjsForEditor[id] = this;
                    }
                }
                return id;
            },
            visible: false
        },

        __scriptAsset: CC_EDITOR && {
            get: function () {},
            set: function (value) {
                if (this.__scriptUuid !== value) {
                    if (value && Editor.UuidUtils.isUuid(value._uuid)) {
                        var classId = Editor.UuidUtils.compressUuid(value._uuid);
                        var NewComp = cc.js._getClassById(classId);
                        if (cc.isChildClassOf(NewComp, cc.Component)) {
                            cc.warn('Sorry, replacing component script is not yet implemented.');
                            //Editor.sendToWindows('reload:window-scripts', Editor._Sandbox.compiled);
                        }
                        else {
                            cc.error('Can not find a component in the script which uuid is "%s".', value._uuid);
                        }
                    }
                    else {
                        cc.error('Invalid Script');
                    }
                }
            },
            displayName: 'Script',
            type: cc._Script,
            tooltip: 'i18n:INSPECTOR.component.script'
        },

        /**
         * @property _enabled
         * @type {Boolean}
         * @private
         */
        _enabled: true,

        /**
         * !#en indicates whether this component is enabled or not.
         * !#zh 表示该组件自身是否启用。
         * @property enabled
         * @type {Boolean}
         * @default true
         * @example
         * comp.enabled = true;
         * cc.log(comp.enabled);
         */
        enabled: {
            get: function () {
                return this._enabled;
            },
            set: function (value) {
                if (this._enabled !== value) {
                    this._enabled = value;
                    if (this.node._activeInHierarchy) {
                        callOnEnable(this, value);
                    }
                }
            },
            visible: false
        },

        /**
         * !#en indicates whether this component is enabled and its node is also active in the hierarchy.
         * !#zh 表示该组件是否被启用并且所在的节点也处于激活状态。。
         * @property enabledInHierarchy
         * @type {Boolean}
         * @readOnly
         * @example
         * cc.log(comp.enabledInHierarchy);
         */
        enabledInHierarchy: {
            get: function () {
                return this._enabled && this.node._activeInHierarchy;
            },
            visible: false
        },

        /**
         * !#en TODO
         * !#zh onLoad 是否被调用。
         * @property _isOnLoadCalled
         * @type {Boolean}
         * @readOnly
         * @example
         * cc.log(_isOnLoadCalled);
         */
        _isOnLoadCalled: {
            get: function () {
                return this._objFlags & IsOnLoadCalled;
            }
        },

        /**
         * Register all related EventTargets,
         * all event callbacks will be removed in _onPreDestroy
         * @property __eventTargets
         * @type {Array}
         * @private
         */
        __eventTargets: {
            default: [],
            serializable: false
        }
    },

    // LIFECYCLE METHODS

    // Fireball provides lifecycle methods that you can specify to hook into this process.
    // We provide Pre methods, which are called right before something happens, and Post methods which are called right after something happens.

    /**
     * !#en Update is called every frame, if the Component is enabled.
     * !#zh 如果该组件启用，则每帧调用 update。
     * @method update
     */
    update: null,

    /**
     * !#en LateUpdate is called every frame, if the Component is enabled.
     * !#zh 如果该组件启用，则每帧调用 LateUpdate。
     * @method lateUpdate
     */
    lateUpdate: null,

    /**
     * !#en When attaching to an active node or its node first activated.
     * !#zh 当附加到一个激活的节点上或者其节点第一次激活时候调用。
     * @method onLoad
     */
    onLoad: null,

    /**
     * !#en Called before all scripts' update if the Component is enabled.
     * !#zh 如果该组件启用，则在所有组件的 update 之前调用。
     * @method start
     */
    start: null,

    /**
     * !#en Called when this component becomes enabled and its node is active.
     * !#zh 当该组件被启用，并且它的节点也激活时。
     * @method onEnable
     */
    onEnable: null,

    /**
     * !#en Called when this component becomes disabled or its node becomes inactive.
     * !#zh 当该组件被禁用或节点变为无效时调用。
     * @method onDisable
     */
    onDisable: null,

    /**
     * !#en Called when this component will be destroyed.
     * !#zh 当该组件被销毁时调用
     * @method onDestroy
     */
    onDestroy: null,

    /**
     * @method onFocusInEditor
     */
    onFocusInEditor: null,
    /**
     * @method onLostFocusInEditor
     */
    onLostFocusInEditor: null,

    // PUBLIC

    /**
     * !#en Adds a component class to the node. You can also add component to node by passing in the name of the script.
     * !#zh 向节点添加一个组件类，你还可以通过传入脚本的名称来添加组件。
     *
     * @method addComponent
     * @param {Function|String} typeOrTypename - the constructor or the class name of the component to add
     * @return {Component} - the newly added component
     * @example
     * var sprite = node.addComponent(cc.Sprite);
     * var test = node.addComponent("Test");
     */
    addComponent: function (typeOrTypename) {
        return this.node.addComponent(typeOrTypename);
    },

    /**
     * !#en
     * Returns the component of supplied type if the node has one attached, null if it doesn't.<br/>
     * You can also get component in the node by passing in the name of the script.
     * !#zh
     * 获取节点上指定类型的组件，如果节点有附加指定类型的组件，则返回，如果没有则为空。<br/>
     * 传入参数也可以是脚本的名称。
     *
     * @method getComponent
     * @param {Function|String} typeOrClassName
     * @return {Component}
     * @example
     * // get sprite component.
     * var sprite = node.getComponent(cc.Sprite);
     * // get custom test calss.
     * var test = node.getComponent("Test");
     */
    getComponent: function (typeOrClassName) {
        return this.node.getComponent(typeOrClassName);
    },

    /**
     * !#en Returns all components of supplied Type in the node.
     * !#zh 返回节点上指定类型的所有组件。
     *
     * @method getComponents
     * @param {Function|String} typeOrClassName
     * @return {Component[]}
     * @example
     * var sprites = node.getComponents(cc.Sprite);
     * var tests = node.getComponents("Test");
     */
    getComponents: function (typeOrClassName) {
        return this.node.getComponents(typeOrClassName);
    },

    /**
     * !#en Returns the component of supplied type in any of its children using depth first search.
     * !#zh 递归查找所有子节点中第一个匹配指定类型的组件。
     *
     * @method getComponentInChildren
     * @param {Function|String} typeOrClassName
     * @returns {Component}
     * @example
     * var sprite = node.getComponentInChildren(cc.Sprite);
     * var Test = node.getComponentInChildren("Test");
     */
    getComponentInChildren: function (typeOrClassName) {
        return this.node.getComponentInChildren(typeOrClassName);
    },

    /**
     * !#en Returns the components of supplied type in any of its children using depth first search.
     * !#zh 递归查找所有子节点中指定类型的组件。
     *
     * @method getComponentsInChildren
     * @param {Function|String} typeOrClassName
     * @returns {Component[]}
     * @example
     * var sprites = node.getComponentsInChildren(cc.Sprite);
     * var tests = node.getComponentsInChildren("Test");
     */
    getComponentsInChildren: function (typeOrClassName) {
        return this.node.getComponentsInChildren(typeOrClassName);
    },

    ///**
    // * Invokes the method on this component after a specified delay.
    // * The method will be invoked even if this component is disabled, but will not invoked if this component is
    // * destroyed.
    // *
    // * @method invoke
    // * @param {function|string} functionOrMethodName
    // * @param {number} [delay=0] - The number of seconds that the function call should be delayed by. If omitted, it defaults to 0. The actual delay may be longer.
    // * @return {number} - Will returns a new InvokeID if the functionOrMethodName is type function. InvokeID is the numerical ID of the invoke, which can be used later with cancelInvoke().
    // * @example {@link examples/Fire/Component/invoke.js }
    // */
    //invoke: createInvoker(Timer.setTimeout, Timer.setTimeoutWithKey, 'invoke'),
    //
    ///**
    // * Invokes the method on this component repeatedly, with a fixed time delay between each call.
    // * The method will be invoked even if this component is disabled, but will not invoked if this component is
    // * destroyed.
    // *
    // * @method repeat
    // * @param {function|string} functionOrMethodName
    // * @param {number} [delay=0] - The number of seconds that the function call should wait before each call to the method. If omitted, it defaults to 0. The actual delay may be longer.
    // * @return {number} - Will returns a new RepeatID if the method is type function. RepeatID is the numerical ID of the repeat, which can be used later with cancelRepeat().
    // * @example {@link examples/Fire/Component/repeat.js}
    // */
    //repeat: createInvoker(Timer.setInterval, Timer.setIntervalWithKey, 'repeat'),
    //
    ///**
    // * Cancels previous invoke calls with methodName or InvokeID on this component.
    // * When using methodName, all calls with the same methodName will be canceled.
    // * InvokeID is the identifier of the invoke action you want to cancel, as returned by invoke().
    // *
    // * @method cancelInvoke
    // * @param {string|number} methodNameOrInvokeId
    // * @example {@link examples/Fire/Component/cancelInvoke.js}
    // */
    //cancelInvoke: function (methodNameOrInvokeId) {
    //    if (typeof methodNameOrInvokeId === 'string') {
    //        var key = this.id + '.' + methodNameOrInvokeId;
    //        Timer.clearTimeoutByKey(key);
    //    }
    //    else {
    //        Timer.clearTimeout(methodNameOrInvokeId);
    //    }
    //},
    //
    ///**
    // * Cancels previous repeat calls with methodName or RepeatID on this component.
    // * When using methodName, all calls with the same methodName will be canceled.
    // * RepeatID is the identifier of the repeat action you want to cancel, as returned by repeat().
    // *
    // * @method cancelRepeat
    // * @param {string|number} methodNameOrRepeatId
    // * @example {@link examples/Fire/Component/cancelRepeat.js}
    // */
    //cancelRepeat: function (methodNameOrRepeatId) {
    //    if (typeof methodNameOrRepeatId === 'string') {
    //        var key = this.id + '.' + methodNameOrRepeatId;
    //        Timer.clearIntervalByKey(key);
    //    }
    //    else {
    //        Timer.clearInterval(methodNameOrRepeatId);
    //    }
    //},
    //
    //isInvoking: function (methodName) {
    //    var key = this.id + '.' + methodName;
    //    return Timer.hasTimeoutKey(key);
    //},

    // VIRTUAL

    /**
     * !#en
     * If the component's bounding box is different from the node's, you can implement this method to supply
     * a custom axis aligned bounding box (AABB), so the editor's scene view can perform hit test properly.
     * !#zh
     * 如果组件的包围盒与节点不同，您可以实现该方法以提供自定义的轴向对齐的包围盒（AABB），
     * 以便编辑器的场景视图可以正确地执行点选测试。
     *
     * @method _getLocalBounds
     * @param {Rect} out_rect - the Rect to receive the bounding box
     */
    _getLocalBounds: null,

    /**
     * !#en
     * onRestore is called after the user clicks the Reset item in the Inspector's context menu or performs
     * an undo operation on this component.<br/>
     * <br/>
     * If the component contains the "internal state", short for "temporary member variables which not included<br/>
     * in its CCClass properties", then you may need to implement this function.<br/>
     * <br/>
     * The editor will call the getset accessors of your component to record/restore the component's state<br/>
     * for undo/redo operation. However, in extreme cases, it may not works well. Then you should implement<br/>
     * this function to manually synchronize your component's "internal states" with its public properties.<br/>
     * Once you implement this function, all the getset accessors of your component will not be called when<br/>
     * the user performs an undo/redo operation. Which means that only the properties with default value<br/>
     * will be recorded or restored by editor.<br/>
     * <br/>
     * Similarly, the editor may failed to reset your component correctly in extreme cases. Then if you need<br/>
     * to support the reset menu, you should manually synchronize your component's "internal states" with its<br/>
     * properties in this function. Once you implement this function, all the getset accessors of your component<br/>
     * will not be called during reset operation. Which means that only the properties with default value<br/>
     * will be reset by editor.
     *
     * This function is only called in editor mode.
     * !#zh
     * onRestore 是用户在检查器菜单点击 Reset 时，对此组件执行撤消操作后调用的。<br/>
     * <br/>
     * 如果组件包含了“内部状态”（不在 CCClass 属性中定义的临时成员变量），那么你可能需要实现该方法。<br/>
     * <br/>
     * 编辑器执行撤销/重做操作时，将调用组件的 get set 来录制和还原组件的状态。
     * 然而，在极端的情况下，它可能无法良好运作。<br/>
     * 那么你就应该实现这个方法，手动根据组件的属性同步“内部状态”。
     * 一旦你实现这个方法，当用户撤销或重做时，组件的所有 get set 都不会再被调用。
     * 这意味着仅仅指定了默认值的属性将被编辑器记录和还原。<br/>
     * <br/>
     * 同样的，编辑可能无法在极端情况下正确地重置您的组件。<br/>
     * 于是如果你需要支持组件重置菜单，你需要在该方法中手工同步组件属性到“内部状态”。<br/>
     * 一旦你实现这个方法，组件的所有 get set 都不会在重置操作时被调用。
     * 这意味着仅仅指定了默认值的属性将被编辑器重置。
     * <br/>
     * 此方法仅在编辑器下会被调用。
     * @method onRestore
     */
    onRestore: null,

    // OVERRIDE

    destroy: function () {
        if (CC_EDITOR) {
            var depend = this.node._getDependComponent(this);
            if (depend) {
                return cc.error("Can't remove '%s' because '%s' depends on it.",
                    cc.js.getClassName(this), cc.js.getClassName(depend));
            }
        }
        if (this._super()) {
            if (this._enabled && this.node._activeInHierarchy) {
                callOnEnable(this, false);
            }
        }
    },

    __onNodeActivated: CC_EDITOR ? function (active) {
        if (!(this._objFlags & IsOnLoadStarted) &&
            (cc.engine._isPlaying || this.constructor._executeInEditMode)) {
            this._objFlags |= IsOnLoadStarted;

            if (this.onLoad) {
                callOnLoadInTryCatch(this);
            }

            this._objFlags |= IsOnLoadCalled;

            if (this.onLoad && !cc.engine._isPlaying) {
                var focused = Editor.Selection.curActivate('node') === this.node.uuid;
                if (focused && this.onFocusInEditor) {
                    callOnFocusInTryCatch(this);
                }
                else if (this.onLostFocusInEditor) {
                    callOnLostFocusInTryCatch(this);
                }
            }
            if ( !CC_TEST ) {
                _Scene.AssetsWatcher.start(this);
            }
        }

        if (this._enabled) {
            callOnEnable(this, active);
        }
    } : function (active) {
        if (!(this._objFlags & IsOnLoadStarted)) {
            this._objFlags |= IsOnLoadStarted;
            if (this.onLoad) {
                this.onLoad();
            }
            this._objFlags |= IsOnLoadCalled;
        }

        if (this._enabled) {
            callOnEnable(this, active);
        }
    },

    _onPreDestroy: function () {
        var i, l, target;
        // ensure onDisable called
        callOnEnable(this, false);

        // Schedules
        this.unscheduleAllCallbacks();

        // Remove all listeners
        for (i = 0, l = this.__eventTargets.length; i < l; ++i) {
            target = this.__eventTargets[i];
            target && target.targetOff(this);
        }
        this.__eventTargets.length = 0;

        // Remove all listeners
        cc.eventManager.removeListeners(this);

        // onDestroy
        if (CC_EDITOR) {
            if ( !CC_TEST ) {
                _Scene.AssetsWatcher.stop(this);
            }
            if (cc.engine._isPlaying || this.constructor._executeInEditMode) {
                if (this.onDestroy) {
                    callOnDestroyInTryCatch(this);
                }
            }
        }
        else if (this.onDestroy) {
            this.onDestroy();
        }
        // do remove component
        this.node._removeComponent(this);

        if (CC_DEV) {
            delete cc.engine.attachedObjsForEditor[this._id];
        }
    },

    _instantiate: function () {
        var clone = cc.instantiate._clone(this, this);
        clone.node = null;
        return clone;
    },

// Scheduler

    isRunning: function () {
        return this.enabledInHierarchy;
    },

    /**
     * !#en
     * Schedules a custom selector.<br/>
     * If the selector is already scheduled, then the interval parameter will be updated without scheduling it again.
     * !#zh
     * 调度一个自定义的回调函数。<br/>
     * 如果回调函数已调度，那么将不会重复调度它，只会更新时间间隔参数。
     * @method schedule
     * @param {function} callback The callback function
     * @param {Number} [interval=0]  Tick interval in seconds. 0 means tick every frame. If interval = 0, it's recommended to use scheduleUpdate() instead.
     * @param {Number} [repeat=cc.macro.REPEAT_FOREVER]    The selector will be executed (repeat + 1) times, you can use kCCRepeatForever for tick infinitely.
     * @param {Number} [delay=0]     The amount of time that the first tick will wait before execution.
     * @example
     * var squashAction = cc.scaleTo(0.2, 1, 0.6);
     * this.seq = cc.sequence(squashAction);
     */
    schedule: function (callback, interval, repeat, delay) {
        cc.assert(callback, cc._LogInfos.Node.schedule);
        cc.assert(interval >= 0, cc._LogInfos.Node.schedule_2);

        interval = interval || 0;
        repeat = isNaN(repeat) ? cc.macro.REPEAT_FOREVER : repeat;
        delay = delay || 0;

        cc.director.getScheduler().schedule(callback, this, interval, repeat, delay, !this.enabledInHierarchy);
    },

    /**
     * !#en Schedules a callback function that runs only once, with a delay of 0 or larger.
     * !#zh 调度一个只运行一次的回调函数，可以指定 0 让回调函数在下一帧立即执行或者在一定的延时之后执行。
     * @method scheduleOnce
     * @see cc.Node#schedule
     * @param {function} callback  A function wrapped as a selector
     * @param {Number} [delay=0]  The amount of time that the first tick will wait before execution.
     * @example
     * var squashAction = cc.scaleTo(0.2, 1, 0.6);
     * this.seq = cc.scheduleOnce(squashAction);
     */
    scheduleOnce: function (callback, delay) {
        this.schedule(callback, 0, 0, delay);
    },

    /**
     * !#en Unschedules a custom callback function.
     * !#zh 取消调度一个自定义的回调函数。
     * @method unschedule
     * @see cc.Node#schedule
     * @param {function} callback_fn  A function wrapped as a selector
     * @example
     * this.unschedule(_callback);
     */
    unschedule: function (callback_fn) {
        if (!callback_fn)
            return;

        cc.director.getScheduler().unschedule(callback_fn, this);
    },

    /**
     * !#en
     * unschedule all scheduled callback functions: custom callback functions, and the 'update' callback function.<br/>
     * Actions are not affected by this method.
     * !#zh 取消调度所有已调度的回调函数：定制的回调函数以及 'update' 回调函数。动作不受此方法影响。
     * @method unscheduleAllCallbacks
     * @example
     * this.unscheduleAllCallbacks();
     */
    unscheduleAllCallbacks: function () {
        cc.director.getScheduler().unscheduleAllForTarget(this);
    },
});

Component._requireComponent = null;

if (CC_DEV) {

    // INHERITABLE STATIC MEMBERS

    Component._executeInEditMode = false;
    Component._playOnFocus = false;
    Component._disallowMultiple = null;
    Component._help = '';

    // NON-INHERITED STATIC MEMBERS

    Object.defineProperty(Component, '_inspector', { value: '', enumerable: false });
    Object.defineProperty(Component, '_icon', { value: '', enumerable: false });

    // COMPONENT HELPERS

    cc._componentMenuItems = [];

    Component._addMenuItem = function (cls, path, priority) {
        cc._componentMenuItems.push({
            component: cls,
            menuPath: path,
            priority: priority
        });
    };
}

// use defineProperty to prevent inherited by sub classes
Object.defineProperty(Component, '_registerEditorProps', {
    value: function (cls, props) {
        var reqComp = props.requireComponent;
        if (reqComp) {
            cls._requireComponent = reqComp;
        }
        if (CC_DEV) {
            var name = cc.js.getClassName(cls);
            for (var key in props) {
                var val = props[key];
                switch (key) {

                    case 'executeInEditMode':
                        cls._executeInEditMode = !!val;
                        break;

                    case 'playOnFocus':
                        if (val) {
                            var willExecuteInEditMode = ('executeInEditMode' in props) ? props.executeInEditMode : cls._executeInEditMode;
                            if (willExecuteInEditMode) {
                                cls._playOnFocus = true;
                            }
                            else {
                                cc.warn('The editor property "playOnFocus" should be used with "executeInEditMode" in class "%s".', name);
                            }
                        }
                        break;

                    case 'inspector':
                        Object.defineProperty(cls, '_inspector', { value: val });
                        break;

                    case 'icon':
                        Object.defineProperty(cls, '_icon', { value: val });
                        break;

                    case 'menu':
                        Component._addMenuItem(cls, val, props.menuPriority);
                        break;

                    case 'disallowMultiple':
                        cls._disallowMultiple = cls;
                        break;

                    case 'requireComponent':
                        // skip here
                        break;

                    case 'help':
                        cls._help = val;
                        break;

                    default:
                        cc.warn('Unknown editor property "%s" in class "%s".', key, name);
                        break;
                }
            }
        }
    }
});

Component.prototype.__scriptUuid = '';

cc.Component = module.exports = Component;
