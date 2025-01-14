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

/**
 * !#en
 * Component will register a event to target component's handler.
 * And it will trigger the handler when a certain event occurs.
 *
 * !@zh
 * “EventHandler” 类用来设置场景中的事件回调，
 * 该类允许用户设置回调目标节点，目标组件名，组件方法名，
 * 并可通过 emit 方法调用目标函数。
 * @class Component.EventHandler
 * @example
 * // Create new EventHandler
 * 1. var eventHandler = cc.Component.EventHandler(target, "MainMenu", "OnClick");
 * 2. var eventHandler = cc.Component.EventHandler();
 *    eventHandler.target = newTarget;
 *    eventHandler.component = "MainMenu";
 *    eventHandler.handler = "OnClick"
 */
cc.Component.EventHandler = cc.Class({
    name: 'cc.ClickEvent',
    properties: {
        /**
         * !#en Event target
         * !#zh 目标节点
         * @property target
         * @type {Node}
         * @default null
         */
        target: {
            default: null,
            type: cc.Node,
        },
        /**
         * !#en Component name
         * !#zh 目标组件名
         * @property component
         * @type {String}
         * @default ''
         */
        component: {
            default: '',
        },
        /**
         * !#en Event handler
         * !#zh 响应事件函数名
         * @property handler
         * @type {String}
         * @default ''
         */
        handler: {
            default: '',
        }
    },

    statics: {
        /**
         * @method emitEvents
         * @param {Component.EventHandler[]} events
         * @param {*} params
         * @statics
         */
        emitEvents: function(events, params) {
            for (var i = 0, l = events.length; i < l; i++) {
                var event = events[i];
                if (! event instanceof cc.Component.EventHandler) continue;

                event.emit(params);
            }
        }
    },

    /**
     * !#en Emit event with params
     * !#zh 触发目标组件上的指定 handler 函数，该参数是回调函数的参数值（可不填）。
     * @method emit
     * @param {*} params
     * @example
     * // Call Function
     * var eventHandler = cc.Component.EventHandler(target, "MainMenu", "OnClick");
     * eventHandler.emit("This is the argument to the callback function!");
     */
    emit: function(params) {
        var target = this.target;
        if (!cc.isValid(target)) return;

        var comp = target.getComponent(this.component);
        if (!cc.isValid(comp)) return;

        var handler = comp[this.handler];
        if (typeof(handler) !== 'function') return;

        handler.call(comp, params);
    }
});
