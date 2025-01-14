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

// mount point of actual urls for raw asset (only used in editor)
var _mounts = {};

/**
 * @class url
 * @static
 */
cc.url = {

    /**
     * The base url of raw assets.
     * @property {Object} _rawAssets
     * @private
     * @readOnly
     */
    _rawAssets: '',

    /**
     * The base url of builtin raw assets.
     * @property {Object} _builtinRawAssets
     * @private
     * @readOnly
     */
    _builtinRawAssets: '',
    
    normalize: function (url) {
        if (url[0] === '.' && url[1] === '/') {
            url = url.slice(2);
        }
        else if (url[0] === '/') {
            url = url.slice(1);
        }
        return url;
    },

    /**
     * Returns the url of raw assets, you will only need this if the raw asset is inside the "resources" folder.
     * 
     * @method raw
     * @param {String} url
     * @return {String}
     * @example {@link utils/api/engine/docs/cocos2d/core/platform/url/raw.js}
     */
    raw: function (url) {
        if (!this._rawAssets && CC_EDITOR) {
            cc.error('Failed to init asset\'s raw path.');
            return '';
        }

        url = this.normalize(url);

        if ( !url.startsWith('resources/') ) {
            if (CC_EDITOR) {
                cc.error('Should not load "%s" from script dynamically, ' +
                         'unless it is placed in the "resources" folder.', url);
            }
            else {
                cc.error('Sorry can not load "%s" because it is not placed in the "resources" folder.', url);
            }
        }
        
        return this._rawAssets + url;
    },

    /**
     * Returns the url of builtin raw assets. This method can only used in editor.
     * @method builtinRaw
     * @param {String} url
     * @return {String}
     * @example {@link utils/api/engine/docs/cocos2d/core/platform/url/builtinRaw.js}
     */
    builtinRaw: CC_EDITOR && function (url) {
        if ( !this._builtinRawAssets ) {
            cc.error('Failed to init builtin asset\'s raw path.');
            return '';
        }
        url = this.normalize(url);
        return this._builtinRawAssets + url;
    },

    _init: function (mountPaths) {
        for (var dir in mountPaths) {
            var path = mountPaths[dir];
            path = cc.path._setEndWithSep(path, '/');
            _mounts[dir] = path;
        }

        this._rawAssets = _mounts.assets;
        this._builtinRawAssets = _mounts.internal;
    }
};

module.exports = cc.url;
