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
 * !#en
 * The global main namespace of Spine, all classes, functions,
 * properties and constants of Spine are defined in this namespace
 * !#zh
 * Spine 的全局的命名空间，
 * 与 Spine 相关的所有的类，函数，属性，常量都在这个命名空间中定义。
 * @module sp
 * @main sp
 */

/*
 * Reference:
 * http://esotericsoftware.com/spine-runtime-terminology
 * http://esotericsoftware.com/files/runtime-diagram.png
 * http://en.esotericsoftware.com/spine-using-runtimes
 */

sp = CC_JSB ? sp : {};

// The vertex index of spine.
sp.VERTEX_INDEX = {
    X1: 0,
    Y1: 1,
    X2: 2,
    Y2: 3,
    X3: 4,
    Y3: 5,
    X4: 6,
    Y4: 7
};

// The attachment type of spine. It contains three type: REGION(0), BOUNDING_BOX(1), MESH(2) and SKINNED_MESH.
sp.ATTACHMENT_TYPE = {
    REGION: 0,
    BOUNDING_BOX: 1,
    MESH: 2,
    SKINNED_MESH:3
};

/**
 * !#en The event type of spine skeleton animation.
 * !#zh 骨骼动画事件类型。
 * @enum AnimationEventType
 */
sp.AnimationEventType = cc.Enum({
    /**
     * !#en The play spine skeleton animation start type.
     * !#zh 开始播放骨骼动画。
     * @property {Number} START
     */
    START: 0,
    /**
     * !#en The play spine skeleton animation finish type.
     * !#zh 播放骨骼动画结束。
     * @property {Number} END
     */
    END: 1,
    /**
     * !#en The play spine skeleton animation complete type.
     * !#zh 播放骨骼动画完成。
     * @property {Number} COMPLETE
     */
    COMPLETE: 2,
    /**
     * !#en The spine skeleton animation event type.
     * !#zh 骨骼动画事件。
     * @property {Number} EVENT
     */
    EVENT: 3
});

/**
 * @module sp
 */

if (!CC_EDITOR || !Editor.isCoreLevel) {
    
    if (!CC_JSB) {
        /**
         * !#en
         * The official spine runtime.<br/>
         * See http://en.esotericsoftware.com/spine-using-runtimes
         * !#zh
         * 官方 Spine Runtime。<br/>
         * 可查看 Spine 官方文档 http://en.esotericsoftware.com/spine-using-runtimes
         * @property {object} spine
         */
        sp.spine = require('./lib/spine');
    
        require('./SGSkeleton');
        require('./SGSkeletonCanvasRenderCmd');
        require('./SGSkeletonWebGLRenderCmd');
        require('./SGSkeletonAnimation');
    }
    
    require('./SkeletonData');
    require('./Skeleton');
}
else {
    require('./SkeletonData');
}
