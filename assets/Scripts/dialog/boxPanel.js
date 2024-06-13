import utils  from "../utils"
import gameData from "../gameData"
import psconfig from "../psconfig"

var a = [cc.v2(-160, 180), cc.v2(0, 180), cc.v2(160, 180)],
MAX_LIFE = psconfig.MAX_LIFE;
cc.Class({
    extends: cc.Component,

    properties: {
        toolList: [cc.Node],
        toolBox: cc.Node,
        firework: cc.ParticleSystem,
        btn_claim: cc.Node,
        nameList: [cc.SpriteFrame],
        toolViewList: [cc.SpriteFrame],
        blueBoxStatusView: [cc.SpriteFrame],
        pinkBoxStatusView: [cc.SpriteFrame],
        name_title: cc.Sprite,
        light: cc.Node
    },

    showView: function(e) {
        this.color = e
        this.name_title.spriteFrame = this.nameList[this.color - 1]
        if(gameData.boxPanelData.isFirstTime) {
            this.packageList = this.pakageType(this.randomBoxReward())
        } else{
            this.packageList = this.pakageType([0, 1, 3])
            gameData.boxPanelData.isFirstTime = "no"
        }
        this.node.active = true
        utils.showPromptWithScale(this.node)
        this.changeBoxStatus(0, e)
        this.hideToolList()
        this.toolFromBoxBefore(this.toolBox)
        this.scheduleOnce(function() {
            this.toolFromBoxEffect(this.packageList, e)
        }, 0.7)
        this.btn_claim.active = false
        this.light.runAction(cc.rotateBy(2, 100).repeatForever())
    },
    hideView: function() {
        cc.director.screenDialog.hideAllChild()
        if(1 == this.color){      
            gameData.boxPanelData.blueMark = "no"
            if(cc.director.FbManager.IS_FB_INSTANT){
                cc.director.FbManager.updateDataFB({
                    boxPanelData: JSON.stringify(gameData.boxPanelData)              
                }) 
            }else{
                cc.log("boxPanelData")
                cc.sys.localStorage.setItem("boxPanelData", JSON.stringify(gameData.boxPanelData));
            }
            gameData.currentStar >= 20 ? gameData.currentStar -= 20 : gameData.currentStar = 0
            cc.director.gameManager.mainScreen.getComponent("mainScreen").updateBlueBoxStarNumber()
        }else if (2 == this.color) {  
            if(gameData.pinkMarkData.pinkMark && gameData.pinkMarkData.pinkMark > 0){
                gameData.pinkMarkData.pinkMark--;    
            }
            cc.director.gameManager.mainScreen.getComponent("mainScreen").updateNextOpenLevel()
        }

        this.node.active = false
        this.hideToolList()
        this.afterObtainAnimation()
        this.light.stopAllActions()
    },
    changeBoxStatus: function(e, t) {
        var s = this.toolBox.getChildByName("box");
        1 == t ? utils.changeLocalNodeTexture(s, this.blueBoxStatusView, e) : utils.changeLocalNodeTexture(s, this.pinkBoxStatusView, e)
    },
    afterObtainAnimation: function() {
        for (var e = 0; e < this.packageList.length; e++) {
            var t = this.node.convertToWorldSpaceAR(a[e]);
            cc.systemEvent.emit("TOOLOBTAIN", {
                pos: t,
                type: this.packageList[e].type,
                number: this.packageList[e].number
            })
            if(this.packageList[e].type == 0){
                gameData.starCount += this.packageList[e].number
            }
        }
        gameData.setStarGameData()
        if(cc.director.FbManager.IS_FB_INSTANT){
            cc.director.FbManager.updateDataFB({
                pinkMarkData: JSON.stringify(gameData.pinkMarkData),
                boxPanelData: JSON.stringify(gameData.boxPanelData),
                starGameData: JSON.stringify(gameData.starGameData)                  
            }) 
        }else{
            cc.log("pinkMarkData boxPanelData starGameData")
            cc.sys.localStorage.setItem("pinkMarkData", JSON.stringify(gameData.pinkMarkData));
            cc.sys.localStorage.setItem("boxPanelData", JSON.stringify(gameData.boxPanelData));
            cc.sys.localStorage.setItem("starGameData", JSON.stringify(gameData.starGameData));
        }   
    },
    hideToolList: function() {
        for (var e = 0; e < this.toolList.length; e++) {
            var t = this.toolList[e];
            t.active = false
            t.scale = 1
            t.angle = -0
            t.stopActionByTag(1)
            t.position = this.toolBox.position
        }
    },
    toolFromBoxBefore: function(e) {
        var t = cc.sequence(cc.rotateBy(.1, 15), cc.rotateBy(.1, -15), cc.callFunc(function() {
            e.angle = -0
        })).repeat(3);
        e.runAction(t)
    },
    toolFromBoxEffect: function(e, t) {
        var i = this;
        this.changeBoxStatus(1, t);
        for (var s = function(t) {
            var s = i.toolList[t];
            s.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = i.toolViewList[e[t].type]
            i.toolList[t].getChildByName("count").getComponent(cc.Label).string = e[t].number
            i.scheduleOnce(function() {
                cc.director.SoundManager.playSound("flyTool")
                this.swallowEffect(this.toolBox), this.toolAction(s, a[t])
                t == this.toolList.length - 1 && (this.btn_claim.active = true)
            }, 1 * t)
        }, n = 0; n < this.toolList.length; n++) s(n)
    },
    toolAction: function(e, t) {
        e.stopActionByTag(1), e.active = true, e.position = this.toolBox.position, e.scale = .01;
        var i = cc.spawn(cc.rotateBy(.5, 360), cc.scaleTo(.5, 1), cc.moveTo(.5, t));
        i.tag = 1, e.runAction(i)
    },
    swallowEffect: function(e) {
        var t = cc.sequence(cc.scaleTo(.2, 1.1), cc.scaleTo(.2, 1));
        t.tag = 2, e.runAction(t), this.firework.node.active = true, this.firework.resetSystem()
    },
    randomBoxReward: function() {
        var e = [0, 1, 2, 3, 4, 5, 6];
        for (var t = []; t.length < 3;) {
            var i = Math.floor(Math.random() * (e.length - 1));
            this.checkList(t, e[i]) || t.push(e[i])
        }
        return t.sort(function(e, t) {
            return e - t
        }), t
    },
    pakageType: function(e) {
        for (var t = [], i = 0; i < e.length; i++) {
            var s = {}
            s.type = e[i]
            0 == e[i] ? s.number = this.randomCoinsNumber() : s.number = 1
            t.push(s)
        }
        return t
    },
    randomCoinsNumber: function() {
        return 180 + 10 * Math.ceil(12 * Math.random())
    },
    checkList: function(e, t) {
        return e.some(function(e) {
            return e == t
        })
    },
    
});
