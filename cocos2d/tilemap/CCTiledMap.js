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
 * !#en The orientation of tiled map.
 * !#zh Tiled Map 地图方向。
 * @enum TiledMap.Orientation
 * @static
 */
var Orientation = cc.Enum({
    /**
     * !#en Orthogonal orientation.
     * !#zh 直角鸟瞰地图（90°地图）。
     * @property ORTHO
     * @type {Number}
     * @static
     */
    ORTHO: 0,

    /**
     * !#en Hexagonal orientation.
     * !#zh 六边形地图
     * @property HEX
     * @type {Number}
     * @static
     */
    HEX: 1,

    /**
     * Isometric orientation.
     * 等距斜视地图（斜45°地图）。
     * @property ISO
     * @type {Number}
     * @static
     */
    ISO: 2
});

/*
 * The property type of tiled map.
 * @enum TiledMap.Property
 * @static
 */
var Property = cc.Enum({
    /**
     * @property NONE
     * @type {Number}
     * @static
     */
    NONE: 0,

    /**
     * @property MAP
     * @type {Number}
     * @static
     */
    MAP: 1,

    /**
     * @property LAYER
     * @type {Number}
     * @static
     */
    LAYER: 2,

    /**
     * @property OBJECTGROUP
     * @type {Number}
     * @static
     */
    OBJECTGROUP: 3,

    /**
     * @property OBJECT
     * @type {Number}
     * @static
     */
    OBJECT: 4,

    /**
     * @property TILE
     * @type {Number}
     * @static
     */
    TILE: 5
});

/*
 * The tile flags of tiled map.
 * @enum TiledMap.TileFlag
 * @static
 */
var TileFlag = cc.Enum({
    /**
     * @property HORIZONTAL
     * @type {Number}
     * @static
     */
    HORIZONTAL: 0x80000000,

    /**
     * @property VERTICAL
     * @type {Number}
     * @static
     */
    VERTICAL: 0x40000000,

    /**
     * @property DIAGONAL
     * @type {Number}
     * @static
     */
    DIAGONAL: 0x20000000,

    /**
     * @property FLIPPED_ALL
     * @type {Number}
     * @static
     */
    FLIPPED_ALL: (0x80000000 | 0x40000000 | 0x20000000) >>> 0,

    /**
     * @property FLIPPED_MASK
     * @type {Number}
     * @static
     */
    FLIPPED_MASK: (~((0x80000000 | 0x40000000 | 0x20000000) >>> 0)) >>> 0
});

/**
 * !#en Renders a TMX Tile Map in the scene.
 * !#zh 在场景中渲染一个 tmx 格式的 Tile Map。
 * @class TiledMap
 * @extends Component
 */
var TiledMap = cc.Class({
    name: 'cc.TiledMap',
    extends: cc._RendererInSG,

    editor: CC_EDITOR && {
        menu: 'i18n:MAIN_MENU.component.renderers/TiledMap',
    },

    statics: {
        Orientation: Orientation,
        Property: Property,
        TileFlag: TileFlag
    },

    properties: {
        _isLoading: {
            default: false,
            serializable: false,
        },
        
        // the detached array of TiledLayer 
        _detachedLayers: {
            default: [],
            serializable: false,
        },

        /**
         * !#en The tmx file.
         * !#zh tmx 文件。
         * @property {String} tmxFile
         * @default ""
         */
        _tmxFile: {
            default: '',
            url: cc.TiledMapAsset
        },

        tmxFile : {
            get: function () {
                return this._tmxFile;
            },
            set: function (value, force) {
                if (this._tmxFile !== value || (CC_EDITOR && force)) {
                    this._tmxFile = value;
                    this._applyFile();
                }
            },
            url: cc.TiledMapAsset
        },

        /**
         * !#en The event handler to be called when the map is loaded.
         * !#zh 在加载在地图时要调用的事件处理程序。
         * @property {Component.EventHandler} mapLoaded
         */
        mapLoaded: {
            default: [],
            type: cc.Component.EventHandler,
        }
    },

    /**
     * !#en Gets the map size.
     * !#zh 获取地图大小。
     * @method getMapSize
     * @return {Size}
     * @example
     * var mapSize = tiledMap.getMapSize();
     * cc.log("Map Size: " + mapSize);
     */
    getMapSize:function () {
        return this._sgNode.getMapSize();
    },

    /**
     * !#en Set the map size.
     * !#zh 设置地图大小。
     * @method setMapSize
     * @param {Size} mapSize
     * @example
     * tiledMap.setMapSize(new cc.size(960, 640));
     */
    setMapSize:function (mapSize) {
        this._sgNode.setMapSize(mapSize);
    },

    /**
     * !#en Gets the tile size.
     * !#zh 获取地图背景中 tile 元素的大小。
     * @method getTileSize
     * @return {Size}
     * @example
     * var tileSize = tiledMap.getTileSize();
     * cc.log("Tile Size: " + tileSize);
     */
    getTileSize:function () {
        return this._sgNode.getTileSize();
    },

    /**
     * !#en Set the tile size.
     * !#zh 设置地图背景中 tile 元素的大小。
     * @method setTileSize
     * @param {Size} tileSize
     * @example
     * tiledMap.setTileSize(new cc.size(10, 10));
     */
    setTileSize:function (tileSize) {
        this._sgNode.setTileSize(tileSize);
    },

    /**
     * !#en map orientation.
     * !#zh 获取地图方向。
     * @method getMapOrientation
     * @return {Number}
     * @example
     * var mapOrientation = tiledMap.getMapOrientation();
     * cc.log("Map Orientation: " + mapOrientation);
     */
    getMapOrientation:function () {
        return this._sgNode.getMapOrientation();
    },

    /**
     * !#en map orientation.
     * !#zh 设置地图方向。
     * @method setMapOrientation
     * @param {TiledMap.Orientation} orientation
     * @example
     * tiledMap.setMapOrientation(TiledMap.Orientation.ORTHO);
     */
    setMapOrientation:function (orientation) {
        this._sgNode.setMapOrientation(orientation);
    },

    /**
     * !#en object groups.
     * !#zh 获取所有的对象层。
     * @method getObjectGroups
     * @return {Object[]}
     * @example
     * var objGroups = titledMap.getObjectGroups();
     * for (var i = 0; i < objGroups.length; ++i) {
     *     cc.log("obj: " + objGroups[i]);
     * }
     */
    getObjectGroups:function () {
        return this._sgNode.getObjectGroups();
    },

    /**
     * !#en object groups.
     * !#zh 设置所有的对象层。
     * @method setObjectGroups
     * @param {Object[]} groups
     * @example
     * titledMap.setObjectGroups(groups);
     */
    setObjectGroups:function (groups) {
        this._sgNode.setObjectGroups(groups);
    },

    /**
     * !#en Gets the map properties.
     * !#zh 获取地图的属性。
     * @method getProperties
     * @return {Object[]}
     * @example
     * var properties = titledMap.getProperties();
     * for (var i = 0; i < properties.length; ++i) {
     *     cc.log("Properties: " + properties[i]);
     * }
     */
    getProperties:function () {
        return this._sgNode.getProperties();
    },

    /**
     * !#en Set the map properties.
     * !#zh 设置地图的属性。
     * @method setProperties
     * @param {Object[]} properties
     * @example
     * titledMap.setProperties(properties);
     */
    setProperties:function (properties) {
        this._sgNode.setProperties(properties);
    },

    /*
     * Initializes the instance of cc.TiledMap with tmxFile.
     * The mapLoaded events will be emitted when the map is loaded.
     * @method initWithTMXFile
     * @param {String} tmxFile
     */
    initWithTMXFile:function (tmxFile) {
        this._tmxFile = tmxFile;
    },

    /*
     * Initializes the instance of cc.TiledMap with tmxString.
     * The mapLoaded events will be emitted when the map is loaded.
     * @method initWithXML
     * @param {String} tmxString
     * @param {String} resourcePath
     */
    initWithXML:function(tmxString, resourcePath){
        // clear the tmx file
        this._tmxFile = null;

        // preload textures & init the _tileMap
        var self = this;
        var sgNode = self._sgNode;
        var mapInfo = new cc.TMXMapInfo(tmxString, resourcePath);
        if (!mapInfo) {
            self._onMapLoaded(new Error('Parse map info failed.'));
            return;
        }

        self._isLoading = true;
        if (cc.sys.isNative) {
            // TODO Consider to remove the setTimeout
            // In native environment, the reason of using setTimeout:
            // If not use setTimeout, the _sgNode of cc.TiledLayer
            // will be removed from the scene graph.
            setTimeout(function() {
                sgNode.initWithXML(tmxString, resourcePath);
                self._onMapLoaded();
            }, 0);
        } else {
            this._preloadTextures(mapInfo, function (err, results) {
                if (!err) {
                    sgNode.initWithXML(tmxString, resourcePath);
                }
                self._onMapLoaded(err);
            });
        }
    },

    /**
     * !#en Return All layers array.
     * !#zh 返回包含所有 layer 的数组。
     * @method allLayers
     * @returns {Node[]}
     * @example
     * var layers = titledMap.allLayers();
     * for (var i = 0; i < layers.length; ++i) {
     *     cc.log("Layers: " + layers[i]);
     * }
     */
    allLayers: function () {
        var logicChildren = this.node.children;
        var ret = [];
        for (var i = 0, n = logicChildren.length; i < n; i++) {
            var child = logicChildren[i];
            var tmxLayer = child.getComponent(cc.TiledLayer);
            if (tmxLayer) {
                ret.push(tmxLayer);
            }
        }

        return ret;
    },

    /**
     * !#en return the cc.TiledLayer for the specific layer.
     * !#zh 获取指定名称的 layer。
     * @method getLayer
     * @param {String} layerName
     * @return {TiledLayer}
     * @example
     * var layer = titledMap.getLayer("Player");
     * cc.log(layer);
     */
    getLayer:function (layerName) {
        var logicChildren = this.node.children;
        for (var i = 0, n = logicChildren.length; i < n; i++) {
            var child = logicChildren[i];
            var tmxLayer = child.getComponent(cc.TiledLayer);
            if (tmxLayer && tmxLayer.getLayerName() === layerName) {
                return tmxLayer;
            }
        }

        return null;
    },

    /**
     * !#en Return the TMXObjectGroup for the specific group.
     * !#zh 获取指定的 TMXObjectGroup。
     * @method getObjectGroup
     * @param {String} groupName
     * @return {TMXObjectGroup}
     * @example
     * var group = titledMap.getObjectGroup("Players");
     * cc.log("ObjectGroup: " + group);
     */
    getObjectGroup:function (groupName) {
        return this._sgNode.getObjectGroup(groupName);
    },

    /**
     * !#en Return the value for the specific property name.
     * !#zh 通过属性名称，获取指定的属性。
     * @method getProperty
     * @param {String} propertyName
     * @return {String}
     * @example
     * var property = titledMap.getProperty("info");
     * cc.log("Property: " + property);
     */
    getProperty:function (propertyName) {
        return this._sgNode.getProperty(propertyName);
    },

    /**
     * !#en Return properties dictionary for tile GID.
     * !#zh 通过 GID ，获取指定的属性。
     * @method getPropertiesForGID
     * @param {Number} GID
     * @return {Object}
     * @example
     * var properties = titledMap.getPropertiesForGID(GID);
     * cc.log("Properties: " + properties);
     */
    getPropertiesForGID: function(GID) {
        return this._sgNode.getPropertiesForGID(GID);
    },

    onEnable: function () {
        this._super();

        if (this._tmxFile && ! this._isLoading) {
            // refresh layer entities
            this._refreshLayerEntities();
        }

        this.node.on('anchor-changed', this._anchorChanged, this);
        this.node.on('child-added', this._childAdded, this);
        this.node.on('child-reorder', this._reorderChildren, this);
    },

    onDisable: function () {
        this._super();

        // disable the TiledLayer component in logic children
        var logicChildren = this.node.getChildren();
        for (var i = logicChildren.length - 1; i >= 0; i--) {
            var child = logicChildren[i];
            var tmxLayer = child.getComponent(cc.TiledLayer);
            if (tmxLayer) {
                tmxLayer.enabled = false;
            }
        }

        // remove the sg children for tmx layers (which not maintained by TiledLayer)
        var restoredSgNode = this._plainNode;
        this._moveLayersInSgNode(restoredSgNode);

        this.node.off('anchor-changed', this._anchorChanged, this);
        this.node.off('child-added', this._childAdded, this);
        this.node.off('child-reorder', this._reorderChildren, this);
    },

    onDestroy: function() {
        this._super();

        // remove the TiledLayer entities
        this._removeLayerEntities();
    },

    _createSgNode: function () {
        return new _ccsg.TMXTiledMap();
    },

    _initSgNode: function () {
        this._applyFile();
    },

    _preloadTextures: function(mapInfo, cb) {
        var sets = mapInfo.getTilesets();
        if (sets) {
            var textures = sets.map(function (set) {
                return set.sourceImage;
            });

            cc.loader.load(textures, function (err) {
                cb(err, textures);
            });
        }
        else {
            if (cb) cb();
        }
    },

    _preloadTmx: function(file, cb) {
        var self = this;
        cc.loader.load(file, function (err) {
            if (err) {
                if (cb) cb(err || new Error('Preload TMX failed: unknown error'));
                return;
            }

            var mapInfo = new cc.TMXMapInfo(file);
            if (!mapInfo) {
                cb(new Error('Parse map info failed.'));
                return;
            }

            self._preloadTextures(mapInfo, cb);
        });
    },

    _onMapLoaded: function(err) {
        this._isLoading = false;
        if ( !err ) {
            if (this._enabled) {
                this._refreshLayerEntities();
                this._anchorChanged();
            } else {
                this._moveLayersInSgNode(this._sgNode);
            }
        }

        if (!CC_EDITOR) {
            // if it's not in Editor, emit mapLoaded events.
            cc.Component.EventHandler.emitEvents(this.mapLoaded, err);
        }
    },

    _moveLayersInSgNode: function(sgNode) {
        // clear the detached layers info first
        this._detachedLayers.length = 0;

        var children = sgNode.getChildren();
        for (var i = children.length - 1; i >= 0; i--) {
            var child = children[i];
            if (child instanceof _ccsg.TMXLayer) {
                sgNode.removeChild(child);
                var order = child.getLocalZOrder();
                this._detachedLayers.push({ sgNode: child, zorder: order });
            }
        }
    },

    _removeLayerEntities: function() {
        var logicChildren = this.node.getChildren();
        for (var i = logicChildren.length - 1; i >= 0; i--) {
            var child = logicChildren[i];
            if (!child.isValid) {
                continue;
            }

            var tmxLayer = child.getComponent(cc.TiledLayer);
            if (tmxLayer) {
                child.removeComponent(cc.TiledLayer);

                if (CC_EDITOR) {
                    // In editor if the node is empty, remove it
                    // because the removeComponent can not remove the component immediately.
                    // So if the component count is 1 means the node doesn't have any other component.
                    if (child._components.length === 1 &&
                        child.getChildren().length === 0) {
                        this.node.removeChild(child);
                    }
                }
            }
        }
    },

    _refreshLayerEntities: function() {
        var logicChildren = this.node.getChildren();
        var needRemove = [];
        var existedLayers = [];
        var otherChildrenInfo = [];
        var i, n;
        
        // restore detached layers
        for (i = 0; i < this._detachedLayers.length; i++) {
            var info = this._detachedLayers[i];
            this._sgNode.addChild(info.sgNode, info.zorder, info.zorder);
        }
        this._detachedLayers.length = 0;
        
        // get the layer names in scene graph.
        var layerNames = this._sgNode.allLayers().map(function (layer) {
            return layer.getLayerName();
        });

        // check the children of this.node
        for (i = 0, n = logicChildren.length; i < n; i++) {
            var child = logicChildren[i];
            var tmxLayer = child.getComponent(cc.TiledLayer);
            if (tmxLayer) {
                var layerName = tmxLayer.getLayerName();
                if (!layerName) {
                    layerName = child._name;
                }

                if (layerNames.indexOf(layerName) < 0) {
                    if (child._components.length === 1) {
                        // only has TiledLayer component
                        // the tmx layer should be removed
                        needRemove.push(child);
                    }
                } else {
                    // the tmx layer should be updated
                    existedLayers.push(child);
                    var newSGLayer = this._sgNode.getLayer(layerName);
                    tmxLayer._replaceSgNode(newSGLayer);
                    tmxLayer.enabled = true;
                }
            } else {
                otherChildrenInfo.push({child: child, index: child.getSiblingIndex()});
            }
        }

        // remove the deprecated tmx layers
        for (i = 0, n = needRemove.length; i < n; i++) {
            this.node.removeChild(needRemove[i]);
        }

        // add new tmx layers & update the sibling index with ZOrder
        var existedNames = existedLayers.map(function(node) {
            var tmxLayer = node.getComponent(cc.TiledLayer);
            return tmxLayer.getLayerName();
        });

        for (i = 0, n = layerNames.length; i < n; i++) {
            var name = layerNames[i];
            var sgLayer = this._sgNode.getLayer(name);
            var theIndex = existedNames.indexOf(name);
            if (theIndex < 0) {
                // check if there is a node with the same name of tmx layer
                var node = this.node.getChildByName(name);
                var addedLayer = null;
                if (node && ! node.getComponent(cc._SGComponent)) {
                    // has a node with the same name of tmx layer
                    // add TiledLayer component
                    addedLayer = node.addComponent(cc.TiledLayer);
                } else {
                    // create a new node to add TiledLayer component
                    node = new cc.Node(name);
                    this.node.addChild(node);
                    addedLayer = node.addComponent(cc.TiledLayer);
                }

                if (!node || !addedLayer) {
                    cc.error('Add component TiledLayer into node failed.');
                }

                addedLayer._replaceSgNode(sgLayer);
                node.setSiblingIndex(sgLayer.getLocalZOrder());
                node.setAnchorPoint(this.node.getAnchorPoint());
            } else {
                existedLayers[theIndex].setSiblingIndex(sgLayer.getLocalZOrder());
            }
        }

        // update the sibling index of the other children
        for (i = 0, n = otherChildrenInfo.length; i < n; i++) {
            var info = otherChildrenInfo[i];
            info.child.setSiblingIndex(info.index);
        }

        // reorder the children
        this._reorderChildren();
    },

    _anchorChanged: function() {
        // align children with current node 
        var children = this.node.children;
        var anchor = this.node.getAnchorPoint();
        for (var i = 0, n = children.length; i < n; i++) {
            var child = children[i];
            var hasLayer = child.getComponent(cc.TiledLayer);
            if (hasLayer) {
                child.setAnchorPoint(anchor);
            }
        }
    },
    
    _childAdded: function(event) {
        var node = event.detail;
        if (node) {
            var tmxLayer = node.getComponent(cc.TiledLayer);
            if (!tmxLayer) {
                var childrenCount = this.node.getChildrenCount();
                node.setSiblingIndex(childrenCount);
                if (node._sgNode) {
                    node._sgNode.setLocalZOrder(childrenCount);
                }
            }
        }
    },

    _reorderChildren: function() {
        var logicChildren = this.node.children;
        for (var i = 0, n = logicChildren.length; i < n; i++) {
            var child = logicChildren[i];
            var tmxLayer = child.getComponent(cc.TiledLayer);
            var zOrderValue = child.getSiblingIndex();
            if (tmxLayer) {
                if (tmxLayer._sgNode) {
                    tmxLayer._sgNode.setLocalZOrder(zOrderValue);
                }
            } else {
                if (child._sgNode) {
                    child._sgNode.setLocalZOrder(zOrderValue);
                }
            }
        }
    },

    _applyFile: function () {
        var sgNode = this._sgNode;
        var file = this._tmxFile;
        var self = this;
        if (file) {
            self._isLoading = true;
            if (cc.sys.isNative) {
                // TODO Consider to remove the setTimeout
                // In native environment, the reason of using setTimeout:
                // If not use setTimeout, the _sgNode of cc.TiledLayer
                // will be removed from the scene graph.
                setTimeout(function() {
                    if (sgNode.initWithTMXFile(file)) {
                        self._onMapLoaded();
                    } else {
                        self._onMapLoaded(new Error('Parse map info failed.'));
                    }
                }, 0);
            } else {
                this._preloadTmx(file, function (err, results) {
                    if (!err) {
                        sgNode.initWithTMXFile(file);
                    }
                    self._onMapLoaded(err);
                });
            }
        } else {
            // tmx file is cleared
            // 1. hide the tmx layers in _sgNode
            var layers = sgNode.allLayers();
            for (var i = 0, n = layers.length; i < n; i++) {
                sgNode.removeChild(layers[i]);
            }

            // 2. if the component is enabled,
            //    should remove the entities for tmx layers in node
            if (self._enabled) {
                self._removeLayerEntities();
            }
        }
    },
});

cc.TiledMap = module.exports = TiledMap;
