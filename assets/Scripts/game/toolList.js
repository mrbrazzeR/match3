var unlockBtnList = [1, 5, 10, 15];

import gameData from "../gameData"

cc.Class({
    extends: cc.Component,

    properties: {
        btn1: cc.Node,
        btn2: cc.Node,
        btn3: cc.Node,
        btn4: cc.Node,
        lockList: [cc.SpriteFrame],
        unlockList: [cc.SpriteFrame],
        lockIcon: cc.SpriteFrame
    },

    onLoad: function() {
        this.focusIndex = -1,
        cc.director.changeList = [],
        cc.systemEvent.on("CLEAR_BTN", this.clearBtnFocusEffect, this),
        cc.systemEvent.on("UPDATE_TOOL", this.updateToolCountDisplay, this),
        cc.systemEvent.on("BUY_TOOL", this.buyTool, this),
        cc.systemEvent.on("UPDATE_STATUS", this.loadBtnstatu, this),
        cc.systemEvent.on("LIMITED_BTN", this.limitedUnlockTool, this),
        cc.systemEvent.on("JUDGELEVEL", this.judgeLevel, this),
        this.initBtnName()
    },
    start: function() {
        this.lockedAllPlayerTool(),
        this.unlockPlayerTool()
    },
    initBtnName: function() {
        this.btn1.name = "btn1",
        this.btn2.name = "btn2",
        this.btn3.name = "btn3",
        this.btn4.name = "btn4"
    },
    updateToolCost: function(e) {
        var t = "btn" + e;
        this.node.getChildByName(t).getChildByName("priceNode").getChildByName("price").getComponent(cc.Label).string = "" + this.toolCost[e - 1]
    },
    updateToolBtnStatus: function(e, t) {
        var i = "btn" + e
          , s = this.node.getChildByName(i);
        s.getComponent(cc.Button).interactable = !1,
        s.getComponent(cc.Sprite).spriteFrame = 1 == t ? this.lockList[e - 1] : this.lockList[4]
    },
    unlockToolbtn: function(e) {
        var t = "btn" + e
          , i = this.node.getChildByName(t);
        i.getComponent(cc.Button).interactable = !0,
        i.getComponent(cc.Sprite).spriteFrame = this.unlockList[e - 1]
    },
    initToolDisplay: function() {

        for (var e = 1; e < 5; e++)
            cc.systemEvent.emit("UPDATE_TOOL", {
                type: e
            })
    },
    updateToolCountDisplay: function(e) {

        var toolData = e;
        var buttonName = "btn" + toolData.type;
        var changeAmount = toolData.number ? toolData.number : 1;
        var toolButton = this.node.getChildByName(buttonName);
        var toolCountLabel = toolButton.getChildByName("number").getComponent(cc.Label);   
        if (toolData.statuCode == 1) {
            gameData.game_prop[toolData.type - 1].number += changeAmount;
        } 
        if (toolData.statuCode == 2) {
            gameData.game_prop[toolData.type - 1].number -= changeAmount;
        }
        toolCountLabel.string = "" + gameData.game_prop[toolData.type - 1].number;
        
        var addIcon = toolButton.getChildByName("addIcon");
        if (gameData.game_prop[toolData.type - 1].number <= 0) {
            addIcon.active = true;
            toolCountLabel.node.active = false;
        } else {
            addIcon.active = false;
            toolCountLabel.node.active = true;
        }
        if (toolData.statuCode && toolData.statuCode != 3) {
            gameData.storeGameData();
            cc.log("=====storeGameData=====");
        }
    },
    buyTool: function(e) {
        var t = e.detail.type;
        gameData.starCount >= this.toolCost[t - 1] && (gameData.starCount -= this.toolCost[t - 1],
        gameData.storeGameData(),cc.log("=====storeGameData====="))
    },
    buy_1: function() {
        this.buyTool(1)
    },
    buy_2: function() {
        this.buyTool(2)
    },
    buy_3: function() {
        this.buyTool(3)
    },
    buy_4: function() {
        this.buyTool(4)
    },
    btn1Event: function(e) {
        cc.director.SoundManager.playSound("btnEffect");
        var t = e.target
          , s = t.parent.convertToWorldSpaceAR(t);
        gameData.game_prop[0].number > 0 ? 1 != this.focusIndex ? (-1 != this.focusIndex && this.clearBtnFocusEffect(),
        this.focusIndex = 1,
        this.onFocusEffect(this.btn1),
        cc.director.toolType = 1,
        cc.systemEvent.emit("FUNCTION_EXPLAIN_ON", {
            type: 0,
            itemPos: s
        })) : this.clearBtnFocusEffect() : cc.director.dialogScript.showPlayerShop(1, 2)
    },
    btn2Event: function(e) {
        cc.director.SoundManager.playSound("btnEffect");
        var t = e.target
          , s = t.parent.convertToWorldSpaceAR(t);
        gameData.game_prop[1].number > 0 ? 2 != this.focusIndex ? (-1 != this.focusIndex && this.clearBtnFocusEffect(),
        this.focusIndex = 2,
        this.onFocusEffect(this.btn2),
        cc.director.toolType = 2,
        cc.systemEvent.emit("FUNCTION_EXPLAIN_ON", {
            type: 1,
            itemPos: s
        })) : this.clearBtnFocusEffect() : cc.director.dialogScript.showPlayerShop(2, 2)
    },
    btn3Event: function(e) {
        cc.director.SoundManager.playSound("btnEffect");
        var t = e.target
          , s = t.parent.convertToWorldSpaceAR(t);
        gameData.game_prop[2].number > 0 ? 3 != this.focusIndex ? (-1 != this.focusIndex && this.clearBtnFocusEffect(),
        this.focusIndex = 3,
        this.onFocusEffect(this.btn3),
        cc.director.toolType = 3,
        cc.systemEvent.emit("FUNCTION_EXPLAIN_ON", {
            type: 2,
            itemPos: s
        })) : this.clearBtnFocusEffect() : cc.director.dialogScript.showPlayerShop(3, 2)
    },
    btn4Event: function(e) {
        cc.director.SoundManager.playSound("btnEffect");
        var t = e.target
          , s = t.parent.convertToWorldSpaceAR(t);
        gameData.game_prop[3].number > 0 ? 4 != this.focusIndex ? (-1 != this.focusIndex && this.clearBtnFocusEffect(),
        this.focusIndex = 4,
        this.onFocusEffect(this.btn4),
        cc.director.toolType = 4,
        cc.systemEvent.emit("FUNCTION_EXPLAIN_ON", {
            type: 3,
            itemPos: s
        })) : this.clearBtnFocusEffect() : cc.director.dialogScript.showPlayerShop(4, 2)
    },
    onFocusEffect: function(e) {
        var t = cc.sequence(cc.scaleTo(.5, .9), cc.scaleTo(.5, 1)).repeatForever();
        t.tag = 1,
        e.runAction(t)
    },
    clearBtnFocusEffect: function() {
        var e = this.node.children;
        this.focusIndex - 1 >= 0 && (e[this.focusIndex - 1].stopActionByTag(1),
        e[this.focusIndex - 1].scale = 1,
        this.focusIndex = -1,
        cc.director.toolType = -1)
    },
    getUnlockBtnList: function(e) {
        for (var t, i = [], n = 0; n < unlockBtnList.length; n++)
            e >= unlockBtnList[n] && (t = n + 1,
            i.push(t));
        return i
    },
    loadBtnstatu: function() {
        for (var t = this.getUnlockBtnList(gameData.bestLevel), s = 0; s < t.length; s++)
            this.unlockToolbtn(t[s])
    },
    limitedUnlockTool: function() {
        for (var t = this.getUnlockBtnList(gameData.bestLevel), s = 0; s < t.length; s++)
            this.updateToolBtnStatus(t[s], 1)
    },
    lockedAllPlayerTool: function() {
        for (var e = 1; e < 5; e++) {
            var t = "btn" + e
              , i = this.node.getChildByName(t);
            i.getChildByName("number").active = !1,
            i.getComponent(cc.Button).interactable = !1,
            i.getComponent(cc.Sprite).spriteFrame = this.lockIcon,
            i.getChildByName("lockLevel").active = !0
        }
    },
    unlockPlayerTool: function() {
        var arrBtn = ["btn1", "btn2", "btn3", "btn4"];   
   
        if (gameData.bestLevel < 41){
            for (var i = 0; i < arrBtn.length; i++) {
                var name = arrBtn[i];
                if(gameData.toolList[name]){
                    this.changeBtnStatus(i + 1)
                }
            }
        }else{
            for (var n = 0; n < arrBtn.length; n++) {
                var a = arrBtn[n]
                var o = this.node.getChildByName(a);
                o.getChildByName("number").active = !0,
                o.getComponent(cc.Button).interactable = !0,
                o.getComponent(cc.Sprite).spriteFrame = this.unlockList[n],
                o.getChildByName("lockLevel").active = !1,
                cc.systemEvent.emit("UPDATE_TOOL", {
                    type: n + 1
                })
            }
        }
    },
    changeBtnStatus: function(e) {
        var t = "btn" + e
        var i = this.node.getChildByName(t);
        gameData.toolList[t] && (i.getChildByName("number").active = !0,
        i.getComponent(cc.Button).interactable = !0,
        i.getComponent(cc.Sprite).spriteFrame = this.unlockList[e - 1],
        i.getChildByName("lockLevel").active = !1,
        cc.systemEvent.emit("UPDATE_TOOL", {
            type: e
        }))
    },
    judgeEjectToolIntroduce: function(e) {
        var t = "btn" + e
          , i = gameData.toolList[t]
          , s = this.node.getChildByName(t);
        if (!i) {
            var n = s.parent.convertToWorldSpaceAR(s.position);
            cc.systemEvent.emit("PLAYER_TOOL_ANIMATION", {
                pos: n,
                num: e
            })    
            gameData.toolList[t] = "yes"
            if(cc.director.FbManager.IS_FB_INSTANT){
                cc.director.FbManager.updateDataFB({
                    toolList: JSON.stringify(gameData.toolList)              
                }) 
            }else{
                cc.sys.localStorage.setItem("toolList", JSON.stringify(gameData.toolList));
                cc.log("toolList")
            }
        }
    },
    judgeLevel: function() {
        9 == gameData.bestLevel ? this.judgeEjectToolIntroduce(1) : 20 == gameData.bestLevel ? this.judgeEjectToolIntroduce(2) : 30 == gameData.bestLevel ? this.judgeEjectToolIntroduce(3) : 40 == gameData.bestLevel && this.judgeEjectToolIntroduce(4)
    },
    
});
