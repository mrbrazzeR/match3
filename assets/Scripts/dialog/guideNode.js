
import utils  from "../utils"
import gameData from "../gameData"
var arrBtn = ["btn1", "btn2", "btn3", "btn4"];
cc.Class({
    extends: cc.Component,

    properties: {
        goal: cc.Node,
        finger: cc.Node,
        wordList: cc.Sprite,
        createList: [cc.SpriteFrame],
        funcList: [cc.SpriteFrame],
        explain: cc.Node,
        superWord: cc.SpriteFrame,
        balloonWord: cc.SpriteFrame,
        nutsWord: cc.SpriteFrame,
        firstWord: cc.SpriteFrame,
        vineWord: cc.SpriteFrame,
        toolList: cc.Node,
        arrow: cc.Node,
        playerTool_explain: cc.Node,
        playerToolList: [cc.SpriteFrame],
        hinderWordList: [cc.SpriteFrame],
        prefab_bubble: cc.Prefab
    },

    onLoad: function() {
        this.currentStep = -1
        /* cc.systemEvent.on("EXCUTE_GUIDE_STEP", this.accordingLevelShowGuide, this)
        cc.systemEvent.on("PLAYER_TOOL_GUIDE", this.guide_playerTool, this)
        cc.systemEvent.on("WINDMILL_SECOND_GUIDE", this.guideWindmill_again, this)
        cc.systemEvent.on("STATUE_SECOND_GUIDE", this.guide_thirteen, this)  */
    },
  
    guide_one: function() {
        var e = this.node.getChildByName("one_step");
        this.currentStep = 1,
        e.active = !0;
        var t = this.node.convertToNodeSpaceAR(this.goal.parent.convertToWorldSpaceAR(this.goal.position))
        var i = cc.instantiate(this.goal);
        i.parent = e,
        i.position = t,
        i.removeComponent("target");
        var s = this.node.getChildByName("one_step").getChildByName("arrow");
        s.x = this.goal.x + this.goal.width / 2,
        s.scale = 1,
        s.runAction(cc.sequence(cc.scaleTo(1, .95), cc.scaleTo(1, 1.05)).repeatForever())
    },
    one_continue: function() {
        cc.director.SoundManager.playSound("btnEffect")
        this.node.getChildByName("one_step").active = !1

        gameData.guide_step.one_step = "yes"
      
        this.guide_two()
    },
    showClickCubeList: function(e, t, n) {
        if (t && !(t.length <= 0)) {
            e.active = !0,
            n.active = !0;
            for (var a = e.getChildByName("container"), o = 0; o < t.length; o++) {
                var c = t[o]
                  , r = utils.indexValue(c.x, c.y)
                  , d = gameData.starSprite[r]
                  , l = d.parent.convertToWorldSpaceAR(d.position)
                  , h = cc.instantiate(d);
                if (h.position = a.convertToNodeSpaceAR(l),
                h.runAction(cc.sequence(cc.scaleTo(1, .95), cc.scaleTo(1, 1.05)).repeatForever()),
                a.addChild(h),
                this.addTouchEvent(h),
                1 == o) {
                    var p = e.convertToNodeSpaceAR(l);
                    n.position = cc.v2(p.x + 80, p.y - 80)
                }
            }
            this.fingerScale()
        }
    },
    showTool: function(e, t, n, a) {
        if (t && 0 != t.length) {
            e.active = !0,
            n.active = !0;
            for (var o = e.getChildByName("container"), c = 0; c < t.length; c++) {
                var r = t[c]
                  , d = utils.indexValue(r.x, r.y)
                  , l = gameData.starSprite[d]
                  , h = l.parent.convertToWorldSpaceAR(l.position)
                  , p = cc.instantiate(l);
                if (a && (cc.instantiate(this.prefab_bubble).parent = p),
                p.position = o.convertToNodeSpaceAR(h),
                p.runAction(cc.sequence(cc.scaleTo(1, .95), cc.scaleTo(1, 1.05)).repeatForever()),
                o.addChild(p),
                this.addTouchEvent(p),
                0 == c) {
                    var m = e.convertToNodeSpaceAR(h);
                    n.position = cc.v2(m.x + 80, m.y - 80),
                    this.fingerScale()
                }
            }
        }
    },
    tool_display: function() {
        var e = this.node.getChildByName("tool_display");
        this.currentStep = 4;
        var t = cc.director.container.getGameTool();
        if(t){
            if(10 == gameData.starMatrix[t.x][t.y])  {
                gameData.guide_step.three_step = "yes"
                if(cc.director.FbManager.IS_FB_INSTANT){
                    cc.director.FbManager.updateDataFB({
                        guide_step: JSON.stringify(gameData.guide_step)             
                    })
                }else{
                    cc.log("guide_step")
                    cc.sys.localStorage.setItem("guide_step", JSON.stringify(gameData.guide_step))
                }
            }
            this.showTool(e, [t], this.finger)
            this.explain.getChildByName("word").getComponent(cc.Sprite).spriteFrame = this.funcList[gameData.bestLevel - 1],
            this.explain.position = cc.v2(0, this.finger.y + 400),
            this.explain.active = !0
        }
    },
    guide_two: function() {
        var e = this.node.getChildByName("two_step");
        this.currentStep = 2;
        var t = utils.canRemoveList(gameData.starMatrix);
        this.showClickCubeList(e, t, this.finger),
        this.explain.getChildByName("word").getComponent(cc.Sprite).spriteFrame = this.firstWord,
        this.explain.position = cc.v2(0, this.finger.y + 400),
        this.explain.active = !0
    },
    guide_three: function() {
        var e = utils.chooseRemoveList(gameData.starMatrix).pop();
        if (e) {
            var t = this.node.getChildByName("three_step");
            this.currentStep = 3,
            this.showClickCubeList(t, e, this.finger),
            this.explain.position = cc.v2(0, this.finger.y + 400),
            this.explain.active = !0,
            this.explain.getChildByName("word").getComponent(cc.Sprite).spriteFrame = this.createList[gameData.bestLevel - 1]
        }
    },
    guide_four: function() {
        var e = this.node.getChildByName("tool_display")
        var t = utils.judgeNearNode(gameData.starMatrix);
        if(t.length > 0){
            this.currentStep = 4
            this.showTool(e, t, this.finger)
            this.explain.getChildByName("word").getComponent(cc.Sprite).spriteFrame = this.superWord
            this.explain.position = cc.v2(0, this.finger.y + 400)
            this.explain.active = !0
        
            gameData.guide_step.four_step = "yes"
            if(cc.director.FbManager.IS_FB_INSTANT){
                cc.director.FbManager.updateDataFB({
                    guide_step: JSON.stringify(gameData.guide_step)             
                })
            }else{
                cc.log("guide_step")
                cc.sys.localStorage.setItem("guide_step", JSON.stringify(gameData.guide_step))
            }
        }

        
    },
    guide_five: function() {
        var e = this.node.getChildByName("tool_display")
          , t = utils.noticeLongestList(gameData.starMatrix)
          , n = utils.getBalloonClearList(gameData.starMatrix, t, 21)
          , a = [].concat(t, n);
        n && n.length > 0 && a.length > 0 && (this.currentStep = 5,
        this.showTool(e, a, this.finger),
        this.explain.getChildByName("word").getComponent(cc.Sprite).spriteFrame = this.balloonWord,
        this.explain.position = cc.v2(0, this.finger.y + 400 + 100),
        this.explain.active = !0)
    },
    guide_six: function() {
        var e = this.node.getChildByName("tool_display")
          , t = utils.noticeLongestList(gameData.starMatrix)
          , n = utils.getBalloonClearList(gameData.starMatrix, t, 20);
        n && n.length > 0 && (this.currentStep = 6,
        this.showTool(e, n, this.finger),
        this.playerTool_explain.getChildByName("word").getComponent(cc.Sprite).spriteFrame = this.nutsWord,
        this.playerTool_explain.position = cc.v2(0, this.finger.y + 400),
        this.finger.active = !1,
        this.arrow.active = !0,
        this.arrow.position = cc.v2(this.finger.x, this.finger.y + 200),
        this.arrow.scale = .5,
        this.arrow.runAction(cc.sequence(cc.scaleTo(.5, .55), cc.scaleTo(.5, .45)).repeatForever()),
        this.playerTool_explain.active = !0)
    },
    guide_seven: function() {
        var e = this.node.getChildByName("tool_display")
          , t = utils.getCurrentMapVineList(gameData.starMatrix);
        t && t.length > 0 && (this.currentStep = 7,
        this.showTool(e, t, this.finger),
        this.playerTool_explain.getChildByName("word").getComponent(cc.Sprite).spriteFrame = this.vineWord,
        this.playerTool_explain.position = cc.v2(0, this.finger.y + 400),
        this.finger.active = !1,
        this.playerTool_explain.active = !0)
    },
    guide_eight: function() {
        var e = this.node.getChildByName("tool_display")
          , t = utils.judgeCurrentMapHinderByType(gameData.starMatrix, 25);
        t && t.length > 0 && (this.currentStep = 8,
        this.showTool(e, t, this.finger),
        this.playerTool_explain.getChildByName("word").getComponent(cc.Sprite).spriteFrame = this.hinderWordList[0],
        this.playerTool_explain.position = cc.v2(0, this.finger.y + 400 + 20),
        this.finger.active = !1,
        this.playerTool_explain.active = !0)
    },
    guide_nine: function() {
        var e = this.node.getChildByName("tool_display")
          , t = utils.judgeCurrentMapHinderByType(gameData.starMatrix, 26);
        t && t.length > 0 && (this.currentStep = 9,
        this.showTool(e, t, this.finger),
        this.playerTool_explain.getChildByName("word").getComponent(cc.Sprite).spriteFrame = this.hinderWordList[1],
        this.playerTool_explain.position = cc.v2(0, this.finger.y + 400 + 20),
        this.finger.active = !1,
        this.playerTool_explain.active = !0)
    },
    guide_ten: function() {
        var e = this.node.getChildByName("tool_display")
          , t = utils.judgeCurrentMapHinderByType(gameData.starMatrix, 27);
        t && t.length > 0 && (this.currentStep = 10,
        this.showTool(e, t, this.finger),
        this.playerTool_explain.getChildByName("word").getComponent(cc.Sprite).spriteFrame = this.hinderWordList[2],
        this.playerTool_explain.position = cc.v2(0, this.finger.y + 400 + 20),
        this.finger.active = !1,
        this.playerTool_explain.active = !0)
    },
    guideWindmill_again: function(e) {
        if(cc.director.container.currentLevel != gameData.bestLevel){
            return
        }
        var t = this.node.getChildByName("tool_display")
          , i = e.windmillList;
        i && i.length > 0 && (this.currentStep = 11,
        this.showTool(t, i, this.finger),
        this.playerTool_explain.getChildByName("word").getComponent(cc.Sprite).spriteFrame = this.hinderWordList[3],
        this.playerTool_explain.position = cc.v2(0, this.finger.y + 400 + 20),
        this.finger.active = !1,
        this.playerTool_explain.active = !0)
    },
    guide_twelve: function() {
        var e = this.node.getChildByName("tool_display")
          , t = utils.noticeLongestList(gameData.starMatrix);
        t && t.length > 0 && (this.currentStep = 12,
        this.showTool(e, t, this.finger),
        this.explain.getChildByName("word").getComponent(cc.Sprite).spriteFrame = this.hinderWordList[4],
        this.explain.position = cc.v2(0, this.finger.y + 400 + 100),
        this.explain.active = !0,
        this.finger.active = !0)
    },
    guide_thirteen: function() {
        if(cc.director.container.currentLevel != gameData.bestLevel){
            return
        }
        this.currentStep = 13;
        var e = this.node.getChildByName("tool_display");
        e.active = !0,
        e.getChildByName("container").removeAllChildren(),
        this.playerTool_explain.getChildByName("word").getComponent(cc.Sprite).spriteFrame = this.hinderWordList[5],
        this.playerTool_explain.position = cc.v2(0, 0),
        this.finger.active = !1,
        this.playerTool_explain.active = !0
    },
    guide_fourteen: function() {
        var e = this.node.getChildByName("tool_display")
          , t = utils.judgeCurrentMapHinderByType(gameData.starMatrix, 37);
        t && t.length > 0 && (this.currentStep = 14,
        this.showTool(e, t, this.finger),
        this.playerTool_explain.getChildByName("word").getComponent(cc.Sprite).spriteFrame = this.hinderWordList[6],
        this.playerTool_explain.position = cc.v2(0, this.finger.y + 400 + 20),
        this.finger.active = !1,
        this.playerTool_explain.active = !0)
    },
    guide_fifteen: function() {
        var e = this.node.getChildByName("tool_display")
          , t = utils.noticeLongestList(gameData.starMatrix);
        t && t.length > 0 && (this.currentStep = 15,
        this.showTool(e, t, this.finger, !0),
        this.explain.getChildByName("word").getComponent(cc.Sprite).spriteFrame = this.hinderWordList[7],
        this.playerTool_explain.position = cc.v2(0, this.finger.y + 400 + 100),
        this.finger.active = !1,
        this.explain.active = !0)
    },
    guide_sixteen: function() {
        var e = this.node.getChildByName("tool_display")
          , t = utils.judgeCurrentMapHinderByType(gameData.starMatrix, 39);
        t && t.length > 0 && (this.currentStep = 16,
        this.showTool(e, t, this.finger),
        this.playerTool_explain.getChildByName("word").getComponent(cc.Sprite).spriteFrame = this.hinderWordList[8],
        this.playerTool_explain.position = cc.v2(0, this.finger.y + 400 + 20),
        this.finger.active = !1,
        this.playerTool_explain.active = !0)
    },
    guide_seventeen: function() {
        var e = this.node.getChildByName("tool_display")
          , t = utils.judgeCurrentMapHinderByType(gameData.starMatrix, 29);
        console.log(t, "415"),
        t && t.length > 0 && (this.currentStep = 17,
        this.showTool(e, t, this.finger),
        this.playerTool_explain.getChildByName("word").getComponent(cc.Sprite).spriteFrame = this.hinderWordList[9],
        this.playerTool_explain.position = cc.v2(0, this.finger.y + 400 + 20),
        this.finger.active = !1,
        this.playerTool_explain.active = !0)
    },
    guide_playerTool: function(e) {
        if(cc.director.container.currentLevel != gameData.bestLevel){
            return
        } 
        var t = e.num - 1;
        this.playerType = t;
        var i = this.toolList.getChildByName(arrBtn[t]);
        this.playerTool_explain.getChildByName("word").getComponent(cc.Sprite).spriteFrame = this.playerToolList[t];
        var s = this.node.getChildByName("tool_display");
        s.active = !0,
        this.playerTool_explain.active = !0,
        this.currentStep = 4;
        var a = s.convertToNodeSpaceAR(i.parent.convertToWorldSpaceAR(i.position))
          , o = cc.instantiate(i);
        o.parent = s,
        o.position = a,
        o.removeComponent(cc.Widget),
        o.removeComponent(cc.Button),
        this.arrow.position = cc.v2(o.position.x, o.position.y + 170),
        this.arrow.active = !0,
        this.arrow.runAction(cc.sequence(cc.scaleTo(.5, .95), cc.scaleTo(.5, 1.05)).repeatForever())
    },
    closePlayerToolGuide: function() {
        this.node.getChildByName("tool_display").active = false;
        this.playerTool_explain.active = false;
        this.finger.active = false;
        // Kiểm tra bước hiện tại và lưu trạng thái hoàn thành tương ứng
        switch (this.currentStep) {
            case 6:
                this.arrow.stopAllActions();
                this.arrow.active = false;
                gameData.guide_step.six_step = "yes"
                if(cc.director.FbManager.IS_FB_INSTANT){
                    cc.director.FbManager.updateDataFB({
                        guide_step: JSON.stringify(gameData.guide_step)             
                    })
                }else{
                    cc.sys.localStorage.setItem("guide_step", JSON.stringify(gameData.guide_step))
                }
                break;
            case 7:
                gameData.guide_step.seven_step = "yes"
                if(cc.director.FbManager.IS_FB_INSTANT){
                    cc.director.FbManager.updateDataFB({
                        guide_step: JSON.stringify(gameData.guide_step)             
                    })
                }else{
                    cc.sys.localStorage.setItem("guide_step", JSON.stringify(gameData.guide_step))
                }
                break;
            case 8:
                gameData.guide_step.eight_step = "yes"
                if(cc.director.FbManager.IS_FB_INSTANT){
                    cc.director.FbManager.updateDataFB({
                        guide_step: JSON.stringify(gameData.guide_step)             
                    })
                }else{
                    cc.sys.localStorage.setItem("guide_step", JSON.stringify(gameData.guide_step))
                }
                break;
            case 9:
                gameData.guide_step.nine_step = "yes"
                if(cc.director.FbManager.IS_FB_INSTANT){
                    cc.director.FbManager.updateDataFB({
                        guide_step: JSON.stringify(gameData.guide_step)             
                    })
                }else{
                    cc.sys.localStorage.setItem("guide_step", JSON.stringify(gameData.guide_step))
                }
                break;
            case 10:
                gameData.guide_step.ten_step = "yes"
                if(cc.director.FbManager.IS_FB_INSTANT){
                    cc.director.FbManager.updateDataFB({
                        guide_step: JSON.stringify(gameData.guide_step)             
                    })
                }else{
                    cc.sys.localStorage.setItem("guide_step", JSON.stringify(gameData.guide_step))
                }
                break;
            case 11:
                gameData.guide_step.eleven_step = "yes"
                if(cc.director.FbManager.IS_FB_INSTANT){
                    cc.director.FbManager.updateDataFB({
                        guide_step: JSON.stringify(gameData.guide_step)             
                    })
                }else{
                    cc.sys.localStorage.setItem("guide_step", JSON.stringify(gameData.guide_step))
                }
                break;
            case 13:
                gameData.guide_step.thirteen_step = "yes"
                if(cc.director.FbManager.IS_FB_INSTANT){
                    cc.director.FbManager.updateDataFB({
                        guide_step: JSON.stringify(gameData.guide_step)             
                    })
                }else{
                    cc.sys.localStorage.setItem("guide_step", JSON.stringify(gameData.guide_step))
                }
                break;
            case 14:
                gameData.guide_step.fourteen_step = "yes"
                if(cc.director.FbManager.IS_FB_INSTANT){
                    cc.director.FbManager.updateDataFB({
                        guide_step: JSON.stringify(gameData.guide_step)             
                    })
                }else{
                    cc.sys.localStorage.setItem("guide_step", JSON.stringify(gameData.guide_step))
                }
                break;
            case 16:
                gameData.guide_step.sixteen_step = "yes"
                if(cc.director.FbManager.IS_FB_INSTANT){
                    cc.director.FbManager.updateDataFB({
                        guide_step: JSON.stringify(gameData.guide_step)             
                    })
                }else{
                    cc.sys.localStorage.setItem("guide_step", JSON.stringify(gameData.guide_step))
                }
                break;
            case 17:
                gameData.guide_step.seventeen_step = "yes"
                if(cc.director.FbManager.IS_FB_INSTANT){
                    cc.director.FbManager.updateDataFB({
                        guide_step: JSON.stringify(gameData.guide_step)             
                    })
                }else{
                    cc.sys.localStorage.setItem("guide_step", JSON.stringify(gameData.guide_step))
                }
                break;
            default:         
                cc.director.SoundManager.playSound("btnEffect");
                if (this.playerType) {
                    cc.sys.localStorage.setItem("playerIndex" + this.playerType, "yes");
                }
                this.arrow.stopAllActions();
                this.arrow.active = false;
                break;
        }
    },
    fingerScale: function() {
        this.finger.runAction(cc.sequence(cc.scaleTo(1, .9), cc.scaleTo(1, 1.1)).repeatForever())
    },
    addTouchEvent: function(e) {
        e.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this)
    },
    onTouchStart: function(e) {
        e.target.getComponent("block").onTouchStart()
        if (2 == this.currentStep){
            this.node.getChildByName("two_step").active = !1
            this.finger.active = !1
            gameData.guide_step.two_step = "yes"
            if(cc.director.FbManager.IS_FB_INSTANT){
                cc.director.FbManager.updateDataFB({
                    guide_step: JSON.stringify(gameData.guide_step)             
                })
            }else{
                cc.log("guide_step")
                cc.sys.localStorage.setItem("guide_step", JSON.stringify(gameData.guide_step))
            }
            this.explain.active = !1
        }else if (3 == this.currentStep) {
            var t = this.node.getChildByName("three_step");
            t.active = !1,
            this.finger.active = !1,
            t.getChildByName("container").removeAllChildren(),
            this.explain.active = !1,
            cc.systemEvent.emit("GAMEMASK_CONTROL", {
                order: 1
            }),
            setTimeout(function() {
                this.tool_display(),
                cc.systemEvent.emit("GAMEMASK_CONTROL", {
                    order: 2
                })
            }
            .bind(this), 1500)
        } else{
            if (this.currentStep === 4) {
                this.node.getChildByName("tool_display").active = false;
                this.finger.active = false;
                this.explain.active = false;
            } else if (this.currentStep === 5) {
                this.node.getChildByName("tool_display").active = false;
                this.finger.active = false;
                this.explain.active = false;
             
                gameData.guide_step.five_step = "yes"
                if(cc.director.FbManager.IS_FB_INSTANT){
                    cc.director.FbManager.updateDataFB({
                        guide_step: JSON.stringify(gameData.guide_step)             
                    })
                }else{
                    cc.sys.localStorage.setItem("guide_step", JSON.stringify(gameData.guide_step))
                    cc.log("guide_step")
                }
            } else if (this.currentStep === 12) {
                this.node.getChildByName("tool_display").active = false;
                this.finger.active = false;
                this.explain.active = false;
        
                gameData.guide_step.twelve_step = "yes"
                if(cc.director.FbManager.IS_FB_INSTANT){
                    cc.director.FbManager.updateDataFB({
                        guide_step: JSON.stringify(gameData.guide_step)             
                    })
                }else{
                    cc.sys.localStorage.setItem("guide_step", JSON.stringify(gameData.guide_step))
                    cc.log("guide_step")
                }
            } else if (this.currentStep === 15) {
                this.node.getChildByName("tool_display").active = false;
                this.finger.active = false;
                this.explain.active = false;
       
                gameData.guide_step.fifteen_step = "yes"
                if(cc.director.FbManager.IS_FB_INSTANT){
                    cc.director.FbManager.updateDataFB({
                        guide_step: JSON.stringify(gameData.guide_step)             
                    })
                }else{
                    cc.sys.localStorage.setItem("guide_step", JSON.stringify(gameData.guide_step))
                    cc.log("guide_step")
                }
            }
        }
    },
    accordingLevelShowGuide: function() {
        if(cc.director.container.currentLevel != gameData.bestLevel){
            return
        }
        switch (gameData.bestLevel) {
        case 0:
            gameData.guide_step.one_step || this.guide_one();
            break;
        case 1:
        case 2:
        case 3:
            gameData.guide_step.three_step || this.guide_three();
            break;
        case 4:
            gameData.guide_step.four_step || this.guide_four();
            break;
        case 5:
            gameData.guide_step.five_step || this.guide_five();
            break;
        case 7:
            gameData.guide_step.eight_step || this.guide_eight();
            break;
        case 14:
            gameData.guide_step.six_step || this.guide_six();
            break;
        case 19:
            gameData.guide_step.seven_step || this.guide_seven();
            break;
        case 24:
            gameData.guide_step.fourteen_step || this.guide_fourteen();
            break;
        case 39:
            gameData.guide_step.twelve_step || this.guide_twelve();
            break;
        case 59:
            gameData.guide_step.ten_step || this.guide_ten();
            break;
        case 89:
            gameData.guide_step.fifteen_step || this.guide_fifteen();
            break;
        case 129:
            gameData.guide_step.nine_step || this.guide_nine();
            break;
        case 179:
            gameData.guide_step.sixteen_step || this.guide_sixteen();
            break;
        case 229:
            gameData.guide_step.seventeen_step || this.guide_seventeen()
        }
    },
    
});
