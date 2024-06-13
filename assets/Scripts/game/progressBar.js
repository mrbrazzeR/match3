var levelResource = require("../levelResource");
import gameData from "../gameData"

cc.Class({
    extends: cc.Component,

    properties: {
        starList: [cc.Node],
        progressBar: cc.ProgressBar,
        starView: [cc.SpriteFrame],
        star_boom: cc.Prefab,
        header: cc.Node,
        container: cc.Node,
        lbScore: cc.Label 
    },

    onLoad: function() {
        this.scoreValue = 0,
        this.starLevel = 0,
        this.passRate = -1
    },
    start: function() {
        this.judgeHasHair()
    },
   
    initProgressBar: function() {
        this.lbScore.string = 0
        this.progressBar.progress = 0
        this.scoreValue = 0
        
        if(gameData.bestLevel > 300){
            this.starStandard = [10000, 20000, 30000]
        }else{
            this.starStandard = levelResource["lv" + gameData.bestLevel].scoreStandard
        }

        this.initStarView()
    },
    initStarView: function() {
        for (var e = 0; e < this.starList.length; e++){
            this.starList[e].getChildByName("inner").active = false
            this.starList[e].getChildByName("num").active = true
            this.starList[e].getChildByName("num").getComponent(cc.Label).string =  this.starStandard[e]
        }
    },
    judgeStepScore: function(e) {
        if (e > 0) {
            this.scoreValue += e,
            gameData.currScore = this.scoreValue
            this.lbScore.string = gameData.currScore
            this.starLight(this.scoreValue);
            var t = e / this.starStandard[2];
            this.slowAddEffect(t)
        }
    },
    slowAddEffect: function(e) {
        for (var t = e / 10, i = 0; i < 10; i++){
            this.scheduleOnce(function() {
                this.progressBar.progress += t
            }, .05 * i)
        }
    },
    addEffect: function(e) {
        var t = cc.instantiate(this.star_boom);
        t.parent = this.node,
        t.position = this.starList[e].position,
        t.getComponent(cc.ParticleSystem).resetSystem()
    },
    starLight: function(e) {
        if (e < this.starStandard[0])
            gameData.passRate = -1;
        else {
            if (e >= this.starStandard[0] && e < this.starStandard[1]) {
                this.starList[0].getChildByName("inner").active = true
                this.starList[0].getChildByName("num").active = false
                if (1 == this.passRate){
                    return void (cc.director.container.target.isGameEnd && cc.director.container.target.isPass && (gameData.passRate = this.passRate));
                }
                this.passRate = 1
                cc.director.SoundManager.playSound("starCollect"),
                this.addEffect(0),
                this.starList[0].runAction(cc.sequence(cc.delayTime(.2), cc.scaleTo(.1, .9), cc.scaleTo(.3, 2), cc.scaleTo(.1, 1)))
            }
            if (e >= this.starStandard[1] && e < this.starStandard[2]) {
                this.starList[0].getChildByName("inner").active = true
                this.starList[1].getChildByName("inner").active = true
                this.starList[1].getChildByName("num").active = false
                if (2 == this.passRate){
                    return void (cc.director.container.target.isGameEnd && cc.director.container.target.isPass && (gameData.passRate = this.passRate));
                }
                this.passRate = 2,
                cc.director.SoundManager.playSound("starCollect"),
                this.addEffect(1),
                this.starList[1].runAction(cc.sequence(cc.delayTime(.2), cc.scaleTo(.1, .9), cc.scaleTo(.3, 2), cc.scaleTo(.1, 1)))
            }
            if (e >= this.starStandard[2]) {
                this.starList[0].getChildByName("inner").active = true
                this.starList[1].getChildByName("inner").active = true
                this.starList[2].getChildByName("inner").active = true
                this.starList[2].getChildByName("num").active = false
                if (3 == this.passRate){
                    return void (cc.director.container.target.isGameEnd && cc.director.container.target.isPass && (gameData.passRate = this.passRate));
                }
                this.passRate = 3,
                cc.director.SoundManager.playSound("starCollect"),
                this.addEffect(2),
                this.starList[2].runAction(cc.sequence(cc.delayTime(.2), cc.scaleTo(.1, .9), cc.scaleTo(.3, 2), cc.scaleTo(.1, 1)))
            }
        }
    },
    judgeHasHair: function() {
        window.NativeManager.hasPhoneHair() && this.moveNeedMoveArea()
    },
    moveNeedMoveArea: function() {
        this.header.getComponent(cc.Widget).top = 80,
        this.container.getComponent(cc.Widget).verticalCenter -= 60
    }
});
