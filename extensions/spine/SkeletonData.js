/****************************************************************************
 Copyright (c) 2016 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

/**
 * @module sp
 */

// implements a simple texture loader like sp._atlasLoader
var TextureLoader = cc.Class({
    ctor: function () {
        // {SkeletonData}
        this.asset = arguments[0];
    },
    getTexture: function (line) {
        //var name = cc.path.mainFileName(line);
        //var textures = this.asset.textures;
        //for (var i = 0; i < textures.length; i++) {
        //    var tex = textures[i];
        //    if (tex.name === name) {
        //        return tex;
        //    }
        //}
        var urls = this.asset.textures;
        for (var i = 0; i < urls.length; i++) {
            var url = urls[i];
            if (url.endsWith(line)) {
                return cc.textureCache.addImage(url);
            }
        }
        return null;
    },
    load: function (page, line, spAtlas) {
        var texture = this.getTexture(line);
        if (texture) {
            if (cc._renderType === cc.game.RENDER_TYPE_WEBGL) {
                page.rendererObject = new cc.TextureAtlas(texture, 128);
                page.width = texture.getPixelWidth();
                page.height = texture.getPixelHeight();
            }
            else {
                page._texture = texture;
            }
        }
        else {
            cc.error('Failed to load spine atlas "$s"', line);
        }
    },
    unload: function (obj) {
        //page.rendererObject.release();
    }
});

/**
 * The skeleton data of spine.
 *
 * @class SkeletonData
 * @extends cc.Asset
 */
var SkeletonData = cc.Class({
    name: 'sp.SkeletonData',
    extends: cc.Asset,

    ctor: function () {
        this.reset();
    },

    properties: {

        _skeletonJson: null,

        /**
         * See http://en.esotericsoftware.com/spine-json-format
         * @property {object} skeletonJson
         */
        skeletonJson: {
            get: function () {
                return this._skeletonJson;
            },
            set: function (value) {
                this._skeletonJson = value;
                this.reset();
            }
        },

        _atlasText: "",

        /**
         * @property {string} atlasText
         */
        atlasText: {
            get: function () {
                return this._atlasText;
            },
            set: function (value) {
                this._atlasText = value;
                this.reset();
            }
        },

        /**
         * @property {cc.Texture2D} textures
         */
        textures: {
            default: [],
            url: [cc.Texture2D]
        },

        /**
         * A scale can be specified on the JSON or binary loader which will scale the bone positions,
         * image sizes, and animation translations.
         * This can be useful when using different sized images than were used when designing the skeleton
         * in Spine. For example, if using images that are half the size than were used in Spine,
         * a scale of 0.5 can be used. This is commonly used for games that can run with either low or high
         * resolution texture atlases.
         *
         * @see http://en.esotericsoftware.com/spine-using-runtimes#Scaling
         * @property {number} scale
         */
        scale: 1
    },

    // PUBLIC

    createNode: function (callback) {
        //var Url = require('fire-url');
        //var node = new cc.Node(Url.basenameNoExt(info.url));
        //var skeleton = node.addComponent(sp.Skeleton);
        //skeleton.skeletonFile = info.url;

        var node = new cc.Node(this.name);
        var skeleton = node.addComponent(sp.Skeleton);
        skeleton.skeletonData = this;

        return callback(null, node);
    },

    reset: function () {
        /**
         * @property {spine.SkeletonData} _skeletonData
         * @private
         */
        this._skeletonCache = null;
        /**
         * @property {spine.Atlas} _atlasCache
         * @private
         */
        this._atlasCache = null;
        if (CC_EDITOR) {
            this._skinsEnum = null;
            this._animsEnum = null;
        }
    },

    /**
     * Get the included SkeletonData used in spine runtime.
     * @method getRuntimeData
     * @param {boolean} [quiet=false]
     * @return {spine.SkeletonData}
     */
    getRuntimeData: function (quiet) {
        if (this._skeletonCache) {
            return this._skeletonCache;
        }


        if ( !(this.textures && this.textures.length > 0) ) {
            if ( !quiet ) {
                cc.error('Please re-import "%s" because its textures is not initialized! (This workflow will be improved in the future.)', this.name);
            }
            return null;
        }

        var atlas = this._getAtlas(quiet);
        if (! atlas) {
            return null;
        }
        var attachmentLoader = new sp.spine.AtlasAttachmentLoader(atlas);
        var jsonReader = new sp.spine.SkeletonJson(attachmentLoader);
        jsonReader.scale = this.scale;

        var json = this.skeletonJson;
        this._skeletonCache = jsonReader.readSkeletonData(json);
        atlas.dispose(jsonReader);

        return this._skeletonCache;
    },

    // EDITOR

    getSkinsEnum: CC_EDITOR && function () {
        if (this._skinsEnum) {
            return this._skinsEnum;
        }
        var sd = this.getRuntimeData(true);
        if (sd) {
            var skins = sd.skins;
            var enumDef = {};
            for (var i = 0; i < skins.length; i++) {
                var name = skins[i].name;
                enumDef[name] = i;
            }
            return this._skinsEnum = cc.Enum(enumDef);
        }
        return null;
    },

    getAnimsEnum: CC_EDITOR && function () {
        if (this._animsEnum) {
            return this._animsEnum;
        }
        var sd = this.getRuntimeData(true);
        if (sd) {
            var enumDef = { '<None>': 0 };
            var anims = sd.animations;
            for (var i = 0; i < anims.length; i++) {
                var name = anims[i].name;
                enumDef[name] = i + 1;
            }
            return this._animsEnum = cc.Enum(enumDef);
        }
        return null;
    },

    // PRIVATE

    /**
     * @method _getAtlas
     * @param {boolean} [quiet=false]
     * @return {spine.Atlas}
     * @private
     */
    _getAtlas: function (quiet) {
        if (this._atlasCache) {
            return this._atlasCache;
        }

        if ( !this.atlasText ) {
            if ( !quiet ) {
                cc.error('The atlas asset of "%s" is not exists!', this.name);
            }
            return null;
        }

        return this._atlasCache = new sp.spine.Atlas(this.atlasText, new TextureLoader(this));
    }
});

sp.SkeletonData = module.exports = SkeletonData;