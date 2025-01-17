/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

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
 * A brief explanation for "project.json":
 * Here is the content of project.json file, this is the global configuration for your game, you can modify it to customize some behavior.
 * The detail of each field is under it.
 {
    "debugMode"     : 1,
    // "debugMode" possible values :
    //      0 - No message will be printed.
    //      1 - cc.error, cc.assert, cc.warn, cc.log will print in console.
    //      2 - cc.error, cc.assert, cc.warn will print in console.
    //      3 - cc.error, cc.assert will print in console.
    //      4 - cc.error, cc.assert, cc.warn, cc.log will print on canvas, available only on web.
    //      5 - cc.error, cc.assert, cc.warn will print on canvas, available only on web.
    //      6 - cc.error, cc.assert will print on canvas, available only on web.

    "showFPS"       : true,
    // Left bottom corner fps information will show when "showFPS" equals true, otherwise it will be hide.

    "frameRate"     : 60,
    // "frameRate" set the wanted frame rate for your game, but the real fps depends on your game implementation and the running environment.

    "id"            : "gameCanvas",
    // "gameCanvas" sets the id of your canvas element on the web page, it's useful only on web.

    "renderMode"    : 0,
    // "renderMode" sets the renderer type, only useful on web :
    //      0 - Automatically chosen by engine
    //      1 - Forced to use canvas renderer
    //      2 - Forced to use WebGL renderer, but this will be ignored on mobile browsers

    "engineDir"     : "../../frameworks/cocos2d-html5/",
    // In debug mode, if you use the whole engine to develop your game, you should specify its relative path with "engineDir",
    // but if you are using a single engine file, you can ignore it.

    "modules"       : ["cocos2d", "extensions", "external"],
    // "modules" defines which modules you will need in your game, it's useful only on web,
    // using this can greatly reduce your game's resource size, and the cocos console tool can package your game with only the modules you set.
    // For details about modules definitions, you can refer to "../../frameworks/cocos2d-html5/modulesConfig.json".

    "plugin": {
        "facebook": {
            "appId" : "1426774790893461",
            "xfbml" : true,
            "version" : "v2.0"
        }
    },
    // "plugin" is used by plugin-x for its settings, if you don't use it, you can ignore it.

    "jsList"        : [
    ]
    // "jsList" sets the list of js files in your game.
 }
 *
 */

if(cc.sys){
    var scene3SearchPaths = cc.sys.localStorage.getItem("Scene3SearchPaths");
    if (scene3SearchPaths)
        jsb.fileUtils.setSearchPaths(JSON.parse(scene3SearchPaths));
}

cc.game.run({
    "debugMode"     : 1,
    "showFPS"       : true,
    "frameRate"     : 60,
    "id"            : "gameCanvas",
    "renderMode"    : 0,

    "jsList"        : [
        '../../cocos2d/core/base-nodes/CCAtlasNode.js',
        '../../cocos2d/core/base-nodes/CCAtlasNodeCanvasRenderCmd.js',
        '../../cocos2d/core/base-nodes/CCAtlasNodeWebGLRenderCmd.js',

        '../../cocos2d/menus/CCMenuItem.js',
        '../../cocos2d/menus/CCMenu.js',

        "../../cocos2d/core/labelttf/LabelTTFPropertyDefine.js",
        "../../cocos2d/core/labelttf/CCLabelTTF.js",
        "../../cocos2d/core/labelttf/CCLabelTTFCanvasRenderCmd.js",
        "../../cocos2d/core/labelttf/CCLabelTTFWebGLRenderCmd.js",

        "../../cocos2d/labels/CCLabelAtlas.js",
        "../../cocos2d/labels/CCLabelAtlasCanvasRenderCmd.js",
        "../../cocos2d/labels/CCLabelAtlasWebGLRenderCmd.js",
        "../../cocos2d/labels/CCLabelBMFont.js",
        "../../cocos2d/labels/CCLabelBMFontCanvasRenderCmd.js",
        "../../cocos2d/labels/CCLabelBMFontWebGLRenderCmd.js",

        "../../cocos2d/particle/CCSGParticleExamples.js",

        "../../cocos2d/actions/CCActionCatmullRom.js",

        "src/BaseTestLayer/BaseTestLayer.js",

        "src/tests_resources.js",
        "src/tests-main.js",

        "src/PathTest/PathTest.js",

        "src/BakeLayerTest/BakeLayerTest.js",

        "src/SchedulerTest/SchedulerTest.js",
        "src/ActionsTest/ActionsTest.js",
        "src/TileMapTest/TileMapTest.js",
        "src/DrawPrimitivesTest/DrawPrimitivesTest.js",
        "src/ParticleTest/ParticleTest.js",
        "src/ProgressActionsTest/ProgressActionsTest.js",
        "src/LayerTest/LayerTest.js",
        "src/SpineTest/SpineTest.js",
        "src/SpriteTest/SpriteTest.js",
        "src/TextureCacheTest/TextureCacheTest.js",
        "src/CocosDenshionTest/CocosDenshionTest.js",
        "src/CocosNodeTest/CocosNodeTest.js",
        "src/RenderTextureTest/RenderTextureTest.js",
        "src/IntervalTest/IntervalTest.js",
        "src/ActionManagerTest/ActionManagerTest.js",
        "src/EaseActionsTest/EaseActionsTest.js",
        "src/ParallaxTest/ParallaxTest.js",
        "src/LabelTest/LabelTest.js",
        "src/NewEventManagerTest/NewEventManagerTest.js",
        "src/SysTest/SysTest.js",
        "src/SysTest/ScriptTestTempFile.js",
        "src/ClippingNodeTest/ClippingNodeTest.js",
        "src/OpenGLTest/OpenGLTest.js",

        "src/ExtensionsTest/ExtensionsTest.js",
        "src/ExtensionsTest/AssetsManagerTest/AssetsManagerTest.js",
        "src/ExtensionsTest/CCPoolTest/CCPoolTest.js",
        "src/ExtensionsTest/S9SpriteTest/S9SpriteTest.js",
        "src/ExtensionsTest/NetworkTest/WebSocketTest.js",
        "src/ExtensionsTest/NetworkTest/SocketIOTest.js",

        "src/XHRTest/XHRTest.js",
        "src/XHRTest/XHRArrayBufferTest.js",

        "src/ReflectionTest/ReflectionTest.js",

        "src/SpritePolygonTest/SpritePolygonTest.js",

        "src/NodeEventTest/NodeEventTest.js"
    ]
}, function(){
    cc.view.enableRetina(false);
    if (cc.sys.isNative) {
        var resolutionPolicy = (cc.sys.os == cc.sys.OS_WP8 || cc.sys.os == cc.sys.OS_WINRT) ? cc.ResolutionPolicy.SHOW_ALL : cc.ResolutionPolicy.FIXED_HEIGHT;
        cc.view.setDesignResolutionSize(800, 450, resolutionPolicy);
        cc.view.resizeWithBrowserSize(true);
        var searchPaths = jsb.fileUtils.getSearchPaths();
        searchPaths.push('script');
        searchPaths.push('src');
        var paths = [
            'res/resjs',
            'res',
            'res/scenetest',
            'res/scenetest/ArmatureComponentTest',
            'res/scenetest/AttributeComponentTest',
            'res/scenetest/BackgroundComponentTest',
            'res/scenetest/EffectComponentTest',
            'res/scenetest/LoadSceneEdtiorFileTest',
            'res/scenetest/ParticleComponentTest',
            'res/scenetest/SpriteComponentTest',
            'res/scenetest/TmxMapComponentTest',
            'res/scenetest/UIComponentTest',
            'res/scenetest/TriggerTest'
        ];
        for (var i = 0; i < paths.length; i++) {
            searchPaths.push(paths[i]);
        }
        jsb.fileUtils.setSearchPaths(searchPaths);
    }

    cc.LoaderScene.preload(g_resources, function () {
        if(window.sideIndexBar && typeof sideIndexBar.start === 'function'){
            sideIndexBar.start();
        }else{
            var scene = new _ccsg.Scene();
            scene.addChild(new TestController());
            cc.director.runScene(scene);
        }
    }, this);
});
