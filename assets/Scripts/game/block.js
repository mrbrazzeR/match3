import utils  from "../utils"
import gameData from "../gameData"
import psconfig from "../psconfig"
cc.Class({
    extends: cc.Component,

    properties: {
        outLine: cc.Node,
        temp: cc.Node,
        view: cc.Node,
        tips: cc.Node,
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
        subsList: [cc.SpriteFrame],
        rocketList: [cc.SpriteFrame],
        discoList: [cc.SpriteFrame],
        hinderView: [cc.SpriteFrame],
        tipsView: [cc.SpriteFrame],
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
        toolAnima: cc.Node,
        toolCombine: cc.Node
    },

    initStoneView: function(x, y, type, s) {
        this.node.scale = 1
        this.changeStoneGrid(x, y)
        this.changeStoneNum(type, s)  
        this.node.getChildByName("lbIndex").getComponent(cc.Label).string = this.node.zIndex
    },
    changeStoneGrid: function(x, y) {
        this._xPos = x
        this._yPos = y
        if(this._stoneType != 26 && this._stoneType != 27){
            this.node.zIndex = x        
        }
        this.node.getChildByName("lbIndex").getComponent(cc.Label).string = this.node.zIndex
    },
    changeStoneNum: function(type, discoType) {
        this._stoneType = type;
        if (type >= 0) {
            this.tips.active = false
            this._stoneNum = Math.pow(2, this._stoneType + 1);
            if (type == psconfig.rType) {// Rocket type          
                this.rocketType = this.randomCreateRocketType();
                this.view.getComponent(cc.Sprite).spriteFrame = this.rocketList[this.rocketType];
            } else if (type == psconfig.dType) {// Disco type             
                this.discoType = discoType <= 5 ? discoType : this.randomCreateDiscoType();
                this.view.getComponent(cc.Sprite).spriteFrame = this.discoList[this.discoType];
                this.view.active = false;
                this.playToolAnima(3);
            } else if (type == psconfig.bType) {//Boom type
                this.view.active = false;
                this.playToolAnima(2);
            } else if (type >= 20) {
                // Various special types
                if (type == 22) {
                    // Vine type
                    this.lock_func.active = true;
                    this.lock_func.getComponent(cc.Sprite).spriteFrame = this.vine;
                    this.nextType = this.randomCreateDiscoType();
                    this.bombRatio = 1;
                    this.view.getComponent(cc.Sprite).spriteFrame = this.viewList[this.nextType];
                } else if (type >= 23 && type <= 25) {
                    // Box cubes types
                    if (type == 23) this.initBoxCubesData(3);
                    if (type == 24) this.initBoxCubesData(2);
                    if (type == 25) this.initBoxCubesData(1);
                } else if (type == 26) {
                    // Flower cubes type
                    this.initFlowerCubesData();
                } else if (type == 27) {
                    // Windmill type
                    this.initWindmill(3);
                } else if (type >= 29 && type <= 36) {
                    // Colorful cubes types
                    this.initColorfulCubes(1, type - 29);
                } else if (type == 37) {
                    // Ladybug cubes type
                    this.initLadyBugCubes(3);
                } else if (type == 39) {
                    // Rock stone type
                    this.initRockStone(1);
                }else if (type == 42) {
                    // Rock stone type
                    this.initBag();
                }else {
                    // Hinder view for other special types
                    this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[type - 20];
                }
            } else {
                // Default case for other types
                this.view.getComponent(cc.Sprite).spriteFrame = this.viewList[type];
                if(type < 6){
                    this.tips.active = true
                    this.tips.getComponent(cc.Sprite).spriteFrame = this.subsList[type]
                }else{
                    this.tips.active = false
                }
            }
        } else {
            // If the stone type is invalid, set the sprite frame to null
            this.view.getComponent(cc.Sprite).spriteFrame = null;
            this.tips.getComponent(cc.Sprite).spriteFrame = null;
        }
    },
    updateTipsView: function(type) {
        if(type < 6){
            this.tips.active = true
            this.tips.getComponent(cc.Sprite).spriteFrame = this.tipsView[type]
        }else{
            this.tips.active = false
        }
        
    },
    originView: function() {
        this.view.getComponent(cc.Sprite).spriteFrame = this.viewList[this._stoneType]
        if(this._stoneType < 6){
            this.tips.active = true
            this.tips.getComponent(cc.Sprite).spriteFrame = this.subsList[this._stoneType]
        }else{
            this.tips.active = false
        }
    },
    
    cubesUnlock: function() {
        if(this.bombRatio <= 0){
            this.bombRatio = -1
            this.lock_func.active = false
            gameData.starMatrix[this._xPos][this._yPos] = this.nextType
            this.changeStoneNum(this.nextType)
            this.nextType = -1
        }
    },
    boxCubesDisappear: function() {
        this.bombRatio = -1
        gameData.starMatrix[this._xPos][this._yPos] = -1
        this.node.removeFromParent()
    },
    blockDataReset: function() {
        this.bombRatio = -1
        gameData.starMatrix[this._xPos][this._yPos] = -1
    },
    boxHit: function() {
        if(this.bombRatio > 0){
            this.lock_func.getComponent(cc.Sprite).spriteFrame = this.boxCubesHitView[this.bombRatio - 2]
        }else if(0 == this.bombRatio){
            this.lock_func.active = false           
        }
        this.cubeRotation(this.node, 1003)
    },
    initBoxCubesData: function(e) {
        this.bombRatio = e
        this.lock_func.active = true
        if(e - 2 < 0){
            this.lock_func.active = false
        }else{ 
            this.lock_func.getComponent(cc.Sprite).spriteFrame = this.boxCubesHitView[this.bombRatio - 2]
        }
        this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[3]
    },
    initFlowerCubesData: function() {
        this.view.active = false
        this.flower.active = true
        this.lock_func.active = false
        this.plant.getChildByName("petal").active = false
        this.bombRatio = 4
        this.node.zIndex = 100;
    },
    flowerHit: function() {
        var _this = this
        var t = this.plant.getChildByName("petal");
        t.active = true
        t.stopActionByTag(1002);
        var i = "item" + (4 - this.bombRatio)
        var s = t.getChildByName(i);
        this.node.zIndex = 200;
        cc.log("ssssssssssssssssssss")
        var action = cc.sequence(
            cc.sequence(cc.scaleTo(0.2, 0.8), cc.scaleTo(0.2, 1.2)).repeat(2),
            cc.scaleTo(0.15, 1.5).easing(cc.easeBackOut(3)),
            cc.rotateBy(0.3, 90),
            cc.spawn(cc.scaleTo(0.25, 1).easing(cc.easeBackOut(3)), 
            cc.callFunc(function() {
                s.active = true
                _this.node.zIndex = 100
            })
        ));
        action.tag = 1002
        this.plant.runAction(action)
    },
    collectFlower: function() {
        this.bombRatio = -1
        gameData.starMatrix[this._xPos][this._yPos] = -1
        this.node.removeFromParent()
    },
    initWindmill: function(e) {
        this.node.zIndex = 100
        this.bombRatio = e
        this.lock_func.active = true
        if(e - 2 < 0){
            this.lock_func.active = false
        }else{
            this.lock_func.getComponent(cc.Sprite).spriteFrame = this.windmillNetView[this.bombRatio - 2]
        }
        this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[4]
    },
    hitWindmill: function() {
        if(this.bombRatio > 0){
            this.lock_func.getComponent(cc.Sprite).spriteFrame = this.windmillNetView[this.bombRatio - 2]
            if(1 == this.bombRatio){
                this.windmillOutlineLight.active = true
                this.node.zIndex = 200
                this.node.runAction(cc.rotateBy(5, 360).repeatForever())
                if(59 == gameData.bestLevel){
                    if(!gameData.guide_step.eleven_step) {
                        cc.systemEvent.emit("WINDMILL_SECOND_GUIDE", {
                            windmillList: [cc.v2(this._xPos, this._yPos)]
                        })
                    }
                }
            }else{
                this.windmillRotation(this.view, 1002)
            }
        }else if(0 == this.bombRatio){
            this.lock_func.active = false
        }
    },
    windmillRotation: function(e, t) {
        e.stopActionByTag(t);
        var i = cc.rotateBy(1, 360);
        i.tag = t
        e.runAction(i)
    },
    initLockAvarta: function() {
        this.bombRatio = 10
        this.lock_func.active = false
        this.view.getComponent(cc.Sprite).spriteFrame = null
    },
    initColorfulCubes: function(e, t) {
        this.bombRatio = e
        this.nextType = t
        this.lock_func.active = false
        if("number" == typeof this.nextType){
            this.view.getComponent(cc.Sprite).spriteFrame = this.colorCubeViewList[this.nextType]
        }
    },
    initLadyBugCubes: function(e) {
        this.bombRatio = e
        this.lock_func.active = false
        this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[5]
        this.temp.active = true;
        var ladyBug = cc.instantiate(this.ladyBug);
        ladyBug.parent = this.temp
        ladyBug.getComponent(cc.Animation).play("ladyBugChaos")
    },
    initRockStone: function(e) {
        this.bombRatio = e
        this.lock_func.active = false
        this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[6]
    },
    initBag(){
        this.bombRatio = 9999999
        this.lock_func.active = false
        this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[7]
    },
    hitLadyBugCubes: function() {
        cc.director.SoundManager.playSound("glassBallBreak")
        this.view.getComponent(cc.Sprite).spriteFrame = this.ladyBugBubbleView[this.bombRatio - 1]
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
   
    nodeRotation: function(e, t) {
        var i = this
        var s = cc.sequence(cc.sequence(cc.rotateBy(.05, 20), cc.rotateBy(.05, -20)).repeat(2), cc.callFunc(function() {
            i.node.angle = -0
        }));
        s.tag = t
        e.runAction(s)
    },
    cubeRotation: function(e, t) {
        var i = cc.sequence(
            cc.spawn(cc.sequence(cc.rotateBy(0.05, 20), cc.rotateBy(.05, -20)).repeat(2), cc.scaleTo(0.2, 1.2)), 
            cc.scaleTo(0.2, 1), 
            cc.callFunc(function() {
                e.angle = -0
            })
        );
        i.tag = t
        e.runAction(i)
    },
    onTouchStart: function() {
        if (!(cc.director.isMoving || cc.director.container.target.stepCount <= 0 || cc.director.isrunning))
            if(this._stoneType != -2 &&  this._stoneType != -1)  {
                cc.director.SoundManager.playSound("tap")
            }
            if (this._stoneType < psconfig.rType) { //< 8
                cc.director.isMoving = true;
                var pos = cc.v2(this._xPos, this._yPos)            
                if (cc.director.toolType > 0) {
                    if (this._stoneType == -2){
                        return void (cc.director.isMoving = false);
                    }
                    var toolType = cc.director.toolType
                    var wp = this.node.parent.convertToWorldSpaceAR(utils.grid2Pos(pos.x, pos.y));
                    cc.systemEvent.emit("TOOL_TRANS_EFFECT", {
                        type: toolType,
                        grid: pos,
                        wp: wp
                    })
                } else{
                    var needRemoveList = utils.needRemoveList(gameData.starMatrix, pos);
                    if(needRemoveList.length > 1){
                        cc.systemEvent.emit("REMOVE_CUBES", {
                            detail: needRemoveList
                        })
                    }else{
                        this.nodeRotation(this.node, 2)
                        cc.director.isMoving = false
                        utils.getItemAdjacentPos(pos)
                        if(this._stoneType != -2 && this._stoneType != -1){
                            cc.director.SoundManager.playSound("noCombine")
                        }
                    }
                  
                }
            } else {
                if (cc.director.toolType > 0) {
                    if (cc.director.toolType <= 3) {
                        if (this._stoneType >= 8 && this._stoneType <= 10 || 3 == cc.director.toolType && 20 == this._stoneType){
                            return;
                        }
                        var toolType = cc.director.toolType
                        var pos = cc.v2(this._xPos, this._yPos)
                        var wp = this.node.parent.convertToWorldSpaceAR(utils.grid2Pos(pos.x, pos.y));
                        cc.systemEvent.emit("TOOL_TRANS_EFFECT", {
                            type: toolType,
                            grid: pos,
                            wp: wp
                        })
                    }
                    return;
                }
                if (this._stoneType >= 20){
                    this.nodeRotation(this.node, 3)
                    cc.director.isMoving = false
                    cc.director.SoundManager.playSound("noCombine");
                }else {
                    var type;
                    cc.systemEvent.emit("STEP_COUNT")
                    if(this._stoneType == psconfig.rType){
                        type = this.rocketType
                    }else if(this._stoneType == psconfig.dType){
                        type = this.discoType
                    }
                    var obj = {
                        index: this._stoneType,
                        type: type,
                        grid: cc.v2(this._xPos, this._yPos)
                    };
                    cc.systemEvent.emit("GAME_TOOL", {
                        detail: obj
                    })
                }
            }
    },
    unuse: function() { //bỏ sử dụng
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchStart, this)
        this.node.stopAllActions()
        this.node.angle = -0
        this._stoneType = -1
        this.outLine.active = false
        this.lock_func.active = false
        this.windmillOutlineLight.active = false

        this.toolAnima.active = false
        this.toolAnima.getChildByName("discoball").active = false
        this.toolAnima.getChildByName("boom").active = false

        this.view.angle = -0
        if (this.flower.active) {
            var e = this.plant.getChildByName("petal").children
            for (var t = 0; t < e.length; t++){
                e[t].active = false;
            }
            this.flower.active = false
        }
        this.temp.active && (
            this.temp.active = false,
            this.temp.removeAllChildren(),
            this.view.active = false,
            this.view.stopAllActions(),
            this.view.angle = -0
        )
    },
    reuse: function() { /// tái sử dụng
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchStart, this)
        //this.node.scale = 0.2
        this.node.stopActionByTag(1)
        this.node.angle = -0
        this.view.active = true
        //this.node.runAction(cc.spawn(cc.scaleTo(0.3, 1), cc.fadeIn(0.1)))
    },
    blockChoosed: function() {
        if(this._stoneType != 10){
            var action = cc.sequence(cc.rotateBy(0.05, 10), cc.rotateBy(0.05, -10)).repeatForever();
            action.tag = 1
            this.node.runAction(action)
        }
        
    },
    createGameTool: function() {},
    toolCanCombineEffect: function(e) {
        this.temp.active = true
        e.parent = this.temp
    },
    discoEffect: function(absorb, t) {
        this.node.zIndex = 1000
        this.temp.active = true
        absorb.active = true
        absorb.parent = this.temp
        /* var action = cc.rotateBy(1, 720).repeatForever();
        action.tag = 1
        if(action){
            this.view.getComponent(cc.Sprite).spriteFrame = this.combineView[t - 1]
        }
        this.view.runAction(action) */
        var discoball = this.toolAnima.getChildByName("discoball")
        discoball.getComponent("Spine").play('Skill_start', 1 , function() {
            discoball.getComponent("Spine").play("Skill_main", 0)
        }); 
    }, 
    playToolAnima: function(type) {
        cc.log("playToolAnima")
        this.toolAnima.active = true;
        var discoball = this.toolAnima.getChildByName("discoball")
        var boom = this.toolAnima.getChildByName("boom")
        var arrSkinDisco = ["Disco_yellow", "Disco_red", "Disco_orange", "Disco_green", "Disco_blue", "Disco_pink"]
        if(type == 2){      
            boom.active = true 
            boom.getChildByName("firework").active = true       
            var anim = boom.getComponent(cc.Animation);
            anim.play("tool_bomb")
        }else if(type == 3){     
            discoball.active = true
            discoball.getComponent("Spine").setNewSkin(arrSkinDisco[this.discoType])
            discoball.getComponent("Spine").play("Appear", 1)  
        }
    },           
});
