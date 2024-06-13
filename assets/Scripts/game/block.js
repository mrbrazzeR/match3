import utils  from "../utils"
import gameData from "../gameData"
import psconfig from "../psconfig"
cc.Class({
    extends: cc.Component,

    properties: {
        outLine: cc.Node,
        temp: cc.Node,
        view: cc.Node,
        _xPos: 0,
        _yPos: 0,
        _stoneNum: 0,
        _stoneType: 0,
        rocketType: 0,
        discoType: 0,
        lock_func: cc.Node,
        bombRatio: -1,
        nextType: -1,
        viewList: [cc.SpriteFrame],
        rocketList: [cc.SpriteFrame],
        discoList: [cc.SpriteFrame],
        hinderView: [cc.SpriteFrame],
        tipsView_2: [cc.SpriteFrame],
        tipsView_4: [cc.SpriteFrame],
        tipsView_8: [cc.SpriteFrame],
        tipsView_16: [cc.SpriteFrame],
        tipsView_32: [cc.SpriteFrame],
        tipsView_64: [cc.SpriteFrame],
        tipsView_128: [cc.SpriteFrame],
        tipsView_256: [cc.SpriteFrame],
        combineView: [cc.SpriteFrame],
        colorCubeViewList: [cc.SpriteFrame],
        boxCubesHitView: [cc.SpriteFrame],
        windmillNetView: [cc.SpriteFrame],
        ladyBugBubbleView: [cc.SpriteFrame],
        flower: cc.Node,
        plant: cc.Node,
        windmillOutlineLight: cc.Node,
        ladyBug: cc.Prefab,
        vine: cc.SpriteFrame,
        toolAnima: cc.Node
    },

    onLoad: function() {},
    initStoneView: function(e, t, i, s) {
        this.changeStoneGrid(e, t),
        this.changeStoneNum(i, s)
    },
    updateTipsView: function(e) {
        var t;
        0 == this._stoneType && (t = this.tipsView_2[e]),
        1 == this._stoneType && (t = this.tipsView_4[e]),
        2 == this._stoneType && (t = this.tipsView_8[e]),
        3 == this._stoneType && (t = this.tipsView_16[e]),
        4 == this._stoneType && (t = this.tipsView_32[e]),
        5 == this._stoneType && (t = this.tipsView_64[e]),
        6 == this._stoneType && (t = this.tipsView_128[e]),
        7 == this._stoneType && (t = this.tipsView_256[e]),
        this.view.getComponent(cc.Sprite).spriteFrame = t
    },
    originView: function() {
        this.view.getComponent(cc.Sprite).spriteFrame = this.viewList[this._stoneType]
    },
    changeStoneNum: function(e, t) {
        // Set the stone type
        this._stoneType = e;
        if (e >= 0) {
            this._stoneNum = Math.pow(2, this._stoneType + 1);

            // Check for specific stone types and apply corresponding logic
            if (e == psconfig.rType) {
                // Rocket type
                this.rocketType = this.randomCreateRocketType();
                this.view.getComponent(cc.Sprite).spriteFrame = this.rocketList[this.rocketType];
            } else if (e == psconfig.dType) {
                // Disco type
                this.discoType = t <= 5 ? t : this.randomCreateDiscoType();
                this.view.getComponent(cc.Sprite).spriteFrame = this.discoList[this.discoType];
            } else if (e == psconfig.bType) {
                // Some other type (possibly a bomb)
                this.view.active = false;
                this.playToolAnima(2);
            } else if (e >= 20) {
                // Various special types
                if (e == 22) {
                    // Vine type
                    this.lock_func.active = true;
                    this.lock_func.getComponent(cc.Sprite).spriteFrame = this.vine;
                    this.nextType = this.randomCreateDiscoType();
                    this.bombRatio = 1;
                    this.view.getComponent(cc.Sprite).spriteFrame = this.viewList[this.nextType];
                } else if (e >= 23 && e <= 25) {
                    // Box cubes types
                    if (e == 23) this.initBoxCubesData(3);
                    if (e == 24) this.initBoxCubesData(2);
                    if (e == 25) this.initBoxCubesData(1);
                } else if (e == 26) {
                    // Flower cubes type
                    this.initFlowerCubesData();
                } else if (e == 27) {
                    // Windmill type
                    this.initWindmill(3);
                } else if (e >= 29 && e <= 36) {
                    // Colorful cubes types
                    this.initColorfulCubes(1, e - 29);
                } else if (e == 37) {
                    // Ladybug cubes type
                    this.initLadyBugCubes(3);
                } else if (e == 39) {
                    // Rock stone type
                    this.initRockStone(1);
                } else {
                    // Hinder view for other special types
                    this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[e - 20];
                }
            } else {
                // Default case for other types
                this.view.getComponent(cc.Sprite).spriteFrame = this.viewList[e];
           
            }
        } else {
            // If the stone type is invalid, set the sprite frame to null
            this.view.getComponent(cc.Sprite).spriteFrame = null;
        }
    },
    cubesUnlock: function() {
        this.bombRatio <= 0 && (this.bombRatio = -1,
        this.lock_func.active = !1,
        gameData.starMatrix[this._xPos][this._yPos] = this.nextType,
        this.changeStoneNum(this.nextType),
        this.nextType = -1)
    },
    boxCubesDisappear: function() {
        this.bombRatio = -1,
        gameData.starMatrix[this._xPos][this._yPos] = -1,
        this.node.removeFromParent()
    },
    blockDataReset: function() {
        this.bombRatio = -1,
        gameData.starMatrix[this._xPos][this._yPos] = -1
    },
    boxHit: function() {
        this.bombRatio > 0 ? this.lock_func.getComponent(cc.Sprite).spriteFrame = this.boxCubesHitView[this.bombRatio - 2] : 0 == this.bombRatio && (this.lock_func.active = !1),
        this.cubeRotation(this.node, 1003)
    },
    initBoxCubesData: function(e) {
        this.bombRatio = e,
        this.lock_func.active = !0,
        e - 2 < 0 ? this.lock_func.active = !1 : this.lock_func.getComponent(cc.Sprite).spriteFrame = this.boxCubesHitView[this.bombRatio - 2],
        this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[3]
    },
    initFlowerCubesData: function() {
        this.view.active = !1,
        this.flower.active = !0,
        this.lock_func.active = !1,
        this.plant.getChildByName("petal").active = !1,
        this.bombRatio = 4
    },
    flowerHit: function() {
        var e = this
            , t = this.plant.getChildByName("petal");
        t.active = !0,
        t.stopActionByTag(1002);
        var i = "item" + (4 - this.bombRatio)
            , s = t.getChildByName(i);
        this.node.zIndex = 1;
        var n = cc.sequence(cc.sequence(cc.scaleTo(.2, .8), cc.scaleTo(.2, 1.2)).repeat(2), cc.scaleTo(.15, 1.5).easing(cc.easeBackOut(3)), cc.rotateBy(.3, 90), cc.spawn(cc.scaleTo(.25, 1).easing(cc.easeBackOut(3)), cc.callFunc(function() {
            s.active = !0,
            e.node.zIndex = 0
        })));
        n.tag = 1002,
        this.plant.runAction(n)
    },
    collectFlower: function() {
        this.bombRatio = -1,
        gameData.starMatrix[this._xPos][this._yPos] = -1,
        this.node.removeFromParent()
    },
    initWindmill: function(e) {
        this.bombRatio = e,
        this.lock_func.active = !0,
        e - 2 < 0 ? this.lock_func.active = !1 : this.lock_func.getComponent(cc.Sprite).spriteFrame = this.windmillNetView[this.bombRatio - 2],
        this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[4]
    },
    hitWindmill: function() {
        this.bombRatio > 0 ? (this.lock_func.getComponent(cc.Sprite).spriteFrame = this.windmillNetView[this.bombRatio - 2],
        1 == this.bombRatio ? (this.windmillOutlineLight.active = !0,
        this.node.zIndex = 1,
        this.node.runAction(cc.rotateBy(5, 360).repeatForever()),
        59 == gameData.bestLevel && (
            gameData.guide_step.eleven_step || cc.systemEvent.emit("WINDMILL_SECOND_GUIDE", {
            windmillList: [cc.v2(this._xPos, this._yPos)]
        }))) : this.windmillRotation(this.view, 1002)) : 0 == this.bombRatio && (this.lock_func.active = !1)
    },
    windmillRotation: function(e, t) {
        e.stopActionByTag(t);
        var i = cc.rotateBy(1, 360);
        i.tag = t,
        e.runAction(i)
    },
    initColorfulCubes: function(e, t) {
        this.bombRatio = e,
        this.nextType = t,
        this.lock_func.active = !1,
        "number" == typeof this.nextType && (this.view.getComponent(cc.Sprite).spriteFrame = this.colorCubeViewList[this.nextType])
    },
    initLadyBugCubes: function(e) {
        this.bombRatio = e,
        this.lock_func.active = !1,
        this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[5],
        this.temp.active = !0;
        var t = cc.instantiate(this.ladyBug);
        t.parent = this.temp,
        t.getComponent(cc.Animation).play("ladyBugChaos")
    },
    initRockStone: function(e) {
        this.bombRatio = e,
        this.lock_func.active = !1,
        this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[6]
    },
    hitLadyBugCubes: function() {
        cc.director.SoundManager.playSound("glassBallBreak"),
        this.view.getComponent(cc.Sprite).spriteFrame = this.ladyBugBubbleView[this.bombRatio - 1],
        this.cubeRotation(this.node, 1003)
    },
    randomCreateRocketType: function() {
        return Math.floor(100 * Math.random()) % 2
    },
    randomCreateDiscoType: function() {
        var e = [0, 1, 2, 3, 4];
        return e[Math.floor(Math.random() * e.length)]
    },
    randomGetItemType: function(e) {
        return !!(e && e.length > 0) && e[Math.floor(Math.random() * e.length)]
    },
    changeStoneGrid: function(e, t) {
        this._xPos = e,
        this._yPos = t
    },
    nodeRotation: function(e, t) {
        var i = this
            , s = cc.sequence(cc.sequence(cc.rotateBy(.05, 20), cc.rotateBy(.05, -20)).repeat(2), cc.callFunc(function() {
            i.node.angle = -0
        }));
        s.tag = t,
        e.runAction(s)
    },
    cubeRotation: function(e, t) {
        var i = cc.sequence(cc.spawn(cc.sequence(cc.rotateBy(.05, 20), cc.rotateBy(.05, -20)).repeat(2), cc.scaleTo(.2, 1.2)), cc.scaleTo(.2, 1), cc.callFunc(function() {
            e.angle = -0
        }));
        i.tag = t,
        e.runAction(i)
    },
    onTouchStart: function() {
        if (!(cc.director.isMoving || cc.director.container.target.stepCount <= 0 || cc.director.isrunning))
            if (-2 != this._stoneType && -1 != this._stoneType && cc.director.SoundManager.playSound("tap"),
            this._stoneType < psconfig.rType) {
                cc.director.isMoving = !0;
                var e = cc.v2(this._xPos, this._yPos)
                    , t = utils.needRemoveList(gameData.starMatrix, e);
                if (cc.director.toolType > 0) {
                    if (-2 == this._stoneType)
                        return void (cc.director.isMoving = !1);
                    var a = cc.director.toolType
                        , o = cc.v2(this._xPos, this._yPos)
                        , c = this.node.parent.convertToWorldSpaceAR(utils.grid2Pos(o.x, o.y));
                    cc.systemEvent.emit("TOOL_TRANS_EFFECT", {
                        type: a,
                        grid: o,
                        wp: c
                    })
                } else
                    t.length > 1 ? cc.systemEvent.emit("REMOVE_CUBES", {
                        detail: t
                    }) : (this.nodeRotation(this.node, 2),
                    cc.director.isMoving = !1,
                    utils.getItemAdjacentPos(e),
                    -2 != this._stoneType && -1 != this._stoneType && cc.director.SoundManager.playSound("noCombine"))
            } else {
                if (cc.director.toolType > 0) {
                    if (cc.director.toolType <= 3) {
                        if (this._stoneType >= 8 && this._stoneType <= 10 || 3 == cc.director.toolType && 20 == this._stoneType)
                            return;
                        var r = cc.director.toolType
                            , d = cc.v2(this._xPos, this._yPos)
                            , l = this.node.parent.convertToWorldSpaceAR(utils.grid2Pos(d.x, d.y));
                        cc.systemEvent.emit("TOOL_TRANS_EFFECT", {
                            type: r,
                            grid: d,
                            wp: l
                        })
                    }
                    return
                }
                if (this._stoneType >= 20)
                    this.nodeRotation(this.node, 3),
                    cc.director.isMoving = !1,
                    cc.director.SoundManager.playSound("noCombine");
                else {
                    var h;
                    cc.systemEvent.emit("STEP_COUNT"),
                    this._stoneType == psconfig.rType ? h = this.rocketType : this._stoneType == psconfig.dType && (h = this.discoType);
                    var p = {
                        index: this._stoneType,
                        type: h,
                        grid: cc.v2(this._xPos, this._yPos)
                    };
                    cc.systemEvent.emit("GAME_TOOL", {
                        detail: p
                    })
                }
            }
    },
    unuse: function() {
        if (this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchStart, this),
        this.node.stopAllActions(),
        this.node.angle = -0,
        this.node.zIndex = 0,
        this._stoneType = -1,
        this.outLine.active = !1,
        this.lock_func.active = !1,
        this.windmillOutlineLight.active = !1,
        this.toolAnima.active = !1,
        this.view.angle = -0,
        this.flower.active) {
            for (var e = this.plant.getChildByName("petal").children, t = 0; t < e.length; t++)
                e[t].active = !1;
            this.flower.active = !1
        }
        this.temp.active && (this.temp.active = !1,
        this.temp.removeAllChildren(),
        this.view.active = !1,
        this.view.stopAllActions(),
        this.view.angle = -0)
    },
    reuse: function() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchStart, this),
        this.node.scale = .2,
        this.node.stopActionByTag(1),
        this.node.angle = -0,
        this.view.active = !0,
        this.node.runAction(cc.spawn(cc.scaleTo(.3, 1), cc.fadeIn(.1)))
    },
    blockChoosed: function() {
        var e = cc.sequence(cc.rotateBy(.05, 10), cc.rotateBy(.05, -10)).repeatForever();
        e.tag = 1,
        this.node.runAction(e)
    },
    createGameTool: function() {},
    toolCanCombineEffect: function(e) {
        this.temp.active = !0,
        e.parent = this.temp
    },
    discoEffect: function(e, t) {
        this.node.zIndex = 1,
        this.temp.active = !0,
        e.active = !0,
        e.parent = this.temp;
        var i = cc.rotateBy(1, 720).repeatForever();
        i.tag = 1,
        t && (this.view.getComponent(cc.Sprite).spriteFrame = this.combineView[t - 1]),
        this.view.runAction(i)
    },
    playToolAnima: function(e) {
        this.toolAnima.active = !0;
        var t, i = this.toolAnima.getComponent(cc.Animation);
        1 == e || (2 == e ? t = "tool_bomb" : 3 == e && (t = "tool_disco")),
        t && i.play(t)
    },
    test: function() {
        
    },
            
});
