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
var JS = require('../platform/js');
var Path = require('../utils/CCPath');
var Pipeline = require('./pipeline');

var downloadAudio;
if (!CC_EDITOR || !Editor.isCoreLevel) {
    downloadAudio = require('./audio-downloader');
}
else {
    downloadAudio = null;
}
// var downloadBinary = require('binary-downloader');

function isUrlCrossOrigin (url) {
    if (!url) {
        cc.log('invalid URL');
        return false;
    }
    var startIndex = url.indexOf('://');
    if (startIndex === -1)
        return false;

    var endIndex = url.indexOf('/', startIndex + 3);
    var urlOrigin = (endIndex === -1) ? url : url.substring(0, endIndex);
    return urlOrigin !== location.origin;
};

var _noCacheRex = /\?/;
function urlAppendTimestamp (url) {
    if (cc.game.config['noCache'] && typeof url === 'string') {
        if(_noCacheRex.test(url))
            url += '&_t=' + (new Date() - 0);
        else
            url += '?_t=' + (new Date() - 0);
    }
    return url;
}

function downloadScript (item, callback, isAsync) {
    var url = item.url,
        d = document, 
        s = document.createElement('script');
    s.async = isAsync;
    s.src = urlAppendTimestamp(url);
    function loadHandler () {
        s.parentNode.removeChild(s);
        s.removeEventListener('load', loadHandler, false);
        s.removeEventListener('error', errorHandler, false);
        callback(null, url);
    }
    function errorHandler() {
        s.parentNode.removeChild(s);
        s.removeEventListener('load', loadHandler, false);
        s.removeEventListener('error', errorHandler, false);
        callback(new Error('Load ' + url + ' failed!'), url);
    }
    s.addEventListener('load', loadHandler, false);
    s.addEventListener('error', errorHandler, false);
    d.body.appendChild(s);
}

function downloadText (item, callback) {
    var url = item.url,
        xhr = Pipeline.getXMLHttpRequest(),
        errInfo = 'Load ' + url + ' failed!',
        navigator = window.navigator;

    url = urlAppendTimestamp(url);

    xhr.open('GET', url, true);
    if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
        // IE-specific logic here
        xhr.setRequestHeader('Accept-Charset', 'utf-8');
        xhr.onreadystatechange = function () {
            if(xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0) {
                    callback(null, xhr.responseText);
                }
                else {
                    callback({status:xhr.status, errorMessage:errInfo});
                }
            }
        };
    } else {
        if (xhr.overrideMimeType) xhr.overrideMimeType('text\/plain; charset=utf-8');
        xhr.onload = function () {
            if(xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0) {
                    callback(null, xhr.responseText);
                }
                else {
                    callback({status:xhr.status, errorMessage:errInfo});
                }
            }
        };
        xhr.onerror = function(){
            callback({status:xhr.status, errorMessage:errInfo});
        };
    }
    xhr.send(null);
}

function downloadTextSync (item) {
    var url = item.url;
    var xhr = Pipeline.getXMLHttpRequest();
    xhr.open('GET', url, false);
    if (/msie/i.test(window.navigator.userAgent) && !/opera/i.test(window.navigator.userAgent)) {
        // IE-specific logic here
        xhr.setRequestHeader('Accept-Charset', 'utf-8');
    } else {
        if (xhr.overrideMimeType) xhr.overrideMimeType('text\/plain; charset=utf-8');
    }
    xhr.send(null);
    if (xhr.readyState !== 4 || !(xhr.status === 200 || xhr.status === 0)) {
        return null;
    }
    return xhr.responseText;
}

function downloadImage (item, callback, isCrossOrigin) {
    if (isCrossOrigin === undefined) {
        isCrossOrigin = true;
    }

    var url = urlAppendTimestamp(item.url);
    var img = new Image();
    if (isCrossOrigin && window.location.origin !== 'file://') {
        img.crossOrigin = 'anonymous';
    }

    if (img.complete && img.naturalWidth > 0) {
        callback(null, img);
    }
    else {
        function loadCallback () {
            img.removeEventListener('load', loadCallback);
            img.removeEventListener('error', errorCallback);

            if (callback) {
                callback(null, img);
            }
        }
        function errorCallback () {
            img.removeEventListener('load', loadCallback);
            img.removeEventListener('error', errorCallback);

            if (img.crossOrigin && img.crossOrigin.toLowerCase() === 'anonymous') {
                downloadImage(url, callback, false);
            }
            else {
                callback('Load image (' + url + ') failed');
            }
        }

        img.addEventListener('load', loadCallback);
        img.addEventListener('error', errorCallback);
    }
    img.src = url;
}

var FONT_TYPE = {
    '.eot' : 'embedded-opentype',
    '.ttf' : 'truetype',
    '.ttc' : 'truetype',
    '.woff' : 'woff',
    '.svg' : 'svg'
};
function _loadFont (name, srcs, type){
    var doc = document, 
        path = cc.path, 
        fontStyle = document.createElement('style');
    fontStyle.type = 'text/css';
    doc.body.appendChild(fontStyle);

    var fontStr = '';
    if (isNaN(name - 0)) {
        fontStr += '@font-face { font-family:' + name + '; src:';
    }
    else {
        fontStr += '@font-face { font-family:\'' + name + '\'; src:';
    }
    if (srcs instanceof Array) {
        for (var i = 0, li = srcs.length; i < li; i++) {
            var src = srcs[i];
            type = path.extname(src).toLowerCase();
            fontStr += 'url(\'' + srcs[i] + '\') format(\'' + FONT_TYPE[type] + '\')';
            fontStr += (i === li - 1) ? ';' : ',';
        }
    } else {
        type = type.toLowerCase();
        fontStr += 'url(\'' + srcs + '\') format(\'' + FONT_TYPE[type] + '\');';
    }
    fontStyle.textContent += fontStr + '}';

    //<div style="font-family: PressStart;">.</div>
    var preloadDiv = document.createElement('div');
    var _divStyle =  preloadDiv.style;
    _divStyle.fontFamily = name;
    preloadDiv.innerHTML = '.';
    _divStyle.position = 'absolute';
    _divStyle.left = '-100px';
    _divStyle.top = '-100px';
    doc.body.appendChild(preloadDiv);
}
function downloadFont (item, callback) {
    var url = item.url,
        type = item.type, 
        name = item.name, 
        srcs = item.srcs;
    if (name && srcs) {
        if (srcs.indexOf(url) === -1) {
            srcs.push(url);
        }
        _loadFont(name, srcs);
    } else {
        type = cc.path.extname(url);
        name = cc.path.basename(url, type);
        _loadFont(name, url, type);
    }
    if (document.fonts) {
        document.fonts.load('1em ' + name).then(function () {
            callback(null, null);
        }, function(err){
            callback(err);
        });
    } else {
        callback(null, null);
    }
}

function downloadUuid (item, callback) {
    var uuid = item.id;
    var self = this;
    cc.AssetLibrary.queryAssetInfo(uuid, function (error, url, isRawAsset) {
        if (error) {
            callback(error);
        }
        else {
            item.url = url;
            item.isRawAsset = isRawAsset;
            if (isRawAsset) {
                var ext = Path.extname(url).toLowerCase();
                if (!ext) {
                    callback(new Error('Download Uuid: can not find type of raw asset[' + uuid + ']: ' + url));
                    return;
                }
                ext = ext.substr(1);
                // Dispatch to other raw type downloader
                var downloadFunc = self.extMap[ext] || self.extMap['default'];
                item.type = ext;
                downloadFunc(item, callback);
            }
            else {
                self.extMap['json'](item, callback);
            }
        }
    });
}


var defaultMap = {
    // JS
    'js' : downloadScript,

    // Images
    'png' : downloadImage,
    'jpg' : downloadImage,
    'bmp' : downloadImage,
    'jpeg' : downloadImage,
    'gif' : downloadImage,
    'ico' : downloadImage,
    'tiff' : downloadImage,
    'webp' : downloadImage,
    'image' : downloadImage,

    // Audio
    'mp3' : downloadAudio,
    'ogg' : downloadAudio,
    'wav' : downloadAudio,
    'mp4' : downloadAudio,
    'm4a' : downloadAudio,

    // Txt
    'txt' : downloadText,
    'xml' : downloadText,
    'vsh' : downloadText,
    'fsh' : downloadText,
    'atlas' : downloadText,

    'tmx' : downloadText,
    'tsx' : downloadText,

    'json' : downloadText,
    'ExportJson' : downloadText,
    'plist' : downloadText,

    'fnt' : downloadText,

    // Font
    'font' : downloadFont,
    'eot' : downloadFont,
    'ttf' : downloadFont,
    'woff' : downloadFont,
    'svg' : downloadFont,
    'ttc' : downloadFont,

    // Deserializer
    'uuid' : downloadUuid,
    'prefab' : downloadUuid,
    'fire' : downloadUuid,
    'scene' : downloadUuid,

    'default' : downloadText
};

var ID = 'Downloader';

/**
 * The downloader pipe, it can download several types of files:
 * 1. Text
 * 2. Image
 * 3. Script
 * 4. Audio
 * All unknown type will be downloaded as plain text.
 * You can pass custom supported types in the constructor.
 * @class Pipeline.Downloader
 */
/**
 * Constructor of Downloader, you can pass custom supported types.
 * @example
 *  var downloader = new Downloader({
 *      // This will match all url with `.scene` extension or all url with `scene` type
 *      'scene' : function (url, callback) {}
 *  });
 * 
 * @method Downloader
 * @param {Object} extMap Custom supported types with corresponded handler
 */
var Downloader = function (extMap) {
    this.id = ID;
    this.async = true;
    this.pipeline = null;
    this.maxConcurrent = 2;
    this._curConcurrent = 0;
    this._loadQueue = [];

    this.extMap = JS.mixin(extMap, defaultMap);
};
Downloader.ID = ID;
JS.mixin(Downloader.prototype, {
    /**
     * Add custom supported types handler or modify existing type handler.
     * @method addHandlers
     * @param {Object} extMap Custom supported types with corresponded handler
     */
    addHandlers: function (extMap) {
        this.extMap = JS.mixin(this.extMap, extMap);
    },

    handle: function (item, callback) {
        var self = this;
        var downloadFunc = this.extMap[item.type] || this.extMap['default'];
        if (this._curConcurrent < this.maxConcurrent) {
            if (cc.sys.isMobile) {
                this._curConcurrent++;
            }
            downloadFunc.call(this, item, function (err, result) {
                if (cc.sys.isMobile) {
                    // Concurrent logic
                    self._curConcurrent = Math.max(0, self._curConcurrent - 1);

                    while (self._curConcurrent < self.maxConcurrent) {
                        var nextOne = self._loadQueue.shift();
                        if (!nextOne) {
                            break;
                        }
                        self.handle(nextOne.item, nextOne.callback);
                    }
                }

                callback && callback(err, result);
            });
        }
        else {
            this._loadQueue.push({
                item: item,
                callback: callback
            });
        }
    }
});

Pipeline.Downloader = module.exports = Downloader;