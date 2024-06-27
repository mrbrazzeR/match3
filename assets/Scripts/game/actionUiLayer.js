import gameData from "../gameData"
import psconfig from "../psconfig"
cc.Class({
    extends: cc.Component,

    properties: {
        target: require("./target"),
        listTool: require("./toolList"),
        pinePrefab: cc.Prefab,
        hammerPrefab: cc.Prefab,
        boxing: cc.Prefab,
        fork: cc.Prefab,
        toolList: [cc.Node],
        stepTips: cc.Node,
        header: cc.Node,
        tool: cc.Node,
        toolView: [cc.SpriteFrame],
        fire: cc.Prefab,
        item_target: cc.Prefab,
        subList: [cc.SpriteFrame],
        targetList: [cc.SpriteFrame],
        evaluation: cc.Prefab,
        evaluationList: [cc.SpriteFrame],
        shuffleTips: cc.Node,
        toolItem: cc.Prefab,
        coinsNumber: cc.Node,
        flower_example: cc.Node,
        grassBreak: cc.Prefab,
        bubbleBreak: cc.Prefab,
        paddyEffect: cc.Prefab,
    },

    onLoad: function() {
        this.paddyPool = new cc.NodePool;
        for (var e = 0; e < 5; e++) {
            var t = cc.instantiate(this.paddyEffect);
            this.paddyPool.put(t)
        }
        this.pinePool = new cc.NodePool;
        for (var e = 0; e < 5; e++) {
            var t = cc.instantiate(this.pinePrefab);
            this.pinePool.put(t)
        }
        this.evaluatePool = new cc.NodePool;
        for (var i = 0; i < 5; i++) {
            var s = cc.instantiate(this.evaluation);
            this.evaluatePool.put(s)
        }
        this.grassPool = new cc.NodePool;
        for (var n = 0; n < 10; n++) {
            var a = cc.instantiate(this.grassBreak);
            this.grassPool.put(a)
        }
        this.bubblePool = new cc.NodePool,
        cc.systemEvent.on("PINECONE", this.PineConeCollectEffect, this)
        cc.systemEvent.on("TOOL_TRANS_EFFECT", this.toolTransiteAnimation, this)
        cc.systemEvent.on("FIVE_STEP_TIPS", this.fiveStepTips, this)
        cc.systemEvent.on("PLAYER_TOOL_ANIMATION", this.playerToolUnlockAnima, this)
        cc.systemEvent.on("MOVE_ADD", this.movesAdd, this)
        cc.systemEvent.on("NOTICE_TARGET", this.noticeGameTarget, this)
        cc.systemEvent.on("AFTER_BUY_PLAYERTOOL", this.animationAfterPlayerBuyPlayerTool, this)
        cc.systemEvent.on("OPERATION_EVALUATE", this.EvaluatePlayerOperation, this)
        cc.systemEvent.on("SHUFFLE_TIPS", this.shuffleEffectTips, this)
        cc.systemEvent.on("GAMEVIEW_COINS_OBTAIN", this.addCoins, this)
        cc.systemEvent.on("HINDER_SQUIRREL_ANIMATION", this.hinderSquirrelAnimation, this)
        cc.systemEvent.on("HINDER_FLOWER_ANIMATION", this.hinderFlowerAnimaiton, this)
        cc.systemEvent.on("HIT_GRASS_ANIMATION", this.hitGroundGrassAnimation, this)
        cc.systemEvent.on("HIT_BUBBLE_ANIMATION", this.hitCubesBubbleAnimation, this)
        cc.systemEvent.on("REDUCE_COINS_ANIMATION", this.coinsReduceAnimation, this)
        cc.systemEvent.on("PADDY_ANIMATION", this.paddyAnimation, this)
    },
    start: function() {
        this.stepTips.opacity = 0
    },
    PineConeCollectEffect: function(e) {
        var t, i = this, s = e.worldPosition;
        t = this.pinePool.size() > 0 ? this.pinePool.get() : cc.instantiate(this.pinePrefab);
        var n = this.node.convertToNodeSpaceAR(s);
        t.parent = this.node,
        t.position = n;
        var a = this.target.getTargetIconWolrdPosition(20);
        if (a) {
            var o = this.node.convertToNodeSpaceAR(a)
              , c = cc.sequence(cc.spawn(cc.moveBy(.5, cc.v2(0, -50)), cc.scaleTo(.5, 1.1)), cc.spawn(cc.moveTo(1, o), cc.scaleTo(1, .8)), cc.callFunc(function() {
                i.pinePool.put(t),
                cc.systemEvent.emit("NUMBER_COUNT", {
                    type: 20
                }),
                e.isLast ? i.scheduleOnce(function() {
                    cc.director.checkLastPine++,
                    cc.systemEvent.emit("NUMBER_COUNT", {
                        type: 100
                    }),
                    i.target.isPass || cc.systemEvent.emit("GAMEMASK_CONTROL", {
                        order: 2
                    })
                }, 1) : cc.systemEvent.emit("NUMBER_COUNT", {
                    type: 100
                })
                cc.director.SoundManager.playSound("mission")
            }));
            cc.director.SoundManager.playSound("fruitDrop"),
            t.runAction(c)
        }
    },
    toolTransiteAnimation: function(e) {
        var t, i = e.type, n = e.grid, a = this.toolList[e.type - 1], o = a.parent.convertToWorldSpaceAR(a.position), c = this.node.convertToNodeSpaceAR(o);
        if (1 == i) {
            cc.director.SoundManager.playSound("glove");
            var r = cc.instantiate(this.boxing);
            cc.systemEvent.emit("BOXING_ANVIL", {
                grid: n,
                node: r,
                dir: psconfig.direction.RIGHT
            })
        }
        if (2 == i) {
            var d = cc.instantiate(this.fork);
            cc.systemEvent.emit("BOXING_ANVIL", {
                grid: n,
                node: d,
                dir: psconfig.direction.DOWN
            })
        }
        if (3 == i) {
            t = this.node.convertToNodeSpaceAR(e.wp);
            var l = cc.instantiate(this.hammerPrefab)
              , h = cc.sequence(cc.spawn(cc.moveTo(1, cc.v2(t.x + 80, t.y)), cc.scaleTo(.5, 1.5)), cc.rotateBy(.5, 50), cc.rotateBy(.5, -80), cc.delayTime(.1), cc.callFunc(function() {
                cc.systemEvent.emit("player_tool", {
                    type: i,
                    grid: n
                }),
                l.removeFromParent(),
                cc.systemEvent.emit("CLEAR_BTN"),
                cc.systemEvent.emit("FUNCTION_EXPLAIN_OFF")
            }));
            l.parent = this.node,
            l.position = c,
            l.runAction(h)
        }
        4 == i && (cc.systemEvent.emit("player_tool", {
            type: i,
            grid: n
        }),
        cc.systemEvent.emit("CLEAR_BTN"),
        cc.systemEvent.emit("FUNCTION_EXPLAIN_OFF"))
    },
    fiveStepTips: function() {
        this.stepTips.active = true
        this.stepTips.scale = .01
        cc.director.SoundManager.playSound("plateIn");
        var e = cc.sequence(cc.spawn(cc.fadeIn(.5), cc.scaleTo(.5, 1)), cc.sequence(cc.rotateBy(.05, 15), cc.rotateBy(.05, -15), cc.rotateTo(.05, 0)).repeat(3), cc.delayTime(1), cc.spawn(cc.fadeOut(.5), cc.scaleTo(.5, .01)), cc.callFunc(function() {
            cc.director.SoundManager.playSound("plateOut")
        }));
        this.stepTips.runAction(e)
    },
    playerToolUnlockAnima: function(e) {
        var t = this
          , i = e.pos
          , s = this.node.convertToNodeSpaceAR(i);
        this.tool.active = true,
        this.tool.position = cc.v2(0, 0);
        var n = this.tool.getChildByName("light")
          , a = this.tool.getChildByName("toolView");
        a.getComponent(cc.Sprite).spriteFrame = this.toolView[e.num - 1],
        a.scale = .1,
        cc.director.SoundManager.playSound("unlock"),
        n.runAction(cc.spawn(cc.rotateBy(2, 180), cc.sequence(cc.scaleTo(.5, 1), cc.delayTime(1), cc.fadeOut(.5)))),
        a.runAction(cc.sequence(cc.scaleTo(.5, 1), cc.delayTime(1), cc.scaleTo(.5, .4), cc.moveTo(.5, s), cc.callFunc(function() {
            t.tool.active = false,
            t.listTool.changeBtnStatus(e.num),
            cc.systemEvent.emit("PLAYER_TOOL_GUIDE", {
                num: e.num
            })
        })))
    },
    animationAfterPlayerBuyPlayerTool: function(e) {
        var t = this.toolList[e.num - 1]
          , i = t.parent.convertToWorldSpaceAR(t.position)
          , s = this.node.convertToNodeSpaceAR(i)
          , n = cc.instantiate(this.tool);
        n.active = true,
        n.parent = this.node,
        n.position = cc.v2(0, 0),
        n.getChildByName("light").active = false;
        var a = n.getChildByName("toolView");
        a.scale = .1,
        a.position = cc.v2(0, 0),
        cc.director.SoundManager.playSound("flyStart"),
        a.getComponent(cc.Sprite).spriteFrame = this.toolView[e.num - 1],
        a.runAction(cc.sequence(cc.scaleTo(.5, 1), cc.delayTime(.5), cc.scaleTo(.5, .4), cc.moveTo(.5, s), cc.callFunc(function() {
            n.removeFromParent(),
            cc.director.SoundManager.playSound("starCollect"),
            cc.systemEvent.emit("UPDATE_TOOL", {
                type: e.num,
                statu: 3
            })
        })))
    },
    movesAdd: function(e) {
        var t = this;
        this.scheduleOnce(function() {
            var i = e.pos
              , s = this.node.convertToNodeSpaceAR(i)
              , n = cc.instantiate(this.fire);
            n.parent = this.node,
            cc.director.SoundManager.playSound("flyTool"),
            n.runAction(cc.sequence(cc.moveTo(.6, s), cc.callFunc(function() {
                t.target.stepCount += 5,
                t.target.updateGameStep(t.target.stepCount),
                n.removeFromParent(),
                cc.director.SoundManager.playSound("add_move"),
                cc.systemEvent.emit("GAMEMASK_CONTROL", {
                    order: 2
                })
            })))
        }, .5)
    },
    noticeGameTarget: function(e) {
        var t = e.worldPos
        var i = this.node.convertToNodeSpaceAR(t)
        var s = e.type >= 20 ? e.type - 12 : e.type
        var n = e.index
        var a = cc.instantiate(this.item_target);
        a.getChildByName("sub").active = false
        if( 38 == e.type){
            a.getComponent(cc.Sprite).spriteFrame = this.targetList[18]
        }else if(39 == e.type){
            a.getComponent(cc.Sprite).spriteFrame = this.targetList[19]
        }else if(37 == e.type){
            a.getComponent(cc.Sprite).spriteFrame = this.targetList[20]
        }else if(40 == e.type){
            a.getComponent(cc.Sprite).spriteFrame = this.targetList[20]
        }else{
            a.getComponent(cc.Sprite).spriteFrame = this.targetList[s]
            if(e.type < 6){
                a.getChildByName("sub").active = true
                a.getChildByName("sub").getComponent(cc.Sprite).spriteFrame = this.subList[s]
            }
        }
        a.position = i
        a.parent = this.node;
        var o = this.target.nodeList[n]
          , c = o.parent.convertToWorldSpaceAR(o.position)
          , r = this.node.convertToNodeSpaceAR(c)
          , d = cc.callFunc(function() {
            a.removeFromParent(),
            cc.director.SoundManager.playSound("mission"),
            cc.director.isMoving = false,
            cc.director.needWait = 0,
            cc.director.isrunning = 0,
            o.runAction(cc.sequence(cc.scaleTo(.2, .9), cc.scaleTo(.2, 1.1), cc.scaleTo(.2, 1)))
        });
        cc.director.SoundManager.playSound("flyStart");
        var l = cc.sequence(cc.moveTo(1, r).easing(cc.easeInOut(3)), d);
        a.runAction(l)
    },
    EvaluatePlayerOperation: function(e) {
        var t = e.level;
        this.operationAnimation(t)
    },
    operationAnimation: function(e) {
        if (e) {
            var t;
            (t = this.evaluatePool.size() > 0 ? this.evaluatePool.get() : cc.instantiate(this.evaluation)).getComponent(cc.Sprite).spriteFrame = this.evaluationList[e - 1],
            this.playOperateEffect(e),
            t.scale = 0,
            t.parent = this.node;
            var i = cc.sequence(cc.spawn(cc.fadeIn(.5), cc.scaleTo(.5, 1).easing(cc.easeBackOut(3))), cc.delayTime(.5), cc.fadeOut(.5));
            t.runAction(i)
        }
    },
    playOperateEffect: function(e) {
        var t = "operate" + e;
        cc.director.SoundManager.playSound(t)
    },
    shuffleEffectTips: function() {
        cc.director.SoundManager.playSound("shuffle"),
        this.shuffleTips.active = true,
        this.shuffleTips.scale = .01;
        var e = cc.sequence(cc.spawn(cc.fadeIn(.1), cc.scaleTo(.2, 1).easing(cc.easeBackOut(3))), cc.sequence(cc.rotateBy(.05, 15), cc.rotateBy(.05, -15), cc.rotateTo(.05, 0)).repeat(3), cc.fadeOut(.5));
        this.shuffleTips.runAction(e)
    },
    addCoins: function(e) {
        for (var t = this, i = e % 10, s = (e - i) / 10, n = function(e) {
            setTimeout(function() {
                9 == e ? t.obtainCoinsEffect(s + i, true) : t.obtainCoinsEffect(s)
            }, 100 * e)
        }, a = 0; a < 10; a++)
            n(a)
    },
    obtainCoinsEffect: function(e, t) {
        var s = this
          , n = cc.instantiate(this.toolItem)
          , a = this.coinsNumber.position;
        if (!this.coinsNumber.active) {
            this.coinsNumber.active = true,
            this.coinsNumber.scale = .1;
            var o = gameData.starCount;
            this.updateCoinsPrompt(this.coinsNumber, o),
            this.coinsNumber.runAction(cc.spawn(cc.fadeIn(.5), cc.scaleTo(.5, 1).easing(cc.easeBackOut(3))))
        }
        n.getComponent("toolItem").changeItemTexture(0),
        n.parent = this.node;
        var c = Math.floor(200 * Math.random())
          , r = -500 + Math.floor(100 * Math.random())
          , d = .2 + .5 * Math.random();
        n.position = cc.v2(c, r);
        var l = cc.sequence(cc.sequence(cc.scaleTo(.1, .9), cc.scaleTo(.1, 1.1), cc.scaleTo(.1, 1)), cc.spawn(cc.rotateBy(d, 720), cc.moveTo(d, a).easing(cc.easeInOut(3)), cc.scaleTo(d, .5)), cc.callFunc(function() {
            cc.director.SoundManager.playSound("flyCoins")
        }), cc.callFunc(function() {
            n.removeFromParent(),
            gameData.starCount += e,
            s.updateCoinsPrompt(s.coinsNumber, gameData.starCount),
            gameData.storeGameData(),
            cc.log("=====storeGameData=====")
            t && s.coinsNumber.runAction(cc.sequence(cc.delayTime(.5), cc.fadeOut(.5), cc.callFunc(function() {
                s.coinsNumber.active = false
            })))
        }));
        n.runAction(l)
    },
    coinsReduceAnimation: function(e) {
        var t = this;
        if (!this.coinsNumber.active) {
            this.coinsNumber.active = true,
            this.coinsNumber.scale = .1;
            var s = gameData.starCount;
            this.updateCoinsPrompt(this.coinsNumber, s);
            var n = cc.sequence(cc.spawn(cc.scaleTo(.5, .9), cc.fadeIn(.5)), cc.spawn(cc.scaleTo(.5, 1.1), cc.callFunc(function() {
                t.updateCoinsPrompt(t.coinsNumber, gameData.starCount)
            })), cc.spawn(cc.scaleTo(.5, 1), cc.fadeOut(.5)), cc.callFunc(function() {
                t.coinsNumber.active = false
            }));
            this.coinsNumber.runAction(cc.sequence(cc.spawn(cc.fadeIn(.5), cc.scaleTo(.5, 1).easing(cc.easeBackOut(3))), cc.callFunc(function() {
                gameData.starCount -= e.cost,
                gameData.storeGameData(),
                cc.log("=====storeGameData====="),
                t.coinsNumber.runAction(n)
            })))
        }
    },
    updateCoinsPrompt: function(e, t) {
        e && (e.getChildByName("coins_number").getComponent(cc.Label).string = t + "")
    },
    hinderSquirrelAnimation: function(obj) {
        var t = this.target.getTargetIconWolrdPosition(28);
        if (t) {
            cc.director.SoundManager.playSound("statueShow")
            var statue = obj.statue
            var worldPos = obj.worldPos
            var pos = this.node.convertToNodeSpaceAR(worldPos);
            statue.parent = this.node     
            statue.position = pos;
            var posMove = this.node.convertToNodeSpaceAR(t)
            var action = cc.sequence(
                cc.spawn(cc.sequence(cc.scaleTo(.5, .8), cc.scaleTo(.5, 1)), cc.sequence(cc.rotateBy(.5, -10), cc.rotateBy(.5, 10))),
                cc.spawn(cc.rotateTo(1, 0), cc.moveTo(1, posMove).easing(cc.easeIn(3)), cc.scaleTo(1, .2),
                cc.callFunc(function() {
                    cc.director.SoundManager.playSound("statueMove")
                })), 
                cc.callFunc(function() {
                    statue.removeFromParent(true)
                    cc.systemEvent.emit("NUMBER_COUNT", {
                        type: 28
                    })
                    if(39 == gameData.bestLevel){
                        gameData.guide_step.thirteen_step || cc.systemEvent.emit("STATUE_SECOND_GUIDE")
                    }
                    cc.director.SoundManager.playSound("statueCollect")
                })
            );
            statue.runAction(action)
        }
    },
    paddyAnimation(obj){
        var _this = this
        var worldPosition = obj.worldPosition;
        var paddy = this.paddyPool.size() > 0 ? this.paddyPool.get() : cc.instantiate(this.paddyEffect);
        var pos = this.node.convertToNodeSpaceAR(worldPosition);
        paddy.parent = this.node
        paddy.position = pos;
        var getTargetIconWolrdPosition = this.target.getTargetIconWolrdPosition(42);
        if (getTargetIconWolrdPosition) {
            var posMove = this.node.convertToNodeSpaceAR(getTargetIconWolrdPosition)
            var action = cc.sequence(
                cc.spawn(
                    cc.moveBy(0.5, cc.v2(0, -50)), 
                    cc.scaleTo(0.5, 1.1)), 
                    cc.spawn(cc.moveTo(0.5, posMove), cc.scaleTo(0.5, 0.8))
                , cc.callFunc(function() {
                    _this.paddyPool.put(paddy),
                    cc.systemEvent.emit("NUMBER_COUNT", {
                        type: 42
                    })
                    //cc.director.SoundManager.playSound("mission")
            }));
            //cc.director.SoundManager.playSound("fruitDrop"),
            paddy.runAction(action)
        }
    },
    hinderFlowerAnimaiton: function(e) {
        var t = cc.instantiate(this.flower_example);
        t.active = true;
        var i = e.worldPos
          , s = this.node.convertToNodeSpaceAR(i);
        t.parent = this.node,
        t.position = s;
        var n = this.target.getTargetIconWolrdPosition(26);
        if (n) {
            var a = this.node.convertToNodeSpaceAR(n)
              , o = cc.sequence(cc.spawn(cc.sequence(cc.scaleTo(.5, 2), cc.scaleTo(.5, 1.9)), cc.sequence(cc.rotateBy(.5, -20), cc.rotateBy(.5, 20))), cc.spawn(cc.moveTo(1, a).easing(cc.easeIn(3)), cc.scaleTo(1, .2)), cc.callFunc(function() {
                t.removeFromParent(true),
                cc.director.SoundManager.playSound("mission"),
                cc.systemEvent.emit("NUMBER_COUNT", {
                    type: 26
                })
            }));
            t.runAction(o)
        }
    },
    hitGroundGrassAnimation: function(e) {
        var t, i = this, s = e.worldPos, n = e.index, a = this.node.convertToNodeSpaceAR(s);
        cc.director.SoundManager.playSound("grassHit1"),
        (t = this.grassPool.size() > 0 ? this.grassPool.get() : cc.instantiate(this.grassBreak)).parent = this.node,
        t.position = a;
        var o = t.getComponent(cc.Animation)
          , c = "grass" + n;
        o.play(c);
        var r = o.getClips()[0].duration;
        this.scheduleOnce(function() {
            i.grassPool.put(t)
        }, r)
    },
    hitCubesBubbleAnimation: function(e) {
        var t, i = this, s = e.worldPos, n = this.node.convertToNodeSpaceAR(s);
        (t = this.bubblePool.size() > 0 ? this.bubblePool.get() : cc.instantiate(this.bubbleBreak)).parent = this.node,
        t.position = n;
        var a = t.getComponent(cc.Animation);
        a.play("cubeBubbleBreak");
        var o = a.getClips()[0].duration;
        this.scheduleOnce(function() {
            i.bubblePool.put(t)
        }, o)
    },
    
});
