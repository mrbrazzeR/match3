var i = [
    [0, 5],
    [6, 10],
    [11, 26],
    [27, 36],
    [37, 41],
    [42, 46],
    [47, 57],
    [58, 73],
    [74, 79],
    [80, 89],
    [90, 94],
    [95, 100]
],
s = [{
    name: "glove",
    number: 1
}, {
    name: "dice",
    number: 1
}, {
    name: "coins",
    number: 50
}, {
    name: "coins",
    number: 30
}, {
    name: "hammer",
    number: 1
}, {
    name: "anvil",
    number: 1
}, {
    name: "coins",
    number: 120
}, {
    name: "coins",
    number: 70
}, {
    name: "disco",
    number: 1
}, {
    name: "coins",
    number: 60
}, {
    name: "rocket",
    number: 1
}, {
    name: "bomb",
    number: 1
}],
n = 360 / i.length

import utils  from "../utils"
import gameData from "../gameData"
cc.Class({
    extends: cc.Component,

    properties: {
        point: cc.Node,
        lamp1: cc.Node,
        lamp2: cc.Node,
        btn_free: cc.Node,
        btn_video: cc.Node,
        timeDisplay: cc.Node,
        timeLabel: cc.Label,
        btn_lottery: cc.Node
    },

    onLoad: function() {
        this.timeCount = 0
    },
    startLottery: function() {
        var _this = this;
        this.btn_free.getComponent(cc.Button).interactable = !1
        cc.systemEvent.emit("STOP_TOUCH", {
            number: 1
        });
        var t, i = Math.floor(100 * Math.random());
        t = gameData.bestLevel < 40 ? this.judgeToolIsUnlock() : this.computedRewardIndex(i);
        var o = 10 + Math.floor(10 * Math.random());
        this.point.angle = -0, cc.director.SoundManager.playSound("btnEffect");
        var c = cc.sequence(cc.rotateBy(0.5 * (t + 10), 3600 + t * n + o).easing(cc.easeInOut(2.5)), cc.callFunc(function() {
            var today = new Date();  
            var year = today.getFullYear();
            var month = today.getMonth();
            var day = today.getDate();
            var currentDayStart = new Date(year, month, day, 0, 0, 0, 0);
            var i = currentDayStart.getTime() / 1000 + 86400        
            gameData.lotteryEndTime = i
            _this.lotteryFinishedAnimation(s[t])
            cc.director.SoundManager.playSound("lotteryBingo");   
        }));
        this.point.runAction(c) 

    },
    lotteryFinishedAnimation: function(e) {
        var t;
        if ("rocket" == e.name) t = 1;
        else if ("bomb" == e.name) t = 2;
        else if ("disco" == e.name) t = 3;
        else if ("glove" == e.name) t = 4;
        else if ("anvil" == e.name) t = 5;
        else if ("hammer" == e.name) t = 6;
        else if ("dice" == e.name) t = 7;
        else if ("coins" == e.name) t = 0;
      
        this.hideView()
        this.scheduleOnce(function() {
            cc.systemEvent.emit("LOTTERY_FINISHED", {
                type: t,
                number: e.number 
            })
        }, 0.4)
    },
    judgeToolIsUnlock: function() {
        var e = [2, 3, 6, 7, 9],
            t = [2, 3, 6, 7, 8, 9, 10, 11],
            i = [0, 2, 3, 6, 7, 8, 9, 10, 11],
            s = [0, 2, 3, 5, 6, 7, 8, 9, 10, 11],
            n = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        return gameData.bestLevel < 8 ? e[Math.floor(Math.random() * e.length)] : gameData.bestLevel >= 8 && gameData.bestLevel < 9 ? t[Math.floor(Math.random() * t.length)] : gameData.bestLevel >= 9 && gameData.bestLevel < 20 ? i[Math.floor(Math.random() * i.length)] : gameData.bestLevel >= 20 && gameData.bestLevel < 30 ? s[Math.floor(Math.random() * s.length)] : gameData.bestLevel >= 30 && gameData.bestLevel < 40 ? n[Math.floor(Math.random() * n.length)] : void 0
    },
    lampTwinkle: function() {
        this.timeCount++, this.timeCount % 2 == 0 ? (this.lamp1.active = !0, this.lamp2.active = !1) : (this.lamp1.active = !1, this.lamp2.active = !0)
    },
    computedRewardIndex: function(e) {
        for (var t = 0; t < i.length; t++) {
            var s = i[t];
            if (e >= s[0] && e <= s[1]) return t
        }
    },
    showView: function() {
        this.schedule(this.lampTwinkle, .2);
        var e = cc.view.getVisibleSize();
        this.node.position = cc.v2(0, (this.node.height + e.height) / 2), this.node.active = !0, this.lotteryFadeIn(), this.setEndTime()
    },
    lotteryFadeIn: function() {
        this.point.angle = -0, 
        cc.director.SoundManager.playSound("lotteryIn"), 
        this.node.runAction(cc.moveTo(1, cc.v2(0, 0)).easing(cc.easeBackInOut(3)))
    },
    lotteryFadeOut: function() {
        var e = this,
            t = cc.view.getVisibleSize();
        cc.director.SoundManager.playSound("lotteryOut"), 
        this.node.runAction(cc.sequence(cc.moveTo(.5, cc.v2(0, (this.node.height + t.height) / 2)), cc.callFunc(function() {
            e.node.active = !1
            cc.director.screenDialog.mask.active = !1
        })))
    },
    
    timeDowmCount: function() {
        var e = utils.countDonwTime(this.endTime);
        if (!e) return this.unschedule(this.timeDowmCount), this.btn_free.active = !0, this.btn_free.getComponent(cc.Button).interactable = !0, void(this.timeDisplay.active = !1);
        this.timeLabel.string = e
    },
    setEndTime: function() {
        var e, t = gameData.lotteryEndTime;
        t ? (e = parseInt(t), this.endTime = e, Math.floor((new Date).getTime() / 1e3) - e >= 0 ? (this.btn_free.active = !0, this.btn_free.getComponent(cc.Button).interactable = !0, this.timeDisplay.active = !1) : (this.btn_free.active = !1, this.timeDisplay.active = !0, this.schedule(this.timeDowmCount, 1))) : (this.btn_free.active = !0, this.btn_free.getComponent(cc.Button).interactable = !0, this.timeDisplay.active = !1)
    },
    hideView: function() {
        cc.director.SoundManager.playSound("btnEffect"), 
        this.unschedule(this.lampTwinkle), this.unschedule(this.timeDowmCount), this.lotteryFadeOut(), this.stopLotteryIconAnima()
    },
    stopLotteryIconAnima: function() {
       // this.btn_lottery.getComponent(cc.Animation).stop("lotteryIconAnima")
    },
    
});
