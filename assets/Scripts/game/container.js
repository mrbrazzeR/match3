var newLevelResource = require("../newLevelResource");
import utils  from "../utils"
import gameData from "../gameData"
import psconfig from "../psconfig"
cc.Class({
    extends: cc.Component,

    properties: {
        stone: cc.Prefab,
        del_col: cc.Prefab,
        fire: cc.Prefab,
        line: cc.Prefab,
        tool_effect: cc.Prefab,
        rotationEffect: cc.Prefab,
        balloonBoom: cc.Prefab,
        progressBar: require("./progressBar"),
        target: require("./target"),
        bgPrompt: require("./bgPrompt"),
        rock: cc.Prefab,
        boom_effect: cc.Prefab,
        toolCombineEffect: cc.Prefab,
        absorb: cc.Prefab,
        toolItem: cc.Prefab,
        superDisco: cc.Prefab,
        dust: cc.Prefab,
        testArrow: cc.Prefab,
        vineBreak: cc.Prefab,
        ironLineBreak_right: cc.Prefab,
        ironLineBreak_left: cc.Prefab,
        woodCubeBreak: cc.Prefab,
        normalCubeBreak: cc.Prefab,
        netBreak1: cc.Prefab,
        netBreak2: cc.Prefab,
        windmill_particle: cc.Prefab,
        ladyBugMove: cc.Prefab,
        ladyBugArrive: cc.Prefab,
        colorCubeBreak: cc.Prefab,
        ladyBugBubbleBreak: cc.Prefab,
        rockStoneBreak: cc.Prefab,
        grassGround: require("./glassGround"),
        bubbleGround: require("./bubbleCubeContainer"),
        cubeBreakList: [cc.SpriteFrame],
        guideNode: cc.Node
    },

    onLoad: function() {
        cc.director.container = this
        var e, t, i, s, n, a;
        cc.systemEvent.on("GAME_TOOL", this.handleGameTool, this),
        cc.systemEvent.on("REMOVE_CUBES", this.removeSameColorCubeByClick, this),
        cc.systemEvent.on("player_tool", this.handlePlayerTool, this),
        cc.systemEvent.on("FIREINTHEHOLE", this.fireTheHole, this),
        cc.systemEvent.on("BOXING_ANVIL", this.boxingAndAnvil, this),
        this.stonePool = new cc.NodePool("block"),
        this.colPool = new cc.NodePool,
        this.firePool = new cc.NodePool("arrow"),
        this.linePool = new cc.NodePool("line"),
        this.rockPool = new cc.NodePool,
        this.CubeBreakPool = new cc.NodePool,
        this.lineList = [];
        for (var o = 0; o < 100; o++)
            e = cc.instantiate(this.stone),
            this.stonePool.put(e);
        for (var c = 0; c < 10; c++)
            t = cc.instantiate(this.del_col),
            this.colPool.put(t);
        for (var r = 0; r < 20; r++)
            i = cc.instantiate(this.testArrow),
            this.firePool.put(i);
        for (var d = 0; d < 20; d++)
            s = cc.instantiate(this.line),
            this.linePool.put(s);
        for (var l = 0; l < 20; l++)
            n = cc.instantiate(this.rock),
            this.rockPool.put(n);
        for (var h = 0; h < 20; h++)
            a = cc.instantiate(this.normalCubeBreak),
            this.CubeBreakPool.put(a);
        cc.director.getCollisionManager().enabled = !0,
        
        this.passIndex = !1
        this.currentLevel = 0
        //
        this.elapsed = 0
        this.duration = 0
        this.force = 0
        this.shouldVibrate = false
        //
    },

    initStoneData: function(e, t) {
        var n;
        n = this.stonePool.size() > 0 ? this.stonePool.get() : cc.instantiate(this.stone);
        var a = utils.grid2Pos(e.x, e.y);
        n.getComponent("block").initStoneView(e.x, e.y, t),
        n.position = a,
        this.node.addChild(n);
        var o = utils.indexValue(e.x, e.y);
        gameData.starSprite[o] = -2 == t ? null : n
    },
    initContainerView: function(e) {
        this.reclaimNode();
        for (var t = 0; t < psconfig.matrixRow; t++){
            for (var i = 0; i < psconfig.matrixCol; i++) {
                var s = cc.v2(t, i);
                this.initStoneData(s, e[t][i])
            }
        }
    },
    reclaimNode: function() {
        for (var e = this.node.children, t = e.length - 1; t >= 0; t--) {
            var i = e[t];
            "block" == i.name ? this.stonePool.put(i) : i.removeFromParent()
        }
    },
    removeSameColorCubeByClick: function(e) {
        this.canclePlayerNotice();
        var t, i = e.detail, s = JSON.parse(JSON.stringify(i));
        this.hinderResponseCubesBreak(s, this)
        if (i.length >= 5){
            this.cubesToGameTool(s);
        }
        else {
            for (; i.length > 0; ){
                t = i.pop(),
                this.normalCubeBreakAnimation(t),
                this.removeBlock(t);
            }
            this.scheduleOnce(function() {
                cc.systemEvent.emit("STEP_COUNT"),
                cc.director.isrunning || this.whichTimeTampRow("\u79fb\u9664\u64cd\u4f5c")
            }, .5)
        }
    },
    normalCubeBreakAnimation: function(e) {
        var t, n = utils.grid2Pos(e.x, e.y);
        (t = this.CubeBreakPool.size() > 0 ? this.CubeBreakPool.get() : cc.instantiate(this.normalCubeBreak)).parent = this.node,
        t.position = n;
        var a = gameData.starMatrix[e.x][e.y]
        var o = t.getComponent(cc.ParticleSystem);
        o.spriteFrame = this.cubeBreakList[a]
        o.resetSystem()
        this.scheduleOnce(function() {
            this.CubeBreakPool.put(t)
        }, o.life)
    },
    becomeGameTool: function(e, t, n) {
        var a;
        a = this.stonePool.size() > 0 ? this.stonePool.get() : cc.instantiate(this.stone);
        var o = utils.indexValue(e.x, e.y);
        if (null != gameData.starSprite[o]) {
            var c = gameData.starSprite[o];
            this.stonePool.put(c)
        }
        gameData.starSprite[o] = a,
        a.parent = this.node,
        a.position = utils.grid2Pos(e.x, e.y),
        cc.director.SoundManager.playSound("combine"),
        this.toolAndSuperToolEffect(e);
        var r = a.getComponent("block");
        t >= 5 && t < 7 ? (gameData.starMatrix[e.x][e.y] = 8,
        r.initStoneView(e.x, e.y, 8, n)) : t >= 7 && t < 9 ? (gameData.starMatrix[e.x][e.y] = 9,
        r.initStoneView(e.x, e.y, 9, n)) : t >= 9 && (gameData.starMatrix[e.x][e.y] = 10,
        r.initStoneView(e.x, e.y, 10, n)),
        cc.systemEvent.emit("STEP_COUNT"),
        cc.director.isrunning || this.whichTimeTampRow("changeStonetexture")
    },
    cubesToGameTool: function(e) {
        var t, n = e.length, a = e[0], o = gameData.getDataBygrid(a);
        cc.director.SoundManager.playSound("combine1");
        for (var c = function(e, t, s, n) {
            n.becomeGameTool(e, t, s);
            var a = utils.judgeOperateLevel(t);
            cc.systemEvent.emit("OPERATION_EVALUATE", {
                level: a
            })
        }; e.length > 0; )
            t = e.pop(),
            0 == e.length ? this.nodeMove(t, a, n, o, c) : this.nodeMove(t, a)
    },
    balloonBoomEffect: function(e) {
        var t = cc.instantiate(this.balloonBoom)
          , s = utils.grid2Pos(e.x, e.y);
        t.position = s,
        t.parent = this.node;
        var n = t.getComponent(cc.Animation);
        n.play("balloon");
        var a = n.getClips()[0].duration;
        this.scheduleOnce(function() {
            t.removeFromParent()
        }, a)
    },
    vineBreakEffect: function(e) {
        var t = cc.instantiate(this.vineBreak)
          , s = utils.grid2Pos(e.x, e.y);
        t.position = s,
        t.parent = this.node;
        var n = t.getComponent(cc.Animation);
        cc.director.SoundManager.playSound("vineBreak"),
        cc.log("anim vineBreak")
        n.play("vineBreak");
        var a = n.getClips()[0].duration;
        this.scheduleOnce(function() {
            t.removeFromParent()
        }, a)
    },
    woodBoxBreakEffect: function(e, t) {
        var s;
        s = 2 == t ? cc.instantiate(this.ironLineBreak_right) : cc.instantiate(this.ironLineBreak_left);
        var n = utils.grid2Pos(e.x, e.y);
        s.position = n,
        s.parent = this.node;
        var a = s.getComponent(cc.Animation);
        if(t == 2){
            a.play("iron_right")
            cc.log("anim iron_right")
            cc.director.SoundManager.playSound("ironLine1")
        }else{
            cc.log("anim iron_left")
            a.play("iron_left")
            cc.director.SoundManager.playSound("ironLine1")
        }
    
        var o = a.getClips()[0].duration;
        this.scheduleOnce(function() {
            s.removeFromParent()
        }, o)
    },
    woodCubeBreakEffect: function(e) {
        var t = cc.instantiate(this.woodCubeBreak)
          , s = utils.grid2Pos(e.x, e.y);
        t.position = s,
        t.parent = this.node;
        var n = t.getComponent(cc.Animation);
        n.play("woodCubeBreak")
        cc.log("anim woodCubeBreak")
        cc.director.SoundManager.playSound("box_bomb");
        var a = n.getClips()[0].duration;
        this.scheduleOnce(function() {
            t.removeFromParent()
        }, a)
    },
    flowerOpenEffect: function() {
        cc.director.SoundManager.playSound("flower_hit")
    },
    flowerCollectAnimation: function(e) {
        if (this.flowerTempList) {
            if (utils.indexOfV2(this.flowerTempList, e))
                return;
            this.flowerTempList.push(e)
        } else
            this.flowerTempList = [],
            this.flowerTempList.push(e);
        var t = this.getNodeBygGrid(e).node;
        cc.director.SoundManager.playSound("flowerFinished");
        var s = this.node.convertToWorldSpaceAR(t.position);
        cc.systemEvent.emit("HINDER_FLOWER_ANIMATION", {
            flower: t,
            worldPos: s
        })
    },
    windmillBreakEffect: function(e, t) {
        var s;   
        s = 2 == t ? cc.instantiate(this.netBreak1) : cc.instantiate(this.netBreak2);
        var n = utils.grid2Pos(e.x, e.y);
        s.parent = this.node,
        s.position = n,
        s.zIndex = 2;
        var a = s.getComponent(cc.Animation);
        cc.director.SoundManager.playSound("netBreak"),
        a.play("netBreak" + (3 - t));
        cc.log("anim windmillBreakEffect", (3 - t))
        var o = a.getClips()[0].duration;
        this.scheduleOnce(function() {
            s.removeFromParent()
        }, o)
         
    },
    windmillDisappearEffect: function(e) {
        var t = this;
        if (this.tempPos) {
            if (utils.indexOfV2(this.tempPos, e))
                return void console.log(e, this.tempPos, "354");
            this.tempPos.push(e)
        } else
            this.tempPos = [],
            this.tempPos.push(e);
        var n = utils.getWindmillEffectAreaList(gameData.starMatrix, e)
          , a = this;
        if (!(n.length <= 0)) {
            cc.director.needWait = 1
            cc.game.windmillCount++
            cc.director.SoundManager.playSound("windmill");
            for (var o = function(o) {
                t.scheduleOnce(function() {
                    var t = n[o]
                      , c = utils.indexValue(t.x, t.y)
                      , r = gameData.starSprite[c];
                    r && (gameData.starMatrix[t.x][t.y] >= 8 && 27 != gameData.starMatrix[t.x][t.y] ? r.runAction(cc.sequence(cc.spawn(cc.sequence(cc.rotateBy(.05, 20), cc.rotateBy(.05, -20)).repeat(2), cc.scaleTo(.2, 1.2)), cc.scaleTo(.2, 1), cc.callFunc(function() {
                        r.angle = -0
                    }))) : 27 == gameData.starMatrix[t.x][t.y] ? r.getComponent("block").bombRatio > 1 ? r.runAction(cc.sequence(cc.spawn(cc.sequence(cc.rotateBy(.05, 20), cc.rotateBy(.05, -20)).repeat(2), cc.scaleTo(.2, 1.2)), cc.scaleTo(.2, 1), cc.callFunc(function() {
                        r.angle = -0
                    }))) : r.runAction(cc.spawn(cc.rotateBy(1, 1800), cc.scaleTo(1, 2))) : r.runAction(cc.spawn(cc.rotateBy(1, 1080), cc.scaleTo(1, .1)))),
                    o == n.length - 1 && this.scheduleOnce(function() {
                        this.vibrate(15,100)
                        var t = !0
                        var o = cc.instantiate(this.windmill_particle);
                        o.parent = this.node,
                        o.zIndex = 3,
                        o.position = utils.grid2Pos(e.x, e.y),
                        o.getComponent(cc.ParticleSystem).resetSystem()
                        cc.director.SoundManager.playSound("grassHit");
                        var c = n.shift();
                        a.removeBlock(c);
                        for (var r = n.length, d = 0; d < r; d++) {
                            var l = n[d];
                            gameData.starMatrix[l.x][l.y] > 7 ? 27 == gameData.starMatrix[l.x][l.y] ? a.getNodeBygGrid(l).bombRatio > 1 ? a.handleGameToolArray(l) : (t = !1,
                            a.windmillDisappearEffect(l)) : 39 != gameData.starMatrix[l.x][l.y] && a.handleGameToolArray(l) : a.removeBlock(l),
                            d == r - 1 && cc.game.windmillCount--
                        }
                        t && (0 == r && cc.game.windmillCount > 0 && cc.game.windmillCount--,
                        cc.director.needWait && 0 == cc.game.windmillCount ? cc.director.needWait = 0 : a.whichTimeTampRow("windmill"))
                    }, .5)
                }, .05 * o)
            }, c = 0; c < n.length; c++)
                o(c)
        }
    },
    colorCubeBreakEffect: function(e) {
        var t = cc.instantiate(this.colorCubeBreak)
          , s = utils.grid2Pos(e.x, e.y);
        t.position = s,
        t.parent = this.node;
        var n = t.getComponent(cc.Animation)
          , a = "colorCube_" + this.getNodeBygGrid(e).nextType;
        n.play(a)
        cc.log("anim ", a)
        cc.director.SoundManager.playSound("box_bomb");
        var o = n.getClips()[0].duration;
        this.scheduleOnce(function() {
            t.removeFromParent()
        }, o)
    },
    ladyBugCubesBreakEffect: function(e, t) {
        if (this.tempLadyBugList) {
            if (utils.indexOfV2(this.tempLadyBugList, e))
                return;
            this.tempLadyBugList.push(e)
        } else
            this.tempLadyBugList = [],
            this.tempLadyBugList.push(e);
        var s = cc.instantiate(this.ladyBugBubbleBreak)
          , n = utils.grid2Pos(e.x, e.y);
        s.position = n,
        s.parent = this.node,
        t = t > 0 ? 3 - t : 3;
        var a = s.getComponent(cc.Animation);
        cc.director.SoundManager.playSound("glassBallBreak");
        var o = "glassBallHit" + t;
        a.play(o);
        cc.log("anim ", o)
        var c = a.getClips()[t - 1].duration
          , r = this.getNodeBygGrid(e);
        3 == t && r && (r.view.active = !1,
        cc.director.needWait = 1,
        cc.director.isSuperTool = 1),
        this.scheduleOnce(function() {
            s.removeFromParent(),
            3 == t && (this.ladyBugCubeBreak(e),
            this.removeBlock(e),
            r.boxCubesDisappear())
        }, c)
    },
    rockStoneCubeBreakEffect: function(e) {
        var t = cc.instantiate(this.rockStoneBreak)
          , s = utils.grid2Pos(e.x, e.y);
        t.position = s,
        t.parent = this.node;
        var n = t.getComponent(cc.Animation);
        cc.director.SoundManager.playSound("cubeRockBreak")
        n.play("cubeRockBreak");
        cc.log("anim cubeRockBreak")
        var a = n.getClips()[0].duration;
        this.scheduleOnce(function() {
            t.removeFromParent()
        }, a)
    },
    hinderResponseCubesBreak: function(e, t) {
        this.handleBalloonBomb(e, t),
        this.handleVineBreak(e, t),
        this.handleWoodBreak(e, t),
        this.handleFlowerBreak(e, t),
        this.handleWindmillBreak(e, t),
        this.handleColorCubesBreak(e, t),
        this.handleLadyBugCubesBreak(e, t)
    },
    handleGameTool: function(e) {
        this.canclePlayerNotice();
        var t = e.detail
          , a = utils.needCombineTool(gameData.starMatrix, t.grid);
        if (a.length >= 2 && !t.from) {
            var o = this.whichSuperTool(gameData.starMatrix, a);
            cc.log("sadasd",o)
            this.triggerGameTool(o, t.grid, a)
        } else {
            if (t.index == psconfig.rType) {
                if (0 == t.type ? (
                    this.removeBlock(t.grid),
                    this.col_rocket(t.grid)
                ) : (
                    this.removeBlock(t.grid),
                    this.row_rocket(t.grid)
                ),
                cc.systemEvent.emit("OPERATION_EVALUATE", {
                    level: 3
                }),
                cc.director.isrunning)
                    return;
                this.whichTimeTampRow("\u6e38\u620f\u9053\u5177")
            }
            if (t.index == psconfig.bType) {
                this.boomEffect(t.grid);             
                var c = utils.rainbowStarRemoveList(gameData.starMatrix, t.grid);
                if(t.from && 1 == t.from){
                    this.removeBombBlockOnly(c)
                }else{
                    this.removeNineBlock(c)
                }
                cc.director.SoundManager.playSound("boom1")
                cc.systemEvent.emit("OPERATION_EVALUATE", {
                    level: 3
                })
            }
            if (t.index == psconfig.dType) {
                var r = utils.getSameBlockList(gameData.starMatrix, t.grid, t.type);
                this.discoRotation(t.grid);
                var d = JSON.parse(JSON.stringify(r));
                this.effectRemoveSame(t.grid, r, d, this.removeSameColorBlock),
                cc.systemEvent.emit("GAMEMASK_CONTROL", {
                    order: 1
                })
            }
        }
    },
    boomEffect: function(e) {   
        this.vibrate(15, 100)
        var t = cc.instantiate(this.boom_effect)
        var s = utils.grid2Pos(e.x, e.y);
        t.position = s,
        t.parent = this.node,
        t.getComponent(cc.ParticleSystem).resetSystem()
    },
    superDiscoAnima: function(e) {
        var t = cc.instantiate(this.superDisco)
          , s = utils.grid2Pos(e.x, e.y);
        t.position = s,
        t.parent = this.node,
        t.getComponent(cc.ParticleSystem).resetSystem()
    },
    removeNineBlock: function(e) {      
        var t = e.shift();
        this.effectRemoveCol(t)
        this.removeBlock(t)
        if (e.length <= 0){
            this.scheduleOnce(function() {
                cc.director.isrunning || this.whichTimeTampRow("removeNineBlock1")
            }, .5);
        }else{
            for (var i = 0; i < e.length; i++){
                this.handleGameToolArray(e[i]),
                i == e.length - 1 && this.scheduleOnce(function() {
                    cc.director.isrunning || this.whichTimeTampRow("removeNineBlock2")
                }, .5)
            }
        }
    },
    removeBombBlockOnly: function(e) {  
        var t = e.shift();    
        this.effectRemoveCol(t)
        this.removeBlock(t)
        this.boomEffect(t)
        if (!(e.length <= 0)){
            for (var i = 0; i < e.length; i++){
                this.handleGameToolArray(e[i])
            }
        }
    },
    discoRotation: function(e, t) {
        var i;
        i = cc.instantiate(this.absorb),
        this.getNodeBygGrid(e).discoEffect(i, t)
    },
    blackHoleEffect: function(e, t, s) {
        t || (t = 8);
        var n = new cc.Node;
        n.parent = this.node;
        var a = utils.grid2Pos(e.x, e.y);
        n.position = a;
        var o = cc.instantiate(this.absorb);
        o.parent = n;
        var c = cc.instantiate(this.toolItem);
        c.parent = n,
        o.getComponent(cc.ParticleSystem).resetSystem()
        c.getComponent("toolItem").changeItemTexture(t)
        c.runAction(cc.rotateBy(0.5, 540).repeatForever())
        this.scheduleOnce(function() {
            n.removeFromParent(),
            s && s(e, 9)
        }, 0.5)
    },
    triggerGameTool: function(name, t, n) {
        var a = JSON.parse(JSON.stringify(n));
        cc.systemEvent.emit("GAMEMASK_CONTROL", {
            order: 1
        })
        cc.director.isSuperTool = 1
        switch (name) {
            case "superDisco":
                this.toolCombineAnimation(a, function(e, t) {
                    e.blackHoleEffect(t, 9, e.superDiscoAnima.bind(e))
                }),
                this.scheduleOnce(function() {
                    cc.director.SoundManager.playSound("2"),
                    cc.director.SoundManager.playSound("3"),
                    this.superDiscoEffect(),
                    this.scheduleOnce(function() {
                        cc.director.isSuperTool = 0
                    }, 1)
                }, 1.3);
                break;
            case "disco&boom":
                this.toolCombineAnimation(a, function(e, t, i) {
                    e.discoBoomEffect(gameData.starMatrix, i, t)
                });
                break;
            case "disco&rocket":
                this.toolCombineAnimation(a, function(e, t, i) {
                    e.discoRocketEffect(gameData.starMatrix, i, t)
                });
                break;
            case "superBoom":
                this.toolCombineAnimation(a, function(e, t) {
                    var s = cc.instantiate(e.toolItem);
                    s.parent = e.node,
                    s.scale = 1,
                    s.position = utils.grid2Pos(t.x, t.y),
                    s.getComponent("toolItem").changeItemTexture(2),
                    cc.director.SoundManager.playSound("superBomb"),
                    s.runAction(cc.sequence(cc.scaleTo(.3, 4), cc.sequence(cc.rotateBy(.05, 20), cc.rotateBy(.05, -20), cc.rotateBy(.01, 0)).repeat(3), cc.callFunc(function() {
                        s.removeFromParent(),
                        e.boomEffect(t)
                    })))
                }),
                this.scheduleOnce(function() {
                    this.superBoomEffect(t),
                    cc.director.SoundManager.playSound("boom1"),
                    this.scheduleOnce(function() {
                        cc.director.isSuperTool = 0
                    }, 1)
                }, 1.2);
                break;
            case "3row&col":
                cc.log("3row&col")
                this.toolCombineAnimation(a, function(e, t) {
                    e.blackHoleEffect(t)
                }),
                cc.director.SoundManager.playSound("rocket_bomb"),
                this.scheduleOnce(function() {
                    this.boomAndRocketEffect(t),
                    this.scheduleOnce(function() {
                        cc.director.isSuperTool = 0
                    }, 1)
                }, 1.2);
                break;
            case "row&col":
                cc.log("row&col")
                this.toolCombineAnimation(a, function(e, t) {
                    e.blackHoleEffect(t, 10)
                }),
                this.scheduleOnce(function() {
                    this.superRocketEffect(t),
                    this.scheduleOnce(function() {
                        cc.director.isSuperTool = 0
                    }, 1)
                }, 1.2)
            }
    },
    toolCombineAnimation: function(e, t) {
        var n, a = this, o = e.shift(), c = a.getNodeBygGrid(o);
        10 == c._stoneType && (n = c.discoType)
        cc.director.SoundManager.playSound("rotation_combine");
        for (var r = function() {
            var c = e.pop()
              , r = a.getNodeBygGrid(c);
            10 == r._stoneType && (n = r.discoType);
            var d = utils.indexValue(c.x, c.y)
              , l = gameData.starSprite[d]
              , h = utils.grid2Pos(o.x, o.y);
            l.runAction(cc.sequence(cc.scaleTo(.2, 1.1), cc.spawn(cc.scaleTo(.2, .9), cc.moveTo(.2, h).easing(cc.easeBounceOut())), cc.spawn(cc.scaleTo(.2, .5), cc.fadeOut(.1)), cc.callFunc(function() {
                a.removeBlock(c),
                a.toolAndSuperToolEffect(o),
                0 == e.length && t(a, o, n)
            })))
        }; e.length > 0; )
            r()
    },
    getSuperDiscoList: function(e) {
        for (var t = [], i = 0; i < e.length; i++)
            for (var s = 0; s < e[i].length; s++)
                if (20 != e[i][s]) {
                    var n = cc.v2(i, s);
                    t.push(n)
                }
        return t
    },
    superBoomEffect: function(e) {
        var t = utils.getThreeBlockArea(gameData.starMatrix, e);
        this.removeNineBlock(t),
        this.target.isPass || (cc.systemEvent.emit("GAMEMASK_CONTROL", {
            order: 2
        }),
        cc.systemEvent.emit("OPERATION_EVALUATE", {
            level: 3
        }))
    },
    superRocketEffect: function(e) {
        this.removeBlock(e),
        this.row_rocket(e),
        this.col_rocket(e),
        cc.director.isrunning || (this.whichTimeTampRow("row&col"),
        this.target.isPass || (cc.systemEvent.emit("OPERATION_EVALUATE", {
            level: 3
        }),
        cc.systemEvent.emit("GAMEMASK_CONTROL", {
            order: 2
        })))
    },
    boomAndRocketEffect: function(e) {
        this.row_rocket(e),
        this.col_rocket(e),
        e.x + 1 < psconfig.matrixRow && this.row_rocket(cc.v2(e.x + 1, e.y)),
        e.x - 1 >= 0 && this.row_rocket(cc.v2(e.x - 1, e.y)),
        e.y - 1 >= 0 && this.col_rocket(cc.v2(e.x, e.y - 1)),
        e.y + 1 < psconfig.matrixCol && this.col_rocket(cc.v2(e.x, e.y + 1)),
        cc.director.isrunning || (this.target.isPass || (cc.systemEvent.emit("GAMEMASK_CONTROL", {
            order: 2
        }),
        cc.systemEvent.emit("OPERATION_EVALUATE", {
            level: 3
        })),
        this.whichTimeTampRow("row&col"))
    },
    discoBoomEffect: function(e, t, s) {
        var n = utils.getSameBlockList(e, s, t);
        cc.director.SoundManager.playSound("rotation_combine"),
        this.discoRotation(s, 2),
        this.changeToBoom(s, n, 1)
    },
    discoRocketEffect: function(e, t, s) {
        var n = utils.getSameBlockList(e, s, t);
        this.discoRotation(s, 1),
        cc.director.SoundManager.playSound("rotation_combine"),
        this.changeToBoom(s, n, 2)
    },
    changeToBoom: function(e, t, s, n) {
        var a, o = this;
        if (t.length <= 0)
            return this.executeListEffect(n, s),
            void this.scheduleOnce(function() {
                cc.director.isSuperTool = 0
            }, 1);
        n || (n = [e]);
        var c = t.pop();
        n.push(c);
        var r = utils.grid2Pos(e.x, e.y)
          , d = utils.grid2Pos(c.x, c.y);
        (a = this.firePool.size() > 0 ? this.firePool.get() : cc.instantiate(this.fire)).parent = this.node,
        a.position = r;
        var l = this.node.convertToWorldSpaceAR(r)
          , h = this.node.convertToWorldSpaceAR(d);
        a.getComponent("arrow").computedLineDistanceAndRotation(l, h),
        cc.director.SoundManager.playSound("flyStart"),
        a.runAction(cc.sequence(cc.moveTo(.3, d), cc.callFunc(function() {
            o.firePool.put(a),
            o.blockToBoom(c, s),
            cc.director.SoundManager.playSound("flyEnd"),
            o.changeToBoom(e, t, s, n)
        })))
    },
    executeListEffect: function(e, t) {
        if (0 == e.length) {
            if (cc.director.isrunning)
                return;
            return this.target.isPass || (cc.systemEvent.emit("GAMEMASK_CONTROL", {
                order: 2
            }),
            cc.systemEvent.emit("OPERATION_EVALUATE", {
                level: 3
            })),
            cc.director.needWait = !0,
            this.whichTimeTampRow("\u76f8\u540c\u9053\u5177\u5217\u8868"),
            void this.scheduleOnce(function() {
                cc.director.needWait = !1
            }, .5)
        }
        var a = e.shift()
          , o = this.getNodeBygGrid(a);
        if (1 == t) {
            if (o && o._stoneType == psconfig.bType) {
                var c = utils.rainbowStarRemoveList(gameData.starMatrix, a);
                cc.director.SoundManager.playSound("boom1"),
                this.removeBombBlockOnly(c)
            }
        } else
            o && o._stoneType == psconfig.rType && (1 == o.rocketType ? this.col_rocket(a) : this.row_rocket(a));
        this.executeListEffect(e, t)
    },
    listEffect: function(e) {
        if (!(e.length <= 0)) {
            var t = e.pop();
            if (t) {
                var i = this.getNodeBygGrid(t);
                i._stoneType == rType && i.rocketType,
                i._stoneType,
                bType
            }
        }
    },
    superDiscoEffect: function() {
        var e = this.getSuperDiscoList(gameData.starMatrix);
        this.removeBlockOnly(e),
        this.target.isPass || (cc.systemEvent.emit("OPERATION_EVALUATE", {
            level: 3
        }),
        cc.systemEvent.emit("GAMEMASK_CONTROL", {
            order: 2
        }),
        console.log("helloworld"))
    },
    whichSuperTool: function(e, t) {
        for (var i = 0, s = 0, a = 0, o = 0; o < t.length; o++) {
            var c = t[o];
            e[c.x][c.y] == psconfig.rType && i++, 
            e[c.x][c.y] == psconfig.bType && s++, 
            e[c.x][c.y] == psconfig.dType && a++
        }
        if (a >= 2) return "superDisco";
        if (1 == a) {
            if (s > 0) return "disco&boom";
            if (i > 0) return "disco&rocket"
        }
        if (0 == a) {
            if (s >= 2) return "superBoom";
            if (1 == s && i > 0) return "3row&col";
            if (0 == s && i >= 2) return "row&col"
        }
    },
    judgeDiscoType: function(e) {
        for (var t = -1, a = 0; a < e.length; a++) {
            var o = e[a];
            if (gameData.starMatrix[o.x][o.y] == psconfig.dType) {
                var c = utils.indexValue(o.x, o.y);
                t = gameData.starSprite[c].getComponent("block").discoType;
                break
            }
        }
        if (t >= 0)
            return t
    },
    handlePlayerTool: function(e) {
        this.canclePlayerNotice();
        var t = e;
        if (1 == t.type && (this.scheduleOnce(function() {
            this.whichTimeTampRow()
        }, .2),
        cc.systemEvent.emit("UPDATE_TOOL", {
            type: 1,
            statuCode: 2
        })),
        2 == t.type && (this.scheduleOnce(function() {
            this.whichTimeTampRow()
        }, .2),
        cc.systemEvent.emit("UPDATE_TOOL", {
            type: 2,
            statuCode: 2
        })),
        3 == t.type) {
            var i = t.grid;
            if (this.toolAndSuperToolEffect(i),
            gameData.starMatrix[i.x][i.y] >= 8 && gameData.starMatrix[i.x][i.y] <= 10)
                return;
            this.handleSingleGrid(t.grid),
            this.scheduleOnce(function() {
                this.whichTimeTampRow()
            }, .2),
            cc.director.SoundManager.playSound("ham"),
            cc.systemEvent.emit("UPDATE_TOOL", {
                type: 3,
                statuCode: 2
            })
        }
        4 == t.type && (this.shuffleStarMatrix(),
        cc.director.isMoving = !1,
        cc.systemEvent.emit("UPDATE_TOOL", {
            type: 4,
            statuCode: 2
        })),
        cc.director.isPlayerUsedTool = !0
    },
    discoRemoveCuneEffect: function(e) {
        var t = utils.grid2Pos(e.x, e.y)
          , s = cc.instantiate(this.dust);
        s.parent = this.node,
        s.position = t,
        s.getComponent(cc.ParticleSystem).resetSystem()
    },
    effectRemoveCol: function(e) {
        var t, s = utils.grid2Pos(e.x, e.y);
        (t = this.colPool.size() > 0 ? this.colPool.get() : cc.instantiate(this.del_col)).parent = this.node,
        t.position = s,
        t.getComponent(cc.ParticleSystem).resetSystem()
    },
    test: function(e) {
        var t, s = e.detail, n = utils.grid2Pos(s.x, s.y);
        (t = this.colPool.size() > 0 ? this.colPool.get() : cc.instantiate(this.del_col)).parent = this.node,
        t.position = n,
        t.getComponent(cc.ParticleSystem).resetSystem()
    },
    effectRemoveSame: function(e, t, n, a, o) {
        var c, r = this;
        if (t.length <= 0){
            a && a(n, r, o);
        }else {
            o || (o = []);
            var d = t.pop()
              , l = utils.grid2Pos(e.x, e.y)
              , h = utils.grid2Pos(d.x, d.y)
              , p = utils.indexValue(d.x, d.y);
            if (gameData.starSprite[p]) {
                (c = this.linePool.size() > 0 ? this.linePool.get() : cc.instantiate(this.line)).parent = this.node;
                
                var m = c.getComponent("line");
                cc.director.SoundManager.playSound("disco"),
                m.computedLineDistanceAndRotation(l, h),
                c.position = l,
                o.push(c),
                c.scale = .05,
                c.runAction(cc.sequence(cc.scaleTo(.1, 1, 1), cc.callFunc(function() {
                    r.blockEffect(d),
                    r.effectRemoveSame(e, t, n, a, o)
                })))
            } else{
                r.effectRemoveSame(e, t, n, a, o)
            }
        }
    },
    blockEffect: function(e) {
        var t = utils.indexValue(e.x, e.y)
          , n = gameData.starSprite[t];
        n && n.getComponent("block").blockChoosed()
    },
    blockToBoom: function(e, t) {
        var a = utils.indexValue(e.x, e.y)
          , o = gameData.starSprite[a];
        if (o) {
            var c = gameData.getDataBygrid(e);
            cc.systemEvent.emit("NUMBER_COUNT", {
                type: c
            });
            var r = o.getComponent("block");
            1 == t ? (r.changeStoneNum(psconfig.bType),
            gameData.starMatrix[e.x][e.y] = psconfig.bType) : (r.changeStoneNum(psconfig.rType),
            gameData.starMatrix[e.x][e.y] = psconfig.rType)
        }
    },
    isSpecialTool: function(e) {
        for (var t = !1, i = 0; i < e.length; i++) {
            var a = e[i];
            if (gameData.starMatrix[a.x][a.y] >= psconfig.rType && gameData.starMatrix[a.x][a.y] < 20) {
                t = !0;
                break
            }
        }
        return t
    },
    handleBalloonBomb: function(e, t) {
        var n = utils.getBalloonClearList(gameData.starMatrix, e, 21);
        if (n && n.length > 0)
            for (; n.length > 0; ) {
                var a = n.pop();
                t.balloonBoomEffect(a),
                t.removeBlock(a)
                cc.director.SoundManager.playSound("balloonBreaken")
            }
    },
    handleVineBreak: function(e, t) {
        var n = utils.getBalloonClearList(gameData.starMatrix, e, 22);
        if (n && n.length > 0)
            for (; n.length > 0; ) {
                var a = n.pop()
                  , o = this.getNodeBygGrid(a);
                t.vineBreakEffect(a),
                o.bombRatio--,
                o.cubesUnlock()
            }
    },
    handleWoodBreak: function(e, t) {
        cc.log("handleWoodBreak")
        var n = utils.getBalloonClearList(gameData.starMatrix, e, 23);
        if (n && n.length > 0)
            for (; n.length > 0; ) {
                var a = n.pop()
                  , o = this.getNodeBygGrid(a);
                "number" == typeof o.bombRatio && (o.bombRatio--,
                o.bombRatio <= 0 ? (t.removeBlock(a),
                o.boxCubesDisappear(),
                t.woodCubeBreakEffect(a)) : (o.boxHit(),
                2 == o.bombRatio ? this.woodBoxBreakEffect(a, 2) : this.woodBoxBreakEffect(a, 1)))
            }
    },
    handleFlowerBreak: function(e, t) {
        var n = utils.getBalloonClearList(gameData.starMatrix, e, 26);
        if (n && n.length > 0)
            for (; n.length > 0; ) {
                var a = n.pop()
                  , o = this.getNodeBygGrid(a);
                "number" == typeof o.bombRatio && (o.bombRatio--,
                o.bombRatio < 0 ? (t.flowerCollectAnimation(a),
                o.collectFlower()) : (o.flowerHit(),
                t.flowerOpenEffect(a)))
            }
    },
    handleWindmillBreak: function(e, t) {
        var n = utils.getBalloonClearList(gameData.starMatrix, e, 27);
        if (n && n.length > 0)
            for (; n.length > 0; ) {
                var a = n.pop()
                var o = this.getNodeBygGrid(a);
                "number" == typeof o.bombRatio && (
                    o.bombRatio--,
                    o.bombRatio <= 0 ? t.windmillDisappearEffect(a) : (o.hitWindmill(),
                    t.windmillBreakEffect(a, o.bombRatio))
                )
            }
    },
    handleColorCubesBreak: function(e, t) {
        var n = utils.getBalloonClearList(gameData.starMatrix, e, 29)
          , a = gameData.starMatrix[e[0].x][e[0].y];
        if (n && n.length > 0)
            for (; n.length > 0; ) {
                var o = n.pop()
                  , c = this.getNodeBygGrid(o);
                c.nextType == a && "number" == typeof c.bombRatio && (c.bombRatio--,
                c.bombRatio <= 0 && (t.colorCubeBreakEffect(o),
                t.removeBlock(o),
                c.boxCubesDisappear()))
            }
    },
    handleColorBalloonBreak: function(e) {
        utils.getBalloonClearList(gameData.starMatrix, e, 40)
    },
    handleLadyBugCubesBreak: function(e, t) {
        var n = utils.getBalloonClearList(gameData.starMatrix, e, 37);
        if (n && n.length > 0){
            for (; n.length > 0; ) {
                var a = n.pop()
                  , o = this.getNodeBygGrid(a);
                "number" == typeof o.bombRatio && (o.bombRatio--,
                o.bombRatio <= 0 ? t.ladyBugCubesBreakEffect(a, o.bombRatio) : (t.ladyBugCubesBreakEffect(a, o.bombRatio),
                o.hitLadyBugCubes()))
            }
        }
    },
    ladyBugCubeBreak: function(e) {
        var t = 4 + Math.floor(4 * Math.random());
        cc.systemEvent.emit("GAMEMASK_CONTROL", {
            order: 1
        })
        cc.director.SoundManager.playSound("ladyBugFly");
        var n = utils.randomGetGrid(t, gameData.starMatrix);
        if (n && n.length > 0){          
            for (var a = 0; a < n.length; a++) {
                var o = n[a];
                a == n.length - 1 ? this.ladyBugMoveLine(e, o, !0) : this.ladyBugMoveLine(e, o)
            }
        }else{
            cc.director.needWait = 0,
            cc.director.isSuperTool = 0,
            this.target.isGameEnd || cc.systemEvent.emit("GAMEMASK_CONTROL", {
                order: 2
            })
        }
    },
    ladyBugMoveLine: function(e, t, s) {
        var n, a, o = this;
        n = utils.grid2Pos(e.x, e.y),
        a = utils.grid2Pos(t.x, t.y);
        var c = cc.instantiate(this.ladyBugMove);
        c.getComponent(cc.Animation).play("ladyBug"),
        cc.log("anim ladyBug"),
        c.parent = this.node,
        c.position = n,
        c.zIndex = 10;
        var r = [cc.v2(n.x, 3 * (n.y + a.y) / 4), cc.v2(a.x, 1 * (n.y + a.y) / 4), a]
        var d = cc.sequence(cc.bezierTo(1, r), cc.spawn(cc.delayTime(.3), cc.callFunc(function() {
            o.cubeShakeAction(t)
        })), cc.fadeOut(.2), cc.callFunc(function() {
            c.removeFromParent(),
            o.ladyBugArriveCubeEffect(a),
            o.changeCubesAccordingAround(t),
            s && (
                o.vibrate(15,100),
                o.target.isGameEnd || cc.systemEvent.emit("GAMEMASK_CONTROL", {
                    order: 2
                }),
                cc.director.needWait = 0,
                cc.director.isSuperTool = 0,
                cc.director.SoundManager.playSound("ladyBugChangeColor"),
                o.showTipsView()
            )
        }));
        c.runAction(d)
    },
    ladyBugArriveCubeEffect: function(e) {
        var t = cc.instantiate(this.ladyBugArrive);
        t.parent = this.node,
        t.position = e,
        t.getComponent(cc.ParticleSystem).resetSystem()
    },
    changeCubesAccordingAround: function(e) {
        var t = this.judgeCubes(e);
        if (this.getNodeBygGrid(t)) {
            var i = this.getNodeBygGrid(e);
            if (!i)
                return;
            var n = gameData.starMatrix[t.x][t.y];
            gameData.starMatrix[e.x][e.y] = n;
            var a = i.node
              , o = cc.sequence(cc.scaleTo(.2, .8), cc.scaleTo(.4, 1.2), cc.scaleTo(.2, 1));
            a.runAction(o),
            i.initStoneView(e.x, e.y, n)
        }
    },
    cubeShakeAction: function(e) {
        var t = this.getNodeBygGrid(e);
        if (t) {
            var i = t.node
              , s = cc.sequence(cc.scaleTo(.02, .8), cc.scaleTo(.04, 1.2), cc.scaleTo(.02, 1)).repeat(3);
            i.runAction(s)
        }
    },
    judgeCubes: function(e) {
        for (var t, n = utils.getItemAdjacentPos(e), a = !1, o = 0; o < n.length; o++) {
            var c = n[o];
            if (gameData.starMatrix[c.x][c.y] >= 0 && gameData.starMatrix[c.x][c.y] < 8) {
                a = !0,
                t = c;
                break
            }
        }
        return !!a && t
    },
    removeSameColorBlock: function(e, t, n) {
        if (e) {
            t.vibrate(15,100)
            t.hinderResponseCubesBreak(e, t);
            for (var a = 0; a < e.length; a++) {
                var o = utils.indexValue(e[a].x, e[a].y)
                  , c = gameData.starSprite[o];
                c && (c.stopActionByTag(1),
                t.discoRemoveCuneEffect(e[a]),
                t.removeBlock(e[a]),
                cc.director.SoundManager.playSound("afterDisco")
                )
            }
            for (var r = n.length - 1; r >= 0; r--)
                t.linePool.put(n[r]);
            t.target.isPass || (cc.systemEvent.emit("GAMEMASK_CONTROL", {
                order: 2
            }),
            cc.systemEvent.emit("OPERATION_EVALUATE", {
                level: 3
            })),
            cc.director.isrunning || t.whichTimeTampRow("removeSamecolorblock")
        } else
            console.log("error", e)
    },
    updateStoneTexture: function(e, t, n) {
        var a;
        a = this.stonePool.size() > 0 ? this.stonePool.get() : cc.instantiate(this.stone);
        var o = utils.indexValue(e.x, e.y);
        if (null != gameData.starSprite[o]) {
            var c = gameData.starSprite[o];
            this.stonePool.put(c)
        }
        gameData.starSprite[o] = a,
        a.parent = this.node,
        a.position = utils.grid2Pos(e.x, e.y),
        gameData.updateSingleData(e, t + n),
        t + n - 1 >= 8 && (cc.director.SoundManager.playSound("combine"),
        this.toolAndSuperToolEffect(e));
        var r = a.getComponent("block")
          , d = gameData.getDataBygrid(e);
        r.initStoneView(e.x, e.y, d, n),
        cc.systemEvent.emit("STEP_COUNT"),
        cc.director.isrunning || this.whichTimeTampRow("changeStonetexture")
    },
    toolAndSuperToolEffect: function(e) {
        var t = utils.grid2Pos(e.x, e.y)
          , s = cc.instantiate(this.toolCombineEffect);
        s.position = t,
        s.parent = this.node
    },
    nodeMove: function(e, t, n, a, o) {
        var c = this
          , r = utils.indexValue(e.x, e.y)
          , d = gameData.starSprite[r]
          , l = utils.grid2Pos(t.x, t.y);
        d.getComponent("block").outLine.active = !0,
        d.zIndex = 1;
        var h = gameData.getDataBygrid(e);
        gameData.starSprite[r] = null,
        gameData.cleanStarData([e]),
        cc.systemEvent.emit("REMOVE_SINGLE_GRASS", {
            pos: e
        }),
        h >= 0 && h < 8 && cc.systemEvent.emit("REMOVE_SINGLE_BUBBLE", {
            pos: e
        }),
        d.runAction(cc.sequence(cc.scaleTo(.2, 1.5), cc.spawn(cc.rotateBy(.2, 360 * Math.random()), cc.scaleTo(.2, .5), cc.moveTo(.2, l)), cc.spawn(cc.scaleTo(.2, .5), cc.fadeOut(.1)), cc.callFunc(function() {
            c.removeBlock2(d, h),
            n && o && a >= 0 && o(t, n, a, c)
        })))
    },
    removeBlock2: function(e, t) {
        e && (cc.systemEvent.emit("NUMBER_COUNT", {
            type: t
        }),
        t < 20 ? this.progressBar.judgeStepScore(250) : this.progressBar.judgeStepScore(0),
        e.removeFromParent(),
        this.stonePool.put(e))
    },
    removeBlock: function(e, t) {
        var n = utils.indexValue(e.x, e.y)
          , a = gameData.starSprite[n];
        if (a) {
            var o = gameData.getDataBygrid(e);
            t || (
                cc.systemEvent.emit("NUMBER_COUNT", {
                    type: o
                }),
                o < 20 ? this.progressBar.judgeStepScore(250) : this.progressBar.judgeStepScore(0)
            )
            gameData.starSprite[n] = null
            this.stonePool.put(a)
            gameData.cleanStarData([e])
            cc.systemEvent.emit("REMOVE_SINGLE_GRASS", {
                pos: e
            })
            o >= 0 && o < 8 && cc.systemEvent.emit("REMOVE_SINGLE_BUBBLE", {
                pos: e
            })
        }
    },
    judgeSpecialBlock: function(e) {
        for (var t = e.length, a = 0; a < e.length; a++)
            if (gameData.getDataBygrid(e[a]) >= 8) {
                var o = this.getNodeBygGrid(e[a]);
                if (o._stoneType == psconfig.rType)
                    if (0 == o.rocketType)
                        for (var c = utils.getColData(gameData.starMatrix, e[a]), r = 0; r < c.length; r++)
                            utils.indexOfV2(e, c[r]) || e.push(c[r]);
                    else
                        for (var d = utils.getRowData(gameData.starMatrix, e[a]), l = 0; l < d.length; l++)
                            utils.indexOfV2(e, d[l]) || e.push(d[l]);
                else {
                    if (o._stoneType == psconfig.bType)
                        for (var h = utils.rainbowStarRemoveList(gameData.starMatrix, e[a]), p = 0; p < h.length; p++)
                            utils.indexOfV2(e, h[p]) || e.push(h[p]);
                    if (o._stoneType == psconfig.dType)
                        for (var m = o.discoType, u = utils.getSameBlockList(gameData.starMatrix, e[a], m), g = 0; g < u.length; g++)
                            utils.indexOfV2(e, u[g]) || e.push(u[g])
                }
            }
        if (t == e.length)
            return e;
        this.judgeSpecialBlock(e)
    },
    getNodeBygGrid: function(e) {
        var t = utils.indexValue(e.x, e.y)
          , n = gameData.starSprite[t];
        return !!n && n.getComponent("block")
    },
    tampRows: function() {
        this.canclePlayerNotice(),
        this.resumeOriginView(),
        this.queryCanFall(),
        this.addStar(),
        utils.gameOver(gameData.starMatrix) && (cc.systemEvent.emit("GAMEMASK_CONTROL", {
            order: 1
        }),
        this.scheduleOnce(function() {
            cc.systemEvent.emit("SHUFFLE_TIPS")
        }, 1.5),
        this.scheduleOnce(function() {
            this.shuffleStarMatrix()
        }, 2.5)),
        this.isPineToEnd(),
        cc.director.isMoving = !1,
        gameData.bestLevel > 0 && this.showTipsView()
    },
    queryCanFall: function(e) {
        var t;
        t = "number" == typeof e ? e : 0;
        for (var i = 0; i < psconfig.matrixCol; i++) {
            for (var a = i, o = -1, c = t; c < psconfig.matrixRow; c++)
                if (-1 == gameData.starMatrix[c][a]) {
                    o = c;
                    break
                }
            if (o >= 0)
                for (var r = o; r < psconfig.matrixRow; r++)
                    if (-2 != gameData.starMatrix[r][a] && 26 != gameData.starMatrix[r][a] && 27 != gameData.starMatrix[r][a]) {
                        for (var d = -1, l = r + 1; l < psconfig.matrixRow; l++)
                            if (gameData.starMatrix[l][a] >= 0 && 26 != gameData.starMatrix[l][a] && 27 != gameData.starMatrix[l][a]) {
                                d = l;
                                break
                            }
                        if (d >= 0) {
                            if (22 == gameData.starMatrix[d][a] || gameData.starMatrix[d][a] >= 23 && gameData.starMatrix[d][a] <= 25 || gameData.starMatrix[d][a] >= 29 && gameData.starMatrix[d][a] <= 36) {
                                this.queryCanFall(d + 1);
                                break
                            }
                            gameData.starMatrix[r][a] = gameData.starMatrix[d][a],
                            gameData.starMatrix[d][a] = -1,
                            this.donwMove(cc.v2(r, a), cc.v2(d, a))
                        }
                    }
        }
    },
    showTipsView: function() {
        var e = JSON.parse(JSON.stringify(gameData.starMatrix))
          , t = utils.chooseRemoveList(e);
        if (!(t.length <= 0)) {
            for (var n = 0; n < t.length; n++)
                for (var a = t[n], o = a.length, c = 0; c < o; c++) {
                    var r = void 0;
                    o >= 5 && o < 7 && (r = 0),
                    o >= 7 && o < 9 && (r = 1),
                    o >= 9 && (r = 2),
                    this.getNodeBygGrid(a[c]).updateTipsView(r)
                }
            this.tempTipsView = t
        }
    },
    resumeOriginView: function() {
        for (var e = 0; e < psconfig.matrixRow; e++)
            for (var t = 0; t < psconfig.matrixCol; t++)
                if (gameData.starMatrix[e][t] >= 0 && gameData.starMatrix[e][t] < psconfig.rType) {
                    var i = cc.v2(e, t);
                    this.getNodeBygGrid(i).originView()
                }
    },
    donwMove: function(e, t) {
        var n = utils.indexValue(t.x, t.y)
          , a = utils.indexValue(e.x, e.y)
          , o = utils.grid2Pos(e.x, e.y)
          , c = gameData.starSprite[n];
        c.stopActionByTag(5),
        c.getComponent("block").changeStoneGrid(e.x, e.y),
        gameData.starSprite[a] = c,
        gameData.starSprite[n] = null;
        var r = cc.sequence(cc.moveTo(.01 * t.x, o).easing(cc.easeExponentialIn()), cc.jumpTo(.1, o, 10, 1), cc.callFunc(function() {
            cc.director.SoundManager.playSound("drop4")
        }));
        r.tag = 5,
        c.runAction(r)
    },
    isPineToEnd: function() {
        var e = this.isFallToBlow(gameData.starMatrix);
        e && (this.addGameMoveStatus(),
        cc.director.isPine = 1,
        this.scheduleOnce(function() {
            this.removePineCone(e)
        }, .5))
    },
    removePineCone: function(e) {
        if (!this.tempList) {
            this.tempList = e;
            for (var t = 0; t < e.length; t++) {
                var s = e[t];
                this.removeBlock(s, 1);
                var n = utils.grid2Pos(s.x, s.y)
                  , a = this.node.convertToWorldSpaceAR(n)
                  , o = t == e.length - 1;
                o && cc.systemEvent.emit("GAMEMASK_CONTROL", {
                    order: 1
                }),
                cc.systemEvent.emit("PINECONE", {
                    worldPosition: a,
                    isLast: o
                })
            }
            this.scheduleOnce(function() {
                cc.director.isrunning || (this.whichTimeTampRow("removepinecone"),
                this.tempList = null)
            }, .5)
        }
    },
    isFallToBlow: function(e) {
        for (var t = [], i = [], s = 0; s < e.length; s++)
            for (var n = 0; n < e[s].length; n++)
                20 == e[s][n] && i.push(cc.v2(s, n));
        for (; i.length > 0; ) {
            var a = i.pop();
            this.judgePineDowm(a, e) && t.push(a)
        }
        return t.length > 0 && t
    },
    judgePineDowm: function(e, t) {
        var i = !0
          , s = e.x;
        if (0 == s)
            return i;
        for (var n = s - 1; n >= 0; n--)
            if (-2 != t[n][e.y]) {
                i = !1;
                break
            }
        return i
    },
    addStar: function() {
        for (var e = 0; e < psconfig.matrixCol; e++) {
            for (var t = -1, i = psconfig.matrixRow - 1; i >= 0; i--)
                if (22 == gameData.starMatrix[i][e] || gameData.starMatrix[i][e] >= 23 && gameData.starMatrix[i][e] <= 25 || gameData.starMatrix[i][e] >= 29 && gameData.starMatrix[i][e] <= 36) {
                    t = i;
                    break
                }
            if (t >= 0) {
                for (var a = t; a < psconfig.matrixRow; a++)
                    if (-1 == gameData.starMatrix[a][e]) {
                        var o = cc.v2(a, e);
                        this.fallStoneFromTop(o)
                    }
            } else
                for (var c = 0; c < psconfig.matrixRow; c++)
                    if (-1 == gameData.starMatrix[c][e]) {
                        var r = cc.v2(c, e);
                        this.fallStoneFromTop(r)
                    }
        }
        this.target.isPass || this.handleCanCombineTool()
    },
    handleCanCombineTool: function() {
        if (this.effectList)
            for (; this.effectList.length > 0; )
                this.effectList.pop().getChildByName("temp").removeAllChildren();
        else
            this.effectList = [];
        for (var e = utils.judgeNearNode(gameData.starMatrix); e.length > 0; ) {
            var t, n = e.pop(), a = this.getNodeBygGrid(n);
            t = cc.instantiate(this.tool_effect),
            a.toolCanCombineEffect(t),
            this.effectList.push(a.node)
        }
    },
    removeToolEffect: function(e) {
        var t = this.getNodeBygGrid(e).temp
          , i = t.getChildByName("tool_effect");
        this.toolEffectPool.put(i),
        t.active = !1
    },
    fallStoneFromTop: function(e) {
        var t, n = e.y;
        t = this.stonePool.size() > 0 ? this.stonePool.get() : cc.instantiate(this.stone);
        var a = utils.grid2Pos(10, n);
        this.node.addChild(t);
        var o = t.getComponent("block")
        var c = utils.randomColorByArray([1, 2, 3, 4, 5]);
        o.initStoneView(e.x, e.y, c - 1)
        gameData.updateSingleData(e, c)
        t.position = a;
        var r = utils.grid2Pos(e.x, e.y)
        var d = utils.indexValue(e.x, e.y);
        gameData.starSprite[d] = t
        t.runAction(
            cc.sequence(
                cc.fadeIn(0.1), cc.moveTo(.01 * e.x, r).easing(cc.easeExponentialIn()), cc.callFunc(function() {
                    cc.director.SoundManager.playSound("drop4")
                }),
                cc.jumpBy(0.1, cc.v2(0, 0), 10, 1)
            )
        )
    },
    shuffleStarMatrix: function() {
        this.canclePlayerNotice()
        cc.director.SoundManager.playSound("dice");
        for (var e = gameData.starSprite, t = [], a = 0; a < e.length; a++)
            if (e[a]) {
                var o = e[a].getComponent("block")._stoneType;
                o >= 0 && o < psconfig.rType && t.push(e[a])
            }
        t = this.shuffle(t);
        for (var c = 0, r = 0; r < e.length; r++)
            if (e[r]) {
                var d = e[r].getComponent("block")._stoneType;
                d >= 0 && d < psconfig.rType && (e[r] = t[c],
                c++)
            }
        for (var l = 0; l < psconfig.matrixRow; l++)
            for (var h = 0; h < psconfig.matrixCol; h++)
                if (gameData.starMatrix[l][h] >= 0 && gameData.starMatrix[l][h] < psconfig.rType) {
                    var p = utils.indexValue(l, h)
                      , m = gameData.starSprite[p]
                      , u = m.getComponent("block")
                      , g = utils.grid2Pos(l, h);
                    m.runAction(cc.moveTo(.5, g)),
                    gameData.starMatrix[l][h] = u._stoneType,
                    u.changeStoneGrid(l, h)
                }
        this.handleCanCombineTool(),
        this.resumeOriginView(),
        gameData.bestLevel > 0 && this.showTipsView(),
        utils.gameOver(gameData.starMatrix) ? (cc.systemEvent.emit("SHUFFLE_TIPS"),
        this.scheduleOnce(function() {
            this.shuffleStarMatrix()
        }, 1.5)) : cc.systemEvent.emit("GAMEMASK_CONTROL", {
            order: 2
        })
    },
    shuffle: function(e) {
        for (var t, i, s = e.length; s; )
            i = e[t = Math.floor(Math.random() * s--)],
            e[t] = e[s],
            e[s] = i;
        return e
    },
    fireTheHole: function(e) {
        var t, s = this, n = e;
        t = this.firePool.size() > 0 ? this.firePool.get() : cc.instantiate(this.fire);
        var a, o = this.node.convertToNodeSpaceAR(n.startPos);
        if (n.endGrid) {
            a = utils.grid2Pos(n.endGrid.x, n.endGrid.y),
            t.parent = this.node,
            t.position = o,
            cc.director.SoundManager.playSound("flyStart"),
           // cc.log(t)
            t.getComponent("arrow").computedLineDistanceAndRotation(n.startPos, a);
            var c = cc.sequence(cc.moveTo(.3, a), cc.callFunc(function() {
                s.effectRemoveCol(n.endGrid)
                
            }), cc.callFunc(function() {
                s.firePool.put(t),
                s.blockToBoom(n.endGrid, 2)
                cc.director.SoundManager.playSound("flyEnd")
            }));
            t.runAction(c),
            n.step <= 0 && this.scheduleOnce(function() {
                s.executePassEffect()
            }, 1)
        } else
            this.executePassEffect()
    },
    getGameTool: function() {
        for (var e, t = psconfig.matrixRow - 1; t >= 0; t--)
            for (var i = 0; i < psconfig.matrixCol; i++)
                if (gameData.starMatrix[t][i] >= psconfig.rType && gameData.starMatrix[t][i] <= psconfig.dType) {
                    e = cc.v2(t, i);
                    break
                }
        return e || !1
    },
    executePassEffect: function() {
        var e = this.getGameTool();
        this.passIndex = !0
        if(e){
            this.handleGameToolArray(e)
            this.scheduleOnce(function() {
            this.executePassEffect()
            }, 1) 
        }else{
            setTimeout(function() {
                this.showTournament();
            }.bind(this), 1000)
        }
        cc.director.isrunning || this.whichTimeTampRow("executepasseffect")
    },
    showTournament() {
        try {               
            var _this = this;
            if (cc.director.FbManager.IS_FB_INSTANT) {     
                cc.systemEvent.emit("LOADING_SHOW")
                if(gameData.tournamentData){
                    FBInstant.getTournamentAsync().then(function(tournament) {
                        FBInstant.tournament.shareAsync({
                            score: gameData.currScore,
                            data: {
                                tournament: {
                                    ref: "User create",
                                    time: new Date(),
                                    level:  _this.currentLevel
                                }
                            }
                        }).then(function() {
                            var end1 = (new Date()).getTime();           
                            cc.systemEvent.emit("LOADDING_HIDE");
                            _this.showAdsAfterTournament()
                            cc.director.dialogScript.showResultPromptView(_this.list)
                            cc.log("share ok!")
                        }).catch((err) => {
                            cc.systemEvent.emit("LOADDING_HIDE");
                            _this.showAdsAfterTournament()
                            cc.director.dialogScript.showResultPromptView(_this.list)
                            cc.log(err)
                        })
                    }).catch((err)=>{                  
                        cc.systemEvent.emit("LOADDING_HIDE");
                        _this.showAdsAfterTournament()
                        cc.director.dialogScript.showResultPromptView(_this.list)          
                    })
                }else{
                    cc.log("create tournament")
                    FBInstant.tournament.createAsync({
                        initialScore: gameData.currScore,
                        config: {
                            title: "Blast"
                        },
                        data: {
                            tournament: {
                                ref: "User create",
                                time: new Date(),
                                level:  _this.currentLevel
                            }
                        },
                    }).then(function(tournament) {
                        cc.systemEvent.emit("LOADDING_HIDE");
                        _this.showAdsAfterTournament()
                        cc.director.dialogScript.showResultPromptView(_this.list)
                    }).catch(function(error) {
                        cc.systemEvent.emit("LOADDING_HIDE");
                        _this.showAdsAfterTournament()
                        cc.director.dialogScript.showResultPromptView(_this.list)
                        cc.log(error)
                    })
                }
            } else {
                cc.director.dialogScript.showResultPromptView(this.list)
            }    
        } catch (error) {
            cc.log(error)
            cc.systemEvent.emit("LOADDING_HIDE");
            cc.director.dialogScript.showResultPromptView(this.list)
        }   
    },
    showAdsAfterTournament(){
        var _this = this
        this.scheduleOnce(function() {
            if (!gameData.isBegin && cc.director.FbManager.FBcanShow()) {
                cc.audioEngine.pauseAll();
                cc.director.FbManager.FBpreloadedInterstitial.showAsync().then(function() {
                    cc.log('Interstitial ad 1 finished successfully');
                }).catch(function(error) {
                    cc.log(error)
                }).finally(function() {
                    cc.log("finally")
                    cc.audioEngine.resumeAll();
                    cc.director.FbManager.resetAds()
                })
            }
        }, 0.3) 
    },

    update(dt){
        if (this.shouldVibrate) {
            var pos = this.node.parent.getPosition();
            if(this.previousMovedVector){
                pos.subSelf(this.previousMovedVector)
            }
            this.previousMovedVector = undefined
            this.elapsed += 1000 * dt
            if( this.elapsed < this.duration){
                this.previousMovedVector = this.getRandomUnitSphere().multiplyScalar(this.force)
                pos.addSelf(this.previousMovedVector)
            }else{
                this.shouldVibrate = !1
            }
            this.node.parent.setPosition(pos)
        }
    },
    vibrate(vibrateForce, vibrateDuration) {
        if(!this.shouldVibrate ){
            this.shouldVibrate = true
            this.force = vibrateForce
            this.duration = vibrateDuration
            this.elapsed = 0
        }
    },
    getRandomUnitSphere() {
        return new cc.Vec2(Math.random(),Math.random()).normalizeSelf()
    },
    addGameToolToContainer: function(e, t) { 
        for (var n = this, a = !1, o = 0; o < e.length; o++){
            if (e[o] > 0) {
                a = !0;
                break
            }
        }
        if (e.length <= 0 || !a){
            return cc.systemEvent.emit("GAMEMASK_CONTROL", {
                order: 2
            }),
            this.guideNode.active = true;
        }
        var c = utils.getRandomBlockPosition(gameData.starMatrix, 3);
        this.isMoving = !0;
        for (var r = function(i) {
            n.scheduleOnce(function() {
                if (e[i] > 0) {
                    var n = e[i];
                    t || (gameData.gameToolList[i] -= n);
                    var a = this.getNodeBygGrid(c[i])
                      , o = a.node;
                    o.scale = 1.2,
                    o.runAction(cc.scaleTo(.5, 1)),
                    this.toolAndSuperToolEffect(c[i]),
                    gameData.starMatrix[c[i].x][c[i].y] = 8 + i,
                    a.changeStoneNum(8 + i),
                    e[i] = 0
                    cc.director.SoundManager.playSound("choosed_voice")
                }
                i == e.length - 1 && (this.handleCanCombineTool(),
                this.target.isPass || cc.systemEvent.emit("GAMEMASK_CONTROL", {
                    order: 2
                })/*
                /* cc.log("sadasdasdasd","STOP_TOUCH"),
                cc.systemEvent.emit("STOP_TOUCH", {
                    number: 1
                })*/
                ) 
            }, 1 * i)
        }, d = 0; d < e.length; d++)
            r(d)
    },

    startNewGame: function() {
        if(gameData.tournamentData){
            this.currentLevel = gameData.tournamentData.level
            cc.log("start game level: ", gameData.tournamentData.level + 1)
        }else{
            cc.log("start game level: ", gameData.bestLevel + 1)
            this.currentLevel = gameData.bestLevel
        }
        
        var mapList, levelResource, step, targetList, c, r, d;
        cc.game.GameMoveStatus = 0
        cc.game.windmillCount = 0
        this.canclePlayerNotice()
        cc.director.isPine = 0
        cc.director.checkLastPine = 0
        if ( this.currentLevel >= 0 &&  this.currentLevel <= 300){
            levelResource = newLevelResource[this.currentLevel]
            mapList = JSON.parse(JSON.stringify(levelResource.mapList))
            gameData.starMatrix = mapList
            this.list = levelResource.targetList
            step = levelResource.step;
        }else {
            if (!this.hinderList) {
                targetList = this.createRandomTargetList();
                var hinderList = this.createHinderList(targetList)
                var h = utils.initMatrixDataPortraitRandom()
                var p = utils.addHinder(h, hinderList[0], -2);
                utils.addHinder(h, hinderList[1], 20)
                p = utils.addHinder(h, hinderList[2], 21)
                this.hinderList = p
                this.list = targetList
                step = this.createStep()
                this.tempStep = step
            }
            mapList = JSON.parse(JSON.stringify(this.hinderList))
            targetListo = this.list
            gameData.starMatrix = mapList
            step = this.tempStep
            levelResource = {}
        }
        cc.director.isMoving = !1
        this.progressBar.initProgressBar()
        this.initContainerView(mapList)
        this.bgPrompt.initBgPrompt(gameData.starMatrix)
        this.target.resumeGameStatues()
        this.target.updateNodeTag(this.list, step)
        c = levelResource.grassList
        r = levelResource.stoneList
        d = levelResource.bubbleList
        c && r && this.grassGround.initFunc(c, r)
        d && this.bubbleGround.initFunc(d)
        gameData.bestLevel > 0 && this.showTipsView()
        cc.director.dialogScript.goalDisplay.initGoalNumber(this.list)
        cc.director.videoCount = 1
        this.handleCanCombineTool()
        cc.systemEvent.emit("GAMEMASK_CONTROL", {
            order: 1
        })
    },
    createRandomTargetList: function() {
        var e, t = [0, 1, 2, 3, 4, 5, 20, 21], i = [], n = [];
        for (e =  this.currentLevel >= 60 ? 4 : 3; i.length < e; ) {
            var a = []
              , o = Math.floor(Math.random() * t.length);
            if (!this.isContain(n, o)) {
                n.push(o);
                var c = 15 + Math.floor(Math.random() * t.length);
                a[0] = t[o],
                a[1] = t[o] >= 4 ? c - 10 : c,
                i.push(a)
            }
        }
        return i.sort(function(e, t) {
            return e[0] - t[0]
        }),
        i
    },
    createHinderList: function(e) {
        var arr = [12, 0, 0], count = 20
        for (var i = 1; i < 3; i++) {
            var n = -1
            for (var j = 0; j < e.length; j++){
                if (e[j][0] == count) {
                    n = j;
                    break
                }
            }
            n >= 0 && (arr[i] = e[n][1]),
            count++
        }
        return arr
    },
    createStep: function() {
        return 35 + Math.floor(15 * Math.random())
    },
    isContain: function(e, t) {
        for (var i = !1, s = 0; s < e.length; s++)
            if (t == e[s]) {
                i = !0;
                break
            }
        return i
    },
    col_rocket: function(e) {
        var t, i;
        t = this.rockPool.size() > 0 ? this.rockPool.get() : cc.instantiate(this.rock),
        i = this.rockPool.size() > 0 ? this.rockPool.get() : cc.instantiate(this.rock),
        this.rocketEffect(t, e, 1, -90),
        this.rocketEffect(i, e, -1, 90)
        cc.director.SoundManager.playSound("rocket")
    },
    row_rocket: function(e) {
        var t, i;
        t = this.rockPool.size() > 0 ? this.rockPool.get() : cc.instantiate(this.rock),
        i = this.rockPool.size() > 0 ? this.rockPool.get() : cc.instantiate(this.rock),
        this.rocketEffect(t, e, 2, 0),
        this.rocketEffect(i, e, -2, 180)
        cc.director.SoundManager.playSound("rocket")
    },
    rocketEffect: function(e, t, s, a) {
        var o, c = utils.grid2Pos(t.x, t.y);
        this.vibrate(15, 200)
        e.position = c,
        e.angle = -a,
        e.parent = this.node;
        var r = cc.sequence(cc.moveTo(.5, cc.v2(c.x, c.y + 800 * s)), cc.callFunc(function() {
            e.removeFromParent()
        }))
          , d = cc.sequence(cc.moveTo(.5, cc.v2(c.x + 400 * s, c.y)), cc.callFunc(function() {
            e.removeFromParent()
        }));
        1 == Math.abs(s) ? (e.runAction(r),
        1 == s && (o = this.getRemovePositionList(t, psconfig.direction.UP, 1),
        e.getComponent("rocket").setRocketPosition(t, psconfig.direction.UP, o)),
        -1 == s && (o = this.getRemovePositionList(t, psconfig.direction.DOWN, 1),
        e.getComponent("rocket").setRocketPosition(t, psconfig.direction.DOWN, o))) : (e.runAction(d),
        2 == s && (o = this.getRemovePositionList(t, psconfig.direction.RIGHT, 2),
        e.getComponent("rocket").setRocketPosition(t, psconfig.direction.RIGHT, o)),
        -2 == s && (o = this.getRemovePositionList(t, psconfig.direction.LEFT, 2),
        e.getComponent("rocket").setRocketPosition(t, psconfig.direction.LEFT, o)))
    },
    removeRocketAcrossData: function(e, t) {
        var i = this
          , a = e.x
          , o = e.y;
        if (t == psconfig.direction.UP)
            for (var c = function(e) {
                i.scheduleOnce(function() {
                    if (gameData.starMatrix[e][o] >= 0) {
                        var t = cc.v2(e, o);
                        this.handleSingleGrid(t)
                    }
                }, .05 * Math.abs(e - a))
            }, r = a; r < psconfig.matrixRow; r++)
                c(r);
        if (t == psconfig.direction.DOWN)
            for (var d = function(e) {
                i.scheduleOnce(function() {
                    if (gameData.starMatrix[e][o] >= 0) {
                        var t = cc.v2(e, o);
                        this.handleSingleGrid(t)
                    }
                }, .05 * Math.abs(e - a))
            }, l = a; l >= 0; l--)
                d(l);
        if (t == psconfig.direction.LEFT)
            for (var h = function(e) {
                i.scheduleOnce(function() {
                    if (gameData.starMatrix[a][e] >= 0) {
                        var t = cc.v2(a, e);
                        this.handleSingleGrid(t)
                    }
                }, .05 * Math.abs(e - o))
            }, p = o; p >= 0; p--)
                h(p);
        if (t == psconfig.direction.RIGHT)
            for (var m = function(e) {
                i.scheduleOnce(function() {
                    if (gameData.starMatrix[a][e] >= 0) {
                        var t = cc.v2(a, e);
                        this.handleSingleGrid(t)
                    }
                }, .05 * Math.abs(e - o))
            }, u = o; u < psconfig.matrixCol; u++)
                m(u)
    },
    getRemovePositionList: function(e, t, a) {
        var o = []
          , c = e.x
          , r = e.y;
        if (1 == a) {
            if (t == psconfig.direction.UP)
                for (var d = c; d < psconfig.matrixRow; d++) {
                    var l = utils.grid2Pos(d, r);
                    if (gameData.starMatrix[d][r] >= 0) {
                        var h = {};
                        h.grid = cc.v2(d, r),
                        h.position = l,
                        o.push(h)
                    }
                }
            else if (t == psconfig.direction.DOWN)
                for (var p = c; p >= 0; p--) {
                    var m = utils.grid2Pos(p, r);
                    if (gameData.starMatrix[p][r] >= 0) {
                        var u = {};
                        u.grid = cc.v2(p, r),
                        u.position = m,
                        o.push(u)
                    }
                }
        } else if (2 == a)
            if (t == psconfig.direction.LEFT)
                for (var g = r; g >= 0; g--) {
                    var f = utils.grid2Pos(c, g);
                    if (gameData.starMatrix[c][g] >= 0) {
                        var v = {};
                        v.grid = cc.v2(c, g),
                        v.position = f,
                        o.push(v)
                    }
                }
            else if (t == psconfig.direction.RIGHT)
                for (var L = r; L < psconfig.matrixCol; L++) {
                    var S = utils.grid2Pos(c, L);
                    if (gameData.starMatrix[c][L] >= 0) {
                        var y = {};
                        y.grid = cc.v2(c, L),
                        y.position = S,
                        o.push(y)
                    }
                }
        return o.length > 0 && o
    },
    boxingAndAnvil: function(e) {
        var t, s, a, o = e.grid, c = e.node, r = e.dir;
        c.parent = this.node,
        r == psconfig.direction.RIGHT && (c.position = utils.grid2Pos(o.x, 0),
        t = cc.v2(o.x, -1),
        s = this.getRemovePositionList(t, r, 2),
        c.getComponent("rocket").setRocketPosition(t, r, s),
        a = utils.grid2Pos(o.x, 10),
        c.runAction(cc.sequence(cc.moveTo(.5, a), cc.callFunc(function() {
            cc.systemEvent.emit("player_tool", {
                type: 1
            }),
            c.removeFromParent(),
            cc.systemEvent.emit("CLEAR_BTN"),
            cc.systemEvent.emit("FUNCTION_EXPLAIN_OFF")
        })))),
        r == psconfig.direction.DOWN && (c.position = utils.grid2Pos(10, o.y),
        t = cc.v2(8, o.y),
        s = this.getRemovePositionList(t, r, 1),
        c.getComponent("rocket").setRocketPosition(t, r, s),
        a = utils.grid2Pos(-1, o.y),
        c.runAction(cc.sequence(cc.moveTo(.5, a), cc.callFunc(function() {
            cc.systemEvent.emit("player_tool", {
                type: 2
            }),
            c.removeFromParent(),
            cc.systemEvent.emit("CLEAR_BTN"),
            cc.systemEvent.emit("FUNCTION_EXPLAIN_OFF")
        }))))
    },
    handleSingleGrid: function(e) {
        var t = utils.indexValue(e.x, e.y);
        if (null != gameData.starSprite[t]) {
            var a = this.getNodeBygGrid(e);
            if (21 == a._stoneType){
                cc.director.container.balloonBoomEffect(e),
                cc.director.container.removeBlock(e);
            }else if (a._stoneType >= 0 && a._stoneType < psconfig.rType){
                //cc.director.container.removeBlock(e),
                //cc.director.container.effectRemoveCol(e);
                cc.director.container.normalCubeBreakAnimation(e)
                cc.director.container.removeBlock(e)
            }else if (8 == a._stoneType){
                0 == a.rocketType ? (cc.director.container.removeBlock(e),
                cc.director.container.col_rocket(e)) : (cc.director.container.removeBlock(e),
                cc.director.container.row_rocket(e));
            }else if (9 == a._stoneType) {
                var o = {
                    index: a._stoneType,
                    type: a.discoType,
                    grid: e,
                    from: 1
                };
                cc.systemEvent.emit("GAME_TOOL", {
                    detail: o
                })
            } else if (10 == a._stoneType) {
                if (a.isEffect)
                    return void (a.isEffect = !1);
                a.isEffect = !0;
                var c = {
                    index: a._stoneType,
                    type: a.discoType,
                    grid: e,
                    from: 1
                };
                cc.systemEvent.emit("GAME_TOOL", {
                    detail: c
                })
            } else{
                22 == a._stoneType ? (
                    a.bombRatio--,
                    a.cubesUnlock(),
                    cc.director.container.vineBreakEffect(e)
                ) : 23 == a._stoneType || 24 == a._stoneType || 25 == a._stoneType ? (
                    a.bombRatio--,
                    a.bombRatio <= 0 ? (cc.director.container.woodCubeBreakEffect(e),
                    cc.director.container.removeBlock(e),
                    a.boxCubesDisappear()) : (a.boxHit(),
                    cc.director.container.woodBoxBreakEffect(e))
                ) : 26 == a._stoneType ? (
                    a.bombRatio--,
                    a.bombRatio < 0 ? (cc.director.container.flowerCollectAnimation(e),
                    a.collectFlower()) : (a.flowerHit(),
                    cc.director.container.flowerOpenEffect(e))
                ) : 27 == a._stoneType ? (
                    a.bombRatio--,
                    a.bombRatio <= 0 ? cc.director.container.windmillDisappearEffect(e) : (a.hitWindmill(),
                    cc.director.container.windmillBreakEffect(e, a.bombRatio))
                ) : a._stoneType >= 29 && a._stoneType <= 36 ? (
                    a.bombRatio--,
                    a.bombRatio <= 0 && (cc.director.container.colorCubeBreakEffect(e),
                    cc.director.container.removeBlock(e),
                    a.boxCubesDisappear())
                ) : 37 == a._stoneType ? (
                    a.bombRatio--,
                    a.bombRatio <= 0 ? this.ladyBugCubesBreakEffect(e, a.bombRatio) : (this.ladyBugCubesBreakEffect(e, a.bombRatio),
                    a.hitLadyBugCubes())
                ) : 39 == a._stoneType && (
                    a.bombRatio--,
                    a.bombRatio <= 0 && (cc.director.container.rockStoneCubeBreakEffect(e),
                    cc.director.container.removeBlock(e),
                    a.boxCubesDisappear())
                )
            }
        }
    },
    handleGameToolArray: function(e) {
        var t = gameData.getDataBygrid(e)
          , a = this.getNodeBygGrid(e);
        if (t < psconfig.rType){
            //this.effectRemoveCol(e),
            this.normalCubeBreakAnimation(e)
            this.removeBlock(e);
        }else if (t == psconfig.rType){
            0 == a.rocketType && this.col_rocket(e),
            1 == a.rocketType && this.row_rocket(e);
        }else if (t == psconfig.bType) {
            var o = utils.rainbowStarRemoveList(gameData.starMatrix, e);
            cc.director.SoundManager.playSound("boom1"),
            this.removeBombBlockOnly(o)
        } else if (t == psconfig.dType) {
            var c = utils.getSameBlockList(gameData.starMatrix, e)
              , r = this.judgeDiscoType(c);
            this.discoRotation(e);
            var d = utils.getSameBlockList(gameData.starMatrix, e, r)
              , l = JSON.parse(JSON.stringify(d));
            this.effectRemoveSame(e, d, l, this.removeSameColorBlock)
        } else
            21 == t ? (
                this.effectRemoveCol(e),
                this.removeBlock(e)
            ) : 22 == t ? (
                a.bombRatio--,
                a.cubesUnlock(),
                this.vineBreakEffect(e)
            ) : 23 == t || 24 == t || 25 == t ? (a.bombRatio--,
            a.bombRatio <= 0 ? (this.woodCubeBreakEffect(e),
            this.removeBlock(e),
            a.boxCubesDisappear()) : (a.boxHit(),
            2 == a.bombRatio ? this.woodBoxBreakEffect(e, 2) : this.woodBoxBreakEffect(e, 1))) : 26 == t ? (a.bombRatio--,
            a.bombRatio < 0 ? (this.flowerCollectAnimation(e),
            a.collectFlower()) : (a.flowerHit(),
            this.flowerOpenEffect(e))) : 27 == a._stoneType ? (a.bombRatio--,
            a.bombRatio <= 0 ? this.windmillDisappearEffect(e) : (a.hitWindmill(),
            this.windmillBreakEffect(e, a.bombRatio))) : a._stoneType >= 29 && a._stoneType <= 36 ? (a.bombRatio--,
            a.bombRatio <= 0 && (this.colorCubeBreakEffect(e),
            this.removeBlock(e),
            a.boxCubesDisappear())) : 37 == a._stoneType ? (a.bombRatio--,
            a.bombRatio <= 0 ? this.ladyBugCubesBreakEffect(e, a.bombRatio) : (this.ladyBugCubesBreakEffect(e, a.bombRatio),
            a.hitLadyBugCubes())) : 39 == a._stoneType && (a.bombRatio--,
            a.bombRatio <= 0 && (cc.director.container.rockStoneCubeBreakEffect(e),
            cc.director.container.removeBlock(e),
            a.boxCubesDisappear()))
    },
    removeBlockOnly: function(e) {
        for (var t = e.length - 1; t >= 0; t--) {
            var i = e[t]
              , n = gameData.starMatrix[i.x][i.y]
              , a = this.getNodeBygGrid(i);
            -2 != n && n < 22 ? this.removeBlock(i) : 22 == n ? (a.bombRatio--,
            a.cubesUnlock()) : 23 == n || 24 == n || 25 == n ? (a.bombRatio--,
            a.bombRatio <= 0 ? (this.woodCubeBreakEffect(i),
            this.removeBlock(i),
            a.boxCubesDisappear()) : (a.boxHit(),
            2 == a.bombRatio ? this.woodBoxBreakEffect(i, 2) : this.woodBoxBreakEffect(i, 1))) : 26 == n ? (a.bombRatio--,
            a.bombRatio < 0 ? (this.flowerCollectAnimation(i),
            a.collectFlower()) : (a.flowerHit(),
            this.flowerOpenEffect(i))) : 27 == n ? (a.bombRatio--,
            a.bombRatio <= 0 ? (this.removeBlock(i),
            a.collectFlower()) : (a.hitWindmill(),
            this.windmillBreakEffect(i, a.bombRatio))) : a._stoneType >= 29 && a._stoneType <= 36 ? (a.bombRatio--,
            a.bombRatio <= 0 && (this.colorCubeBreakEffect(i),
            this.removeBlock(i),
            a.boxCubesDisappear())) : 37 == a._stoneType ? (a.bombRatio--,
            a.bombRatio <= 0 ? this.ladyBugCubesBreakEffect(i, a.bombRatio) : (this.ladyBugCubesBreakEffect(i, a.bombRatio),
            a.hitLadyBugCubes())) : 39 == a._stoneType && (a.bombRatio--,
            a.bombRatio <= 0 && (cc.director.container.rockStoneCubeBreakEffect(i),
            cc.director.container.removeBlock(i),
            a.boxCubesDisappear()))
        }
        this.scheduleOnce(function() {
            cc.director.isrunning || this.whichTimeTampRow("removeNineBlock2")
        }, .5)
    },
    whichTimeTampRow: function() {
        var e = this.node.getChildByName("rock")
          , t = this.node.getChildByName("line");
        e || t || cc.director.needWait ? (cc.director.isrunning = 1,
        this.scheduleOnce(function() {
            this.whichTimeTampRow("\u9012\u5f52")
        }, .2)) : (this.tampRows(),
        cc.director.isrunning = 0,
        this.tempPos && (this.tempPos = null),
        this.tempLadyBugList && (this.tempLadyBugList = null),
        this.flowerTempList && (this.flowerTempList = null))
    },
    noticeWhichCubesCombine: function() {
        var e = utils.noticeLongestList(gameData.starMatrix);
        if (e)
            for (var t = 0; t < e.length; t++) {
                var n = e[t]
                  , a = utils.indexValue(n.x, n.y)
                  , o = gameData.starSprite[a];
                if (this.noticeList.push(o),
                o) {
                    o.zIndex = 1,
                    o.getChildByName("outLine").active = !0;
                    var c = cc.sequence(cc.scaleTo(.5, .95), cc.scaleTo(1, 1.05), cc.scaleTo(.5, 1)).repeatForever();
                    c.tag = 10,
                    o.runAction(c)
                }
            }
    },
    noticePlayerTimeCount: function() {
        this.noticeCount > 0 && (this.noticeCount--,
        0 == this.noticeCount && (this.unschedule(this.noticePlayerTimeCount),
        this.noticeWhichCubesCombine()))
    },
    canclePlayerNotice: function() {
        if (this.noticeList && this.noticeList.length > 0){
            for (var e = 0; e < this.noticeList.length; e++) {
                var t = this.noticeList[e];
                t && (t.getChildByName("outLine").active = !1,
                t.stopActionByTag(10),
                t.scale = 1,
                t.zIndex = 0)
            }
        }
        this.noticeList = []
        this.noticeCount = 5
        cc.director.getScheduler().isScheduled(this.noticePlayerTimeCount, this) || this.target.isGameEnd ? this.target.isGameEnd && this.unschedule(this.noticePlayerTimeCount) : this.schedule(this.noticePlayerTimeCount, 1)
    },
    judgeGameMoveStatus: function() {
        return !(cc.game.GameMoveStatus > 0)
    },
    addGameMoveStatus: function() {
        "number" == typeof cc.game.GameMoveStatus && cc.game.GameMoveStatus++
    },
    reduceGameMoveStatus: function() {
        cc.game.GameMoveStatus > 0 && cc.game.GameMoveStatus--
    },
    test_addLevel: function() {     
        gameData.bestLevel++
        cc.log("best level", gameData.bestLevel)
        this.startNewGame()

        //this.vibrate(15, 100)
        //boom 10 70 
        ///7 10
        ///7 70
    },
    test_reduceLevel: function() {
        gameData.bestLevel--,
        this.startNewGame()
    },
    
});
