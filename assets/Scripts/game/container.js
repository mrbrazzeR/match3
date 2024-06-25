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
        avarta_blocks: cc.Prefab,
        custom_blocks: cc.Prefab,
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
        cc.systemEvent.on("GAME_TOOL", this.handleGameTool, this),
        cc.systemEvent.on("REMOVE_CUBES", this.removeSameColorCubeByClick, this)
        cc.systemEvent.on("player_tool", this.handlePlayerTool, this)
        cc.systemEvent.on("FIREINTHEHOLE", this.fireTheHole, this)
        cc.systemEvent.on("BOXING_ANVIL", this.boxingAndAnvil, this)
        this.stonePool = new cc.NodePool("block")
        this.colPool = new cc.NodePool
        this.firePool = new cc.NodePool("arrow")
        this.linePool = new cc.NodePool("line")
        this.rockPool = new cc.NodePool
        this.CubeBreakPool = new cc.NodePool
        this.lineList = [];
        for (var o = 0; o < 100; o++){
            var stone = cc.instantiate(this.stone)
            this.stonePool.put(stone);
        }
        for (var c = 0; c < 10; c++){
            var del_col = cc.instantiate(this.del_col)
            this.colPool.put(del_col);
        }
        for (var r = 0; r < 20; r++){
            var testArrow = cc.instantiate(this.testArrow)
            this.firePool.put(testArrow);
        }
        for (var d = 0; d < 20; d++){
            var line = cc.instantiate(this.line)
            this.linePool.put(line);
        }
        for (var l = 0; l < 20; l++){
            var rock = cc.instantiate(this.rock)
            this.rockPool.put(rock);
        }
        for (var h = 0; h < 20; h++){
            var normalCubeBreak = cc.instantiate(this.normalCubeBreak)
            this.CubeBreakPool.put(normalCubeBreak);
        }
        cc.director.getCollisionManager().enabled = true
       
        this.passIndex = false
        this.currentLevel = 0
        this.elapsed = 0
        this.duration = 0
        this.force = 0
        this.shouldVibrate = false
        this.customNodeList = []
        this.colorLimit=[]
    },
    
    startNewGame: function() {
        this.customNodeList = []
        this.grassGround.reset()
        this.bubbleGround.reset()     
        if(gameData.tournamentData){
            this.currentLevel = gameData.tournamentData.level
        }else{      
            this.currentLevel = gameData.bestLevel
        }
        cc.log("start game level: ", this.currentLevel)
        var mapList, levelResource, step, targetList;
        cc.game.GameMoveStatus = 0
        cc.game.windmillCount = 0
        this.canclePlayerNotice()
        cc.director.isPine = 0
        cc.director.checkLastPine = 0
        if (this.currentLevel >= 0 &&  this.currentLevel < 300){        
            levelResource = newLevelResource[this.currentLevel]
            mapList = JSON.parse(JSON.stringify(levelResource.mapList))
            gameData.starMatrix = mapList
            this.list = levelResource.targetList
            step = levelResource.step;
            this.colorLimit=levelResource.colorLimit&&levelResource.colorLimit.length>0?levelResource.colorLimit:[0,1,2,3,4]
        }else {
            var hinderList
            targetList = this.createRandomTargetList();
            var hinderList = this.createHinderList(targetList)
            var h = utils.initMatrixDataPortraitRandom()
            var p = utils.addHinder(h, hinderList[0], -2);
            utils.addHinder(h, hinderList[1], 20)
            p = utils.addHinder(h, hinderList[2], 21)
            hinderList = p
            this.list = targetList
            step = this.createStep()
            this.tempStep = step
            mapList = JSON.parse(JSON.stringify(hinderList))
            targetListo = this.list
            gameData.starMatrix = mapList
            step = this.tempStep
            levelResource = {}
        }
        cc.director.isMoving = false
        this.progressBar.initProgressBar()
        this.initContainerView(mapList)
        this.bgPrompt.initBgPrompt(gameData.starMatrix)
        this.target.resumeGameStatues()
        this.target.updateNodeTag(this.list, step)
        //////grassGround
        var grassList = levelResource.grassList
        var stoneList = levelResource.stoneList
        grassList && stoneList && this.grassGround.initFunc(grassList, stoneList)
        //////bubbleGround
        var bubbleList = levelResource.bubbleList
        bubbleList && this.bubbleGround.initFunc(bubbleList)
        //////customBlocks
        var customBlocks = levelResource.customBlocks
        customBlocks && this.initCustomBlocks(customBlocks)
        
        /* gameData.bestLevel > 0 && */ this.showTipsView()
        cc.director.dialogScript.goalDisplay.initGoalNumber(this.list)
        cc.director.videoCount = 1
        this.handleCanCombineTool()
        cc.systemEvent.emit("GAMEMASK_CONTROL", {
            order: 1
        })
    },
    initCustomBlocks(customBlocks){
        for (var i = 0; i < customBlocks.length; i++) {          
            var data = customBlocks[i]
            var pre;
            if(data[3] == "custom_avarta"){
                pre = cc.instantiate(this.avarta_blocks)      
            }else{
                pre = cc.instantiate(this.custom_blocks)
            }
            var preComp = pre.getComponent("custom_blocks");
            preComp.initData(data);
            var pos = preComp.comfirmCustomPosition(data);
            pre.parent = this.node
            pre.position = pos
            pre.zIndex = data[0][0]
            this.customNodeList.push(pre)
            this.setRatioChilrenInCustom(data)
        }
    },
    setRatioChilrenInCustom(data){
        var minRow = data[0][0] //4
        var maxRow = data[1][0] //6
        var minCol = data[0][1] //5
        var maxCol = data[1][1] //7
        for(var i = minRow; i <= maxRow; i++){
            for(var j = minCol; j <= maxCol; j++){
                var pos = cc.v2(i,j)
                var comp = this.getNodeBygGrid(pos);
                if(typeof comp.bombRatio == "number"){
                    comp.bombRatio = data[2]
                }
            }
        } 
    },
    initContainerView: function(e) {
        this.reclaimNode();
        for (var i = 0; i < psconfig.matrixRow; i++){
            for (var j = 0; j < psconfig.matrixCol; j++) {
                var s = cc.v2(i, j);
                this.initStoneData(s, e[i][j])
            }
        }
    },
    reclaimNode: function() {
        var e = this.node.children
        for (var i = e.length - 1; i >= 0; i--) {
            var item = e[i];
            if(item.name == "block"){
                this.stonePool.put(item)
            }else{
                item.removeFromParent()
            }
        }
    },
    initStoneData: function(e, t) {
        var item;
        if(this.stonePool.size() > 0){
            item = this.stonePool.get()
        }else{
            item = cc.instantiate(this.stone);
        }
        var pos = utils.grid2Pos(e.x, e.y);
        item.getComponent("block").initStoneView(e.x, e.y, t)
        item.position = pos
        this.node.addChild(item);
        var o = utils.indexValue(e.x, e.y);
        if(t == -2){
            gameData.starSprite[o] = null
        }else{
            gameData.starSprite[o] = item
        }
    },
    
    removeSameColorCubeByClick: function(needRemoveList) {
        this.canclePlayerNotice();
        var detail = needRemoveList.detail
        var jsonDetail = JSON.parse(JSON.stringify(detail));
        this.hinderResponseCubesBreak(jsonDetail, this)
        if (detail.length >= 5){
            this.cubesToGameTool(jsonDetail);
        }else {
            while(detail.length > 0){
                var element = detail.pop()
                this.normalCubeBreakAnimation(element)
                this.removeBlock(element)
            }     
            this.scheduleOnce(function() {
                cc.systemEvent.emit("STEP_COUNT"),
                cc.director.isrunning || this.whichTimeTampRow("\u79fb\u9664\u64cd\u4f5c")
            }, 0.5)
        }
    },
    normalCubeBreakAnimation: function(e) {
        var cube, pos = utils.grid2Pos(e.x, e.y);
        if(this.CubeBreakPool.size() > 0){
            cube = this.CubeBreakPool.get()
        }else{
            cube = cc.instantiate(this.normalCubeBreak)
        }
        cube.parent = this.node
        cube.zIndex = 1000
        cube.position = pos;
        var a = gameData.starMatrix[e.x][e.y]
        var comp = cube.getComponent(cc.ParticleSystem);
        comp.spriteFrame = this.cubeBreakList[a]
        comp.resetSystem()
        this.scheduleOnce(function() {
            this.CubeBreakPool.put(cube)
        }, comp.life)
    },
    becomeGameTool: function(cube, cubesLength, type) {
        var stone;
        if(this.stonePool.size() > 0){
            stone = this.stonePool.get()
        }else{
            stone = cc.instantiate(this.stone)
        }
        stone.scale = 1
        var indexValue = utils.indexValue(cube.x, cube.y);
        if (null != gameData.starSprite[indexValue]) {
            var c = gameData.starSprite[indexValue];
            this.stonePool.put(c)
        }
        gameData.starSprite[indexValue] = stone
        stone.parent = this.node
        stone.position = utils.grid2Pos(cube.x, cube.y)
        cc.director.SoundManager.playSound("combine")      
        var compBlock = stone.getComponent("block");
        compBlock.toolCombine.getComponent("toolcombine_effect").effect()
        if(cubesLength >= 5 && cubesLength < 7){
            gameData.starMatrix[cube.x][cube.y] = 8,
            compBlock.initStoneView(cube.x, cube.y, 8, type)
        }else if(cubesLength >= 7 && cubesLength < 9){
            gameData.starMatrix[cube.x][cube.y] = 9
            compBlock.initStoneView(cube.x, cube.y, 9, type)
        }else if(cubesLength >= 9){
            gameData.starMatrix[cube.x][cube.y] = 10
            compBlock.initStoneView(cube.x, cube.y, 10, type)
        }
        cc.systemEvent.emit("STEP_COUNT"),
        cc.director.isrunning || this.whichTimeTampRow("changeStonetexture")
    },
    
    cubesToGameTool: function(cubes) {
        var cube
        var cubesLength = cubes.length
        var cubeFirst = cubes[0]
        var type = gameData.getDataBygrid(cubeFirst);
        cc.director.SoundManager.playSound("combine1");
        var func = function(_cubeFirst, _cubesLength, _type, _this) {
            _this.becomeGameTool(_cubeFirst, _cubesLength, _type);
            var a = utils.judgeOperateLevel(_cubesLength);
            cc.systemEvent.emit("OPERATION_EVALUATE", {
                level: a
            })
        }
        while (cubes.length > 0) {
            cube = cubes.pop()
            if(cubes.length == 0){
                this.nodeMove(cube, cubeFirst, cubesLength, type, func)
            }else{
                this.nodeMove(cube, cubeFirst)
            }
        }
    },
    nodeMove: function(cube, cubeFirst, cubesLength, type, func) { //hiệu ứng create tool
        var _this = this
        var indexValue = utils.indexValue(cube.x, cube.y)
        var block = gameData.starSprite[indexValue]
        var posMove = utils.grid2Pos(cubeFirst.x, cubeFirst.y);
        block.getComponent("block").outLine.active = true
        //block.zIndex = 1;
        var h = gameData.getDataBygrid(cube);
        gameData.starSprite[indexValue] = null
        gameData.cleanStarData([cube])
        cc.systemEvent.emit("REMOVE_SINGLE_GRASS", {
            pos: cube
        })
        if(h >= 0 && h < 8){
            cc.systemEvent.emit("REMOVE_SINGLE_BUBBLE", {
                pos: cube
            })
        }
        block.runAction(
            cc.sequence(
                //cc.scaleTo(0.2, 1.5), 
                cc.spawn(
                    cc.rotateBy(0.2, 360 * Math.random()), 
                    //cc.scaleTo(0.2, 0.5), 
                    cc.moveTo(0.2, posMove)
                ), 
                //cc.spawn(cc.scaleTo(0.2, 0.5), cc.fadeOut(0.1)), 
                cc.callFunc(function() {
                    _this.removeBlock2(block, h)
                    if(cubesLength && func && type >= 0){
                        func(cubeFirst, cubesLength, type, _this)
                    }
               }
           ))
        )
    },
    balloonBoomEffect: function(e) {
        var t = cc.instantiate(this.balloonBoom)
        var s = utils.grid2Pos(e.x, e.y);
        t.position = s,
        t.parent = this.node;
        t.zIndex = 1000
        var n = t.getComponent(cc.Animation);
        n.play("balloon");
        var a = n.getClips()[0].duration;
        this.scheduleOnce(function() {
            t.removeFromParent()
        }, a)
    },
    vineBreakEffect: function(e) {
        var t = cc.instantiate(this.vineBreak)
        var s = utils.grid2Pos(e.x, e.y);
        t.position = s,
        t.parent = this.node;
        t.zIndex = 1000
        var n = t.getComponent(cc.Animation);
        cc.director.SoundManager.playSound("vineBreak"),
        //cc.log("anim vineBreak")
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
        s.zIndex = 1000
        var a = s.getComponent(cc.Animation);
        if(t == 2){
            a.play("iron_right")
            //cc.log("anim iron_right")
            cc.director.SoundManager.playSound("ironLine1")
        }else{
            //cc.log("anim iron_left")
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
        t.zIndex = 1000
        var n = t.getComponent(cc.Animation);
        n.play("woodCubeBreak")
        //cc.log("anim woodCubeBreak")
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
    windmillBreakEffect: function(e, type) {
        cc.log("windmillBreakEffect")
        var netBreak; 
        if(type == 2){
            netBreak = cc.instantiate(this.netBreak1)
        }else{
            netBreak = cc.instantiate(this.netBreak2)
        }  
        var grid2Pos = utils.grid2Pos(e.x, e.y);
        netBreak.parent = this.node
        netBreak.position = grid2Pos
        netBreak.zIndex = 500;
        var Animation = netBreak.getComponent(cc.Animation);
        Animation.play("netBreak" + (3 - type));
        cc.director.SoundManager.playSound("netBreak")  
        //cc.log("anim windmillBreakEffect", (3 - t))
        var duration = Animation.getClips()[0].duration;
        this.scheduleOnce(function() {
            netBreak.removeFromParent()
        }, duration)
         
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
                        var t = true
                        var o = cc.instantiate(this.windmill_particle);
                        o.parent = this.node,
                        o.zIndex = 600,
                        o.position = utils.grid2Pos(e.x, e.y),
                        o.getComponent(cc.ParticleSystem).resetSystem()
                        cc.director.SoundManager.playSound("grassHit");
                        var c = n.shift();
                        a.removeBlock(c);
                        for (var r = n.length, d = 0; d < r; d++) {
                            var l = n[d];
                            gameData.starMatrix[l.x][l.y] > 7 ? 27 == gameData.starMatrix[l.x][l.y] ? a.getNodeBygGrid(l).bombRatio > 1 ? a.handleGameToolArray(l) : (t = false,
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
        t.zIndex = 1000
        var n = t.getComponent(cc.Animation)
          , a = "colorCube_" + this.getNodeBygGrid(e).nextType;
        n.play(a)
        //cc.log("anim ", a)
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
        s.position = n
        s.parent = this.node
        s.zIndex = 1000
        t = t > 0 ? 3 - t : 3;
        var a = s.getComponent(cc.Animation);
        cc.director.SoundManager.playSound("glassBallBreak");
        var o = "glassBallHit" + t;
        a.play(o);
        //cc.log("anim ", o)
        var c = a.getClips()[t - 1].duration
          , r = this.getNodeBygGrid(e);
        3 == t && r && (r.view.active = false,
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
        t.zIndex = 1000
        var n = t.getComponent(cc.Animation);
        cc.director.SoundManager.playSound("cubeRockBreak")
        n.play("cubeRockBreak");
        //cc.log("anim cubeRockBreak")
        var a = n.getClips()[0].duration;
        this.scheduleOnce(function() {
            t.removeFromParent()
        }, a)
    },
    hinderResponseCubesBreak: function(detail, _this) { ///check hinder
        this.handleBalloonBomb(detail, _this)
        this.handleVineBreak(detail, _this)
        this.handleWoodBreak(detail, _this)
        this.handleFlowerBreak(detail, _this)
        this.handleWindmillBreak(detail, _this)
        this.handleColorCubesBreak(detail, _this)
        this.handleLadyBugCubesBreak(detail, _this)
        this.handleAvartaBreak(detail, _this)
    },
    handleGameTool: function(detailJS) {
        this.canclePlayerNotice();
        var detail = detailJS.detail
        var needCombineTool = utils.needCombineTool(gameData.starMatrix, detail.grid);
        if (needCombineTool.length >= 2 && !detail.from) {
            var o = this.whichSuperTool(gameData.starMatrix, needCombineTool);
            this.triggerGameTool(o, detail.grid, needCombineTool)
        } else {
            if (detail.index == psconfig.rType) {
                if(detail.type == 0){
                    this.removeBlock(detail.grid)
                    this.col_rocket(detail.grid)
                }else{
                    this.removeBlock(detail.grid)
                    this.row_rocket(detail.grid)
                }
                cc.systemEvent.emit("OPERATION_EVALUATE", {
                    level: 3
                })
                if (cc.director.isrunning){
                    return;
                }
                this.whichTimeTampRow("\u6e38\u620f\u9053\u5177")
            }
            if (detail.index == psconfig.bType) {
                this.boomEffect(detail.grid);                      
                var removeList = utils.rainbowStarRemoveList(gameData.starMatrix, detail.grid);
                var obj = this.getCustomNodeList(removeList)
                this.setRatioCustom(obj)
                if(detail.from && 1 == detail.from){
                    this.removeBombBlockOnly(removeList)                    
                }else{
                    this.removeNineBlock(removeList)
                }
                cc.director.SoundManager.playSound("boom1")
                cc.systemEvent.emit("OPERATION_EVALUATE", {
                    level: 3
                })
            }
            if (detail.index == psconfig.dType) {
                var getSameBlockList = utils.getSameBlockList(gameData.starMatrix, detail.grid, detail.type);
                this.discoRotation(detail.grid);
                var d = JSON.parse(JSON.stringify(getSameBlockList));
                this.effectRemoveSame(detail.grid, getSameBlockList, d, this.removeSameColorBlock)
                cc.systemEvent.emit("GAMEMASK_CONTROL", {
                    order: 1
                })
            }
        }
    },
    boomEffect: function(e, superBoom) {   
        cc.log("boomEffect")
        this.vibrate(10, 70)
        var boom_effect = cc.instantiate(this.boom_effect)
        var s = utils.grid2Pos(e.x, e.y);
        if(superBoom && superBoom == "superBoom" ){
            boom_effect.scale = 2
        }else{
            boom_effect.scale = 1
        }
        boom_effect.position = s
        boom_effect.parent = this.node
        boom_effect.zIndex = 1000
        //t.getComponent(cc.ParticleSystem).resetSystem()
        boom_effect.getChildByName("eff").getComponent(dragonBones.ArmatureDisplay).armature()
    },
    superDiscoAnima: function(e) {
        var t = cc.instantiate(this.superDisco)
        var s = utils.grid2Pos(e.x, e.y);
        t.position = s
        t.parent = this.node
        t.zIndex = 1000
        t.getComponent(cc.ParticleSystem).resetSystem()
    },
    removeNineBlock: function(e) {      
        var t = e.shift();
        //this.effectRemoveCol(t)
        this.removeBlock(t)
        if (e.length <= 0){
            this.scheduleOnce(function() {
                cc.director.isrunning || this.whichTimeTampRow("removeNineBlock1")
            }, 0.5);
        }else{
            for (var i = 0; i < e.length; i++){
                this.handleGameToolArray(e[i]),
                i == e.length - 1 && this.scheduleOnce(function() {
                    cc.director.isrunning || this.whichTimeTampRow("removeNineBlock2")
                }, 0.5)
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
        var newNode = new cc.Node;
        newNode.parent = this.node;
        var a = utils.grid2Pos(e.x, e.y);
        newNode.position = a;
        newNode.zIndex = 1000
        var absorb = cc.instantiate(this.absorb);
        absorb.parent = newNode;
        var toolItem = cc.instantiate(this.toolItem);
        toolItem.parent = newNode
        absorb.getComponent(cc.ParticleSystem).resetSystem()
        toolItem.getComponent("toolItem").changeItemTexture(t)
        toolItem.runAction(cc.rotateBy(0.5, 540).repeatForever())
        this.scheduleOnce(function() {
            newNode.removeFromParent()
            s && s(e, 9)
        }, 1.5)
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
                }, 2.3);
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
                cc.log("superBoom")
                this.toolCombineAnimation(a, function(e, t) {
                    var s = cc.instantiate(e.toolItem);
                    s.parent = e.node
                    s.scale = 1
                    s.position = utils.grid2Pos(t.x, t.y)
                    s.getComponent("toolItem").changeItemTexture(2)
                    cc.director.SoundManager.playSound("superBomb")
                    s.runAction(
                        cc.sequence(
                            cc.scaleTo(.3, 4), 
                        cc.sequence(
                            cc.rotateBy(.05, 20), 
                            cc.rotateBy(.05, -20), 
                            cc.rotateBy(.01, 0)
                        ).repeat(3), 
                        cc.callFunc(function() {
                            s.removeFromParent()
                            e.boomEffect(t, "superBoom")
                        })
                    ))
                })
                this.scheduleOnce(function() {
                    this.superBoomEffect(t)
                    cc.director.SoundManager.playSound("boom1")
                    this.scheduleOnce(function() {
                        cc.director.isSuperTool = 0
                    }, 1)
                }, 1.3);
                break;
            case "3row&col":  
                this.toolCombineAnimation(a, function(e, t) {
                    e.blackHoleEffect(t)
                }),
                cc.director.SoundManager.playSound("rocket_bomb"),
                this.scheduleOnce(function() {
                    this.boomAndRocketEffect(t),
                    this.scheduleOnce(function() {
                        cc.director.isSuperTool = 0
                    }, 1)
                }, 2);
                break;
            case "row&col":
                this.toolCombineAnimation(a, function(e, t) {
                    e.blackHoleEffect(t, 10)
                }),
                this.scheduleOnce(function() {
                    this.superRocketEffect(t),
                    this.scheduleOnce(function() {
                        cc.director.isSuperTool = 0
                    }, 1)
                }, 2)
            }
    },
    toolCombineAnimation: function(arr, callback) {
        cc.director.SoundManager.playSound("rotation_combine");
        var type, _this = this, blockGrid = arr.shift()
        var blockComp = this.getNodeBygGrid(blockGrid);
        if(blockComp._stoneType == 10){
            type = blockComp.discoType
        }     
        var func = function() {
            var c = arr.pop()
            var r = _this.getNodeBygGrid(c);
            if(r._stoneType == 10){
                type = r.discoType
            } 
            var index = utils.indexValue(c.x, c.y)
            var starSprite = gameData.starSprite[index]
            var pos = utils.grid2Pos(blockGrid.x, blockGrid.y);
            starSprite.runAction(
                cc.sequence(
                    cc.scaleTo(0.2, 1.1), 
                    cc.spawn(
                        cc.scaleTo(0.2, 0.9), 
                        cc.moveTo(0.2, pos).easing(cc.easeBounceOut())
                    ), 
                    cc.spawn(cc.scaleTo(0.2, 0.5), cc.fadeOut(0.1)), 
                cc.callFunc(function() {
                    _this.removeBlock(c)
                    _this.toolAndSuperToolEffect(blockGrid)
                    if(arr.length == 0){
                        callback(_this, blockGrid, type)
                    }
                }))
            )
        }  
        while(arr.length >0){
            func()
        }
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
        var getThreeBlockArea = utils.getThreeBlockArea(gameData.starMatrix, e);
        var obj = this.getCustomNodeList(getThreeBlockArea)
        this.setRatioCustom(obj)
        this.removeNineBlock(getThreeBlockArea)
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
        var sameBlockList = utils.getSameBlockList(e, s, t);
        cc.director.SoundManager.playSound("rotation_combine"),
        this.discoRotation(s, 2),
        this.changeToBoom(s, sameBlockList, 1)
    },
    discoRocketEffect: function(starMatrix, t, s) {
        cc.director.SoundManager.playSound("rotation_combine")
        var sameBlockList = utils.getSameBlockList(starMatrix, s, t);
        this.discoRotation(s, 1)     
        this.changeToBoom(s, sameBlockList, 2)
    },
    changeToBoom: function(e, sameBlockList, s, n) {
        var effFire, _this = this;
        if (sameBlockList.length <= 0){
            return this.executeListEffect(n, s),
            void this.scheduleOnce(function() {
                cc.director.isSuperTool = 0
            }, 1);
        }
        if(!n){
            n = [e]
        }
        var c = sameBlockList.pop();
        n.push(c);
        var r = utils.grid2Pos(e.x, e.y)
        var posMove = utils.grid2Pos(c.x, c.y);
        if(this.firePool.size() > 0){
            effFire = this.firePool.get()
        }else{
            effFire = cc.instantiate(this.fire)
        }
        effFire.parent = this.node
        effFire.zIndex = 1000
        effFire.position = r;
        var l = this.node.convertToWorldSpaceAR(r)
        var h = this.node.convertToWorldSpaceAR(posMove);
        effFire.getComponent("arrow").computedLineDistanceAndRotation(l, h)
        cc.director.SoundManager.playSound("flyStart"),
        effFire.runAction(cc.sequence(cc.moveTo(0.1, posMove), cc.callFunc(function() {
            cc.director.SoundManager.playSound("flyEnd")
            _this.firePool.put(effFire)
            _this.blockToBoom(c, s)       
            _this.changeToBoom(e, sameBlockList, s, n)
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
            cc.director.needWait = true,
            this.whichTimeTampRow("\u76f8\u540c\u9053\u5177\u5217\u8868"),
            void this.scheduleOnce(function() {
                cc.director.needWait = false
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
        var obj = this.getCustomNodeList(e)
        this.setRatioCustom(obj)
        this.removeBlockOnly(e)
        this.target.isPass || (
            cc.systemEvent.emit("OPERATION_EVALUATE", {
                level: 3
            }),
            cc.systemEvent.emit("GAMEMASK_CONTROL", {
                order: 2
            })
        )
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
        cc.log("handlePlayerTool", e)
        this.canclePlayerNotice();
        var t = e;
        if(1 == t.type){
            this.scheduleOnce(function() {
                this.whichTimeTampRow()
            }, 0.2)
            cc.systemEvent.emit("UPDATE_TOOL", {
                type: 1,
                statuCode: 2
            })
        }else if(2 == t.type){
            this.scheduleOnce(function() {
                this.whichTimeTampRow()
            }, 0.2)
            cc.systemEvent.emit("UPDATE_TOOL", {
                type: 2,
                statuCode: 2
            })
        }else if(3 == t.type){
            var i = t.grid;
            this.toolAndSuperToolEffect(i)
            if (gameData.starMatrix[i.x][i.y] >= 8 && gameData.starMatrix[i.x][i.y] <= 10){
                return;
            }
            var obj = this.getCustomNodeList([t.grid])      
            this.setRatioCustom(obj)
            this.handleSingleGrid(t.grid)
            
            this.scheduleOnce(function() {
                this.whichTimeTampRow()
            }, 0.2)
            cc.director.SoundManager.playSound("ham"),
            cc.systemEvent.emit("UPDATE_TOOL", {
                type: 3,
                statuCode: 2
            })
        }else if(4 == t.type){
            this.shuffleStarMatrix()
            cc.director.isMoving = false
            cc.systemEvent.emit("UPDATE_TOOL", {
                type: 4,
                statuCode: 2
            })
        }
        cc.director.isPlayerUsedTool = true
    },
    discoRemoveCuneEffect: function(e) {
        var t = utils.grid2Pos(e.x, e.y)
        var s = cc.instantiate(this.dust);
        s.parent = this.node
        s.position = t
        s.zIndex = 1000
        s.getComponent(cc.ParticleSystem).resetSystem()
    },
    effectRemoveCol: function(e) {
        var t, s = utils.grid2Pos(e.x, e.y);
        (t = this.colPool.size() > 0 ? this.colPool.get() : cc.instantiate(this.del_col)).parent = this.node,
        t.position = s
        t.zIndex = 1000
        t.getComponent(cc.ParticleSystem).resetSystem()
    },
    test: function(e) {
        var t, s = e.detail, n = utils.grid2Pos(s.x, s.y);
        (t = this.colPool.size() > 0 ? this.colPool.get() : cc.instantiate(this.del_col)).parent = this.node,
        t.position = n
        t.zIndex = 1000
        t.getComponent(cc.ParticleSystem).resetSystem()
    },
    effectRemoveSame: function(grid, getSameBlockList, n, removeSameColorBlockFunc, arr) {
        var line, _this = this;
        if (getSameBlockList.length <= 0){
            if(removeSameColorBlockFunc){
                //clear
                _this.scheduleOnce(function() {
                    removeSameColorBlockFunc(n, _this, arr)
                }, 1)
                
            }
        }else {
            if(!arr){
                arr = []
            }
            var d = getSameBlockList.pop()
            var l = utils.grid2Pos(grid.x, grid.y)
            var h = utils.grid2Pos(d.x, d.y)
            var p = utils.indexValue(d.x, d.y);
            if (gameData.starSprite[p]) {
                if(this.linePool.size() > 0){
                    line = this.linePool.get()
                }else{
                    line = cc.instantiate(this.line)
                }
                line.parent = this.node   
                cc.director.SoundManager.playSound("disco")    
                var compLine = line.getComponent("line");              
                compLine.computedLineDistanceAndRotation(l, h)
                line.position = l
                line.zIndex = 1000
                arr.push(line)
                line.scale = 0.05
                line.runAction(cc.sequence(cc.scaleTo(0.1, 1, 1), cc.callFunc(function() {
                    _this.blockEffect(d)
                    _this.effectRemoveSame(grid, getSameBlockList, n, removeSameColorBlockFunc, arr)
                })))
            } else{
                _this.effectRemoveSame(grid, getSameBlockList, n, removeSameColorBlockFunc, arr)
            }
        }
    },
    blockEffect: function(e) {
        var t = utils.indexValue(e.x, e.y)
        var n = gameData.starSprite[t];
        n && n.getComponent("block").blockChoosed()
    },
    blockToBoom: function(e, t) {
        var a = utils.indexValue(e.x, e.y)
        var o = gameData.starSprite[a];
        if (o) {
            var c = gameData.getDataBygrid(e);
            cc.systemEvent.emit("NUMBER_COUNT", {
                type: c
            });
            var r = o.getComponent("block");
            1 == t ? (
                r.changeStoneNum(psconfig.bType),
                gameData.starMatrix[e.x][e.y] = psconfig.bType
            ) : (
                r.changeStoneNum(psconfig.rType),
                gameData.starMatrix[e.x][e.y] = psconfig.rType
            )
        }
    },
    isSpecialTool: function(e) {
        for (var t = false, i = 0; i < e.length; i++) {
            var a = e[i];
            if (gameData.starMatrix[a.x][a.y] >= psconfig.rType && gameData.starMatrix[a.x][a.y] < 20) {
                t = true;
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
        if (n && n.length > 0){
            for (; n.length > 0; ) {
                var a = n.pop()
                var o = this.getNodeBygGrid(a);
                t.vineBreakEffect(a),
                o.bombRatio--,
                o.cubesUnlock()
            }
        }
    },
    handleAvartaBreak: function(detail, _this) {
        var balloonClearList = utils.getBalloonClearList(gameData.starMatrix, detail, 40);
        if (balloonClearList && balloonClearList.length > 0){
            var obj = _this.getCustomNodeList(balloonClearList)      
            _this.setRatioCustom(obj)
        }
    },
    setRatioCustom(obj){
        if(Object.keys(obj).length > 0){
            var arr = Object.keys(obj).map((key) => [key, obj[key]]);
            while(arr.length > 0){
                var element = arr.pop()
                var nodeCustom = this.customNodeList[element[0]]          
                var comp = nodeCustom.getComponent("custom_blocks")
                if(typeof comp.bombRatio == "number"){
                    comp.bombRatio -= element[1]
                    if(comp.bombRatio <= 0){
                        nodeCustom.destroy()
                        this.customNodeList.splice(element[0],1)
                    }else{                     
                        comp.customHit(element[1])
                    }
                }
                this.setEveryBlockInCustomNode(comp.data, element[1])
            }  
        }      
    },
    setEveryBlockInCustomNode(data, value){
        var minRow = data[0][0] 
        var maxRow = data[1][0] 
        var minCol = data[0][1] 
        var maxCol = data[1][1] 
        for(var i = minRow; i <= maxRow; i++){
            for(var j = minCol; j <= maxCol; j++){
                var pos = cc.v2(i,j)
                var comp = this.getNodeBygGrid(pos);
                if(typeof comp.bombRatio == "number"){
                    comp.bombRatio -= value
                    if(comp.bombRatio <= 0){
                        this.removeBlock(pos)
                    }
                }
            }
        }
    },
    getCustomNodeList(balloonClearList){
        var obj = {};
        for(var i = 0; i < this.customNodeList.length; i++){
            var data = this.customNodeList[i].getComponent("custom_blocks").data
            var minRow = data[0][0] 
            var maxRow = data[1][0]
            ///
            var minCol = data[0][1] 
            var maxCol = data[1][1]  
            var count = 0         
            balloonClearList.forEach(balloon => {          
                if(
                    balloon.x >= minRow && balloon.x <= maxRow &&
                    balloon.y >= minCol && balloon.y <= maxCol
                ){
                    count += 1   
                    obj[i] = count                                       
                }
            })
        }
        return obj; 
    },
    handleWoodBreak: function(e, t) {
       //cc.log("handleWoodBreak")
        var n = utils.getBalloonClearList(gameData.starMatrix, e, 23);
        if (n && n.length > 0)
            for (; n.length > 0; ) {
                var a = n.pop()
                var o = this.getNodeBygGrid(a);
                "number" == typeof o.bombRatio && (
                    o.bombRatio--,
                    o.bombRatio <= 0 ? (t.removeBlock(a),
                    o.boxCubesDisappear(),
                    t.woodCubeBreakEffect(a)) : (o.boxHit(),
                    2 == o.bombRatio ? this.woodBoxBreakEffect(a, 2) : this.woodBoxBreakEffect(a, 1))
                )
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
    handleLadyBugCubesBreak: function(detail, _this) {
        var balloonClearList = utils.getBalloonClearList(gameData.starMatrix, detail, 37);
        if (balloonClearList && balloonClearList.length > 0){
            while(balloonClearList.length > 0){
                var element = balloonClearList.pop()
                var nodeBygGrid = this.getNodeBygGrid(element);
                if(typeof nodeBygGrid.bombRatio == "number"){
                    nodeBygGrid.bombRatio--
                    if(nodeBygGrid.bombRatio <= 0 ){
                        _this.ladyBugCubesBreakEffect(element, nodeBygGrid.bombRatio)
                    }else{
                        _this.ladyBugCubesBreakEffect(element, nodeBygGrid.bombRatio)
                        nodeBygGrid.hitLadyBugCubes()
                    }
                }
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
                a == n.length - 1 ? this.ladyBugMoveLine(e, o, true) : this.ladyBugMoveLine(e, o)
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
        //cc.log("anim ladyBug"),
        c.parent = this.node,
        c.position = n,
        c.zIndex = 1000;
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
        t.parent = this.node
        t.position = e
        t.zIndex = 1000
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
        for (var t, n = utils.getItemAdjacentPos(e), a = false, o = 0; o < n.length; o++) {
            var c = n[o];
            if (gameData.starMatrix[c.x][c.y] >= 0 && gameData.starMatrix[c.x][c.y] < 8) {
                a = true,
                t = c;
                break
            }
        }
        return !!a && t
    },
    removeSameColorBlock: function(e, t, n) {
        if (e) {
            t.vibrate(15,100)
            cc.log("removeSameColorBlock")
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
        var block;
        block = this.stonePool.size() > 0 ? this.stonePool.get() : cc.instantiate(this.stone);
        var indexValue = utils.indexValue(e.x, e.y);
        if (null != gameData.starSprite[indexValue]) {
            var c = gameData.starSprite[indexValue];
            this.stonePool.put(c)
        }
        gameData.starSprite[indexValue] = block
        block.parent = this.node
        block.position = utils.grid2Pos(e.x, e.y)
        gameData.updateSingleData(e, t + n)
        
        var blockComp = block.getComponent("block")
        var data = gameData.getDataBygrid(e);
        blockComp.initStoneView(e.x, e.y, data, n)
        if(t + n - 1 >= 8){
            cc.director.SoundManager.playSound("combine")
            blockComp.toolCombine.getComponent("toolcombine_effect").effect()
        }
        cc.systemEvent.emit("STEP_COUNT")
        cc.director.isrunning || this.whichTimeTampRow("changeStonetexture")
    },
    toolAndSuperToolEffect: function(e) {
        var pos = utils.grid2Pos(e.x, e.y)
        var combineEffect = cc.instantiate(this.toolCombineEffect);
        combineEffect.position = pos
        combineEffect.parent = this.node
        combineEffect.zIndex = 1000
        combineEffect.getComponent("toolcombine_effect").effect()
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
        var a = gameData.starSprite[n];
        if (a) {
            var o = gameData.getDataBygrid(e);
            if(!t){
                cc.systemEvent.emit("NUMBER_COUNT", {
                    type: o
                })
                o < 20 ? this.progressBar.judgeStepScore(250) : this.progressBar.judgeStepScore(0)
            }
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
        this.canclePlayerNotice()
        this.resumeOriginView()
        this.queryCanFall()
        this.addStar()
        if(utils.gameOver(gameData.starMatrix)){
            cc.systemEvent.emit("GAMEMASK_CONTROL", {
                order: 1
            })
            this.scheduleOnce(function() {
                cc.systemEvent.emit("SHUFFLE_TIPS")
            }, 1.5)
            this.scheduleOnce(function() {
                this.shuffleStarMatrix()
            }, 2.5)
        }
        this.isPineToEnd()
        cc.director.isMoving = false
        /* gameData.bestLevel > 0 && */ this.showTipsView()
    },
    queryCanFall: function(e) {
        var t;
        t = "number" == typeof e ? e : 0;
        for (var i = 0; i < psconfig.matrixCol; i++) {
            var type = -1
            for (var j = t; j < psconfig.matrixRow; j++){
                if (-1 == gameData.starMatrix[j][i]) {
                    type = j;
                    break
                }
            }
            if (type >= 0){
                for (var k = type; k < psconfig.matrixRow; k++){
                    if (
                        gameData.starMatrix[k][i] != -2 && gameData.starMatrix[k][i] != 26 && 
                        gameData.starMatrix[k][i] != 27 

                    ) {
                        var d = -1
                        for (var h = k + 1; h < psconfig.matrixRow; h++){
                            if (
                                gameData.starMatrix[h][i] >= 0 && gameData.starMatrix[h][i] != 26 &&  
                                gameData.starMatrix[h][i] != 27 
                            ) {
                                d = h;
                                break
                            }
                        }
                        if (d >= 0) {
                            if (
                                gameData.starMatrix[d][i] == 22 ||                             
                                gameData.starMatrix[d][i] >= 23 && gameData.starMatrix[d][i] <= 25 || 
                                gameData.starMatrix[d][i] >= 29 && gameData.starMatrix[d][i] <= 36 ||
                                gameData.starMatrix[d][i] == 40 
                            ) {
                                this.queryCanFall(d + 1);
                                break
                            }
                            gameData.starMatrix[k][i] = gameData.starMatrix[d][i]
                            gameData.starMatrix[d][i] = -1
                            this.donwMove(cc.v2(k, i), cc.v2(d, i))
                        }
                    }
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
        for (var e = 0; e < psconfig.matrixRow; e++){
            for (var t = 0; t < psconfig.matrixCol; t++){
                if (gameData.starMatrix[e][t] >= 0 && gameData.starMatrix[e][t] < psconfig.rType) {
                    var i = cc.v2(e, t);
                    this.getNodeBygGrid(i).originView()
                }
            }
        }
    },
    donwMove: function(e, t) {
        //cc.log("donwMove")
        var n = utils.indexValue(t.x, t.y)
        var a = utils.indexValue(e.x, e.y)
        var o = utils.grid2Pos(e.x, e.y)
        var c = gameData.starSprite[n];
        c.stopActionByTag(5)
        c.getComponent("block").changeStoneGrid(e.x, e.y)
        gameData.starSprite[a] = c
        gameData.starSprite[n] = null;
        var r = cc.sequence(
            cc.moveTo(.01 * t.x, o).easing(cc.easeExponentialIn()), 
            cc.jumpTo(.1, o, 10, 1), 
            cc.callFunc(function() {
                cc.director.SoundManager.playSound("drop4")
            })
        );
        r.tag = 5
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
        var i = true
          , s = e.x;
        if (0 == s)
            return i;
        for (var n = s - 1; n >= 0; n--)
            if (-2 != t[n][e.y]) {
                i = false;
                break
            }
        return i
    },
    addStar: function() {
        for (var i = 0; i < psconfig.matrixCol; i++) {
            var t = -1
            for (var j = psconfig.matrixRow - 1; j >= 0; j--){
                if (
                    gameData.starMatrix[j][i] == 22 ||       
                    (gameData.starMatrix[j][i] >= 23 && gameData.starMatrix[j][i] <= 25) || 
                    (gameData.starMatrix[j][i] >= 29 && gameData.starMatrix[j][i] <= 36) ||
                    gameData.starMatrix[j][i] == 40                   
                ) {
                    t = j;
                    break
                }
            }
            if (t >= 0) {
                for (var k = t; k < psconfig.matrixRow; k++){
                    if (gameData.starMatrix[k][i] == -1) {
                        var o = cc.v2(k, i);
                        this.fallStoneFromTop(o)
                    }
                }
            } else{
                for (var h = 0; h < psconfig.matrixRow; h++){
                    if (gameData.starMatrix[h][i] == -1) {
                        var r = cc.v2(h, i);
                        this.fallStoneFromTop(r)
                    }              
                }
            }
        }

        if(!this.target.isPass){
            this.handleCanCombineTool()
        }
    },
    handleCanCombineTool: function() {
        if (this.effectList) {
            while (this.effectList.length > 0) {
                let effectNode = this.effectList.pop();
                let tempNode = effectNode.getChildByName("temp");
                if (tempNode) {
                    tempNode.removeAllChildren();
                }
            }
        } else {
            this.effectList = [];
        }
        let nearNodes = utils.judgeNearNode(gameData.starMatrix);
        while (nearNodes.length > 0) {
            let gridPosition = nearNodes.pop();
            let gridNode = this.getNodeBygGrid(gridPosition);
    
            // Instantiate tool effect and apply it to the node
            let toolEffect = cc.instantiate(this.tool_effect);
            gridNode.toolCanCombineEffect(toolEffect);
    
            // Add the node to the effect list
            this.effectList.push(gridNode.node);
        }
    },
    removeToolEffect: function(e) {
        var t = this.getNodeBygGrid(e).temp
          , i = t.getChildByName("tool_effect");
        this.toolEffectPool.put(i),
        t.active = false
    },
    fallStoneFromTop: function(e) {
        var stone, y = e.y;
        stone = this.stonePool.size() > 0 ? this.stonePool.get() : cc.instantiate(this.stone);
        var pos = utils.grid2Pos(10, y);
        this.node.addChild(stone);
        var comp = stone.getComponent("block")
        var randomColor = utils.randomColorByArray(this.colorLimit);
        comp.initStoneView(e.x, e.y, randomColor)
        gameData.updateSingleData(e, randomColor)
        stone.position = pos;
        var r = utils.grid2Pos(e.x, e.y)
        var d = utils.indexValue(e.x, e.y);
        gameData.starSprite[d] = stone
        stone.runAction(
            cc.sequence(
                cc.fadeIn(0.1), cc.moveTo(0.01 * e.x, r).easing(cc.easeExponentialIn()), cc.callFunc(function() {
                    cc.director.SoundManager.playSound("drop4")
                }),
                cc.jumpBy(0.1, cc.v2(0, 0), 10, 1)
            )
        )

      
    },
    shuffleStarMatrix: function() {
        this.canclePlayerNotice()
        cc.director.SoundManager.playSound("dice");
        var starSprite = gameData.starSprite, arr = []
        for (var i = 0; i < starSprite.length; i++){
            if (starSprite[i] ) {
                var _stoneType = starSprite[i].getComponent("block")._stoneType;
                if(_stoneType >= 0 && _stoneType < psconfig.rType){
                    arr.push(starSprite[i])
                }
            }
        }
        arr = this.shuffle(arr);

        var count = 0
        for (var i = 0; i < starSprite.length; i++){
            if (starSprite[i]) {
                var _stoneType = starSprite[i].getComponent("block")._stoneType;
                if(_stoneType >= 0 && _stoneType < psconfig.rType){
                    starSprite[i] = arr[count]
                    count++
                }
            }
        }

        for (var i = 0; i < psconfig.matrixRow; i++){
            for (var j = 0; j < psconfig.matrixCol; j++){
                if (gameData.starMatrix[i][j] >= 0 && gameData.starMatrix[i][j] < psconfig.rType) {
                    var indexValue = utils.indexValue(i, j)
                    var m = gameData.starSprite[indexValue]
                    var block = m.getComponent("block")
                    var grid2Pos = utils.grid2Pos(i, j);
                    m.runAction(cc.moveTo(0.5, grid2Pos))
                    gameData.starMatrix[i][j] = block._stoneType
                    block.changeStoneGrid(i, j)
                }
            }
        }
        this.handleCanCombineTool()
        this.resumeOriginView()
        /* gameData.bestLevel > 0 && */ this.showTipsView()
        if(utils.gameOver(gameData.starMatrix)){
            cc.systemEvent.emit("SHUFFLE_TIPS"),
            this.scheduleOnce(function() {
                this.shuffleStarMatrix()
            }, 1.5)
        }else{
            cc.systemEvent.emit("GAMEMASK_CONTROL", {
                order: 2
            })
        }
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
            a = utils.grid2Pos(n.endGrid.x, n.endGrid.y)
            t.parent = this.node
            t.position = o
            t.zIndex = 1000
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
        return e || false
    },
    executePassEffect: function() {
        var e = this.getGameTool();
        this.passIndex = true
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
                this.shouldVibrate = false
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
        var _this = this, bool = false
        for (var o = 0; o < e.length; o++){
            if (e[o] > 0) {
                bool = true;
                break
            }
        }
        if (e.length <= 0 || !bool){
            cc.systemEvent.emit("GAMEMASK_CONTROL", {
                order: 2
            })
            this.guideNode.active = true;
            return
        }
        var c = utils.getRandomBlockPosition(gameData.starMatrix, 3);
        this.isMoving = true;
        for (var func = function(i) {
            _this.scheduleOnce(function() {
                if (e[i] > 0) {
                    var n = e[i];
                    if(!t){
                        gameData.gameToolList[i] -= n
                    }
                    var blockComp = this.getNodeBygGrid(c[i])
                    var nodeBlock = blockComp.node;
                    nodeBlock.scale = 1.2
                    nodeBlock.runAction(cc.scaleTo(0.5, 1))
                    blockComp.toolCombine.getComponent("toolcombine_effect").effect()
                    gameData.starMatrix[c[i].x][c[i].y] = 8 + i
                    blockComp.changeStoneNum(8 + i)
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
        func(d)
    },

    createRandomTargetList: function() {
        var possibleTargets = [0, 1, 2, 3, 4, 5, 20, 21];
        var targetList = [];
        var selectedIndices = [];
        // Determine the number of targets based on the current level
        var numTargets = this.currentLevel >= 60 ? 4 : 3;
        while (targetList.length < numTargets) {
            // Generate a random index
            var randomIndex = Math.floor(Math.random() * possibleTargets.length);
            // Check if the index is already selected
            if (!this.isContain(selectedIndices, randomIndex)) {
                selectedIndices.push(randomIndex);
                // Generate the target value
                var randomValue = 15 + Math.floor(Math.random() * possibleTargets.length);
                var target = [];
                target[0] = possibleTargets[randomIndex];
                target[1] = target[0] >= 4 ? randomValue - 10 : randomValue; 
                // Add the target to the target list
                targetList.push(target);
            }
        }   
        // Sort the target list by the first element of each target
        targetList.sort(function(a, b) {
            return a[0] - b[0];
        });
        return targetList;
    },
    createHinderList: function(e) {
        var hinderList = [12, 0, 0]; // Initialize the hinder list with default values
        var count = 20; // Start count at 20
    
        // Loop through the hinderList starting from index 1 to 2
        for (var i = 1; i < 3; i++) {
            var index = -1; // Initialize index to -1 (indicating not found)   
            // Loop through the input array `e` to find a matching element
            for (var j = 0; j < e.length; j++) {
                if (e[j][0] == count) {
                    index = j;
                    break;
                }
            }  
            // If a matching element was found, update the hinderList
            if (index >= 0) {
                hinderList[i] = e[index][1];
            }   
            count++; // Increment the count for the next iteration
        }  
        return hinderList; // Return the generated hinder list
    },
    createStep: function() {
        return 35 + Math.floor(15 * Math.random())
    },
    isContain: function(e, t) {
        for (var i = false, s = 0; s < e.length; s++)
            if (t == e[s]) {
                i = true;
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
        e.zIndex = 1000
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
                cc.director.container.removeBlock(e),
                cc.director.container.effectRemoveCol(e);
                //cc.director.container.normalCubeBreakAnimation(e)
                //cc.director.container.removeBlock(e)
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
            }else if (10 == a._stoneType) {
                if (a.isEffect)
                    return void (a.isEffect = false);
                a.isEffect = true;
                var c = {
                    index: a._stoneType,
                    type: a.discoType,
                    grid: e,
                    from: 1
                };
                cc.systemEvent.emit("GAME_TOOL", {
                    detail: c
                })
            }else{
                if(22 == a._stoneType){
                    a.bombRatio--,
                    a.cubesUnlock(),
                    cc.director.container.vineBreakEffect(e)
                }else if(23 == a._stoneType || 24 == a._stoneType || 25 == a._stoneType){  
                    a.bombRatio--,
                    a.bombRatio <= 0 ? (cc.director.container.woodCubeBreakEffect(e),
                    cc.director.container.removeBlock(e),
                    a.boxCubesDisappear()) : (a.boxHit(),
                    cc.director.container.woodBoxBreakEffect(e))
                }else if(26 == a._stoneType){
                    a.bombRatio--,
                    a.bombRatio < 0 ? (cc.director.container.flowerCollectAnimation(e),
                    a.collectFlower()) : (a.flowerHit(),
                    cc.director.container.flowerOpenEffect(e))
                }else if(27 == a._stoneType){
                    a.bombRatio--,
                    a.bombRatio <= 0 ? cc.director.container.windmillDisappearEffect(e) : (a.hitWindmill(),
                    cc.director.container.windmillBreakEffect(e, a.bombRatio))
                }else if(a._stoneType >= 29 && a._stoneType <= 36){
                    a.bombRatio--,
                    a.bombRatio <= 0 && (cc.director.container.colorCubeBreakEffect(e),
                    cc.director.container.removeBlock(e),
                    a.boxCubesDisappear())
                }else if( 37 == a._stoneType){
                    a.bombRatio--,
                    a.bombRatio <= 0 ? this.ladyBugCubesBreakEffect(e, a.bombRatio) : (this.ladyBugCubesBreakEffect(e, a.bombRatio),
                    a.hitLadyBugCubes())
                }else if(39 == a._stoneType){
                    a.bombRatio--,
                    a.bombRatio <= 0 && (cc.director.container.rockStoneCubeBreakEffect(e),
                    cc.director.container.removeBlock(e),
                    a.boxCubesDisappear())
                }
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
            cc.director.SoundManager.playSound("boom1")
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
        var rock = this.node.getChildByName("rock")
        var line = this.node.getChildByName("line");
        if(rock || line || cc.director.needWait){
            cc.director.isrunning = 1,
            this.scheduleOnce(function() {
                this.whichTimeTampRow("\u9012\u5f52")
            }, 0.2)
        }else{
            this.tampRows()
            cc.director.isrunning = 0
            this.tempPos && (this.tempPos = null)
            this.tempLadyBugList && (this.tempLadyBugList = null)
            this.flowerTempList && (this.flowerTempList = null)
        }
    },
   
    noticeWhichCubesCombine: function() {
        // hiện tips
        var e = utils.noticeLongestList(gameData.starMatrix);
        if (e){
            for (var i = 0; i < e.length; i++) {
                var pos = e[i]
                var indexValue = utils.indexValue(pos.x, pos.y)
                var block = gameData.starSprite[indexValue];
                this.noticeList.push(block)
                if (block) {
                    block.zIndex = 200
                    block.getChildByName("outLine").active = true;
                    var action = cc.sequence(
                        cc.scaleTo(0.5, 0.95), 
                        cc.scaleTo(1, 1.05), 
                        cc.scaleTo(0.5, 1)
                    ).repeatForever(); 
              
                    action.tag = 10
                    block.runAction(action)
                }
            }
        }
    },
    noticePlayerTimeCount: function() {
        if(this.noticeCount > 0){
            this.noticeCount--
            if(0 == this.noticeCount){
                this.unschedule(this.noticePlayerTimeCount)
                this.noticeWhichCubesCombine()
            }
        }
    },
    canclePlayerNotice: function() {
        if (this.noticeList && this.noticeList.length > 0){
            for (var i = 0; i < this.noticeList.length; i++) {
                var block = this.noticeList[i];
                if(block){
                    block.getChildByName("outLine").active = false
                    block.stopActionByTag(10)
                    block.scale = 1
                    block.zIndex = block.getComponent("block")._xPos
                }
            }
        }
        this.noticeList = []
        this.noticeCount = 5
        if(cc.director.getScheduler().isScheduled(this.noticePlayerTimeCount, this) || this.target.isGameEnd){
            this.target.isGameEnd && this.unschedule(this.noticePlayerTimeCount)
        }else{
            this.schedule(this.noticePlayerTimeCount, 1)
        }
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
