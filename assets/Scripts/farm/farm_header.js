var framUtils = require("./framUtils"),
FarmData = require("./FarmData");
cc.Class({
    extends: cc.Component,

    properties: {
        progressBar: cc.ProgressBar,
        label_lv: cc.Label,
        label_coins: cc.Label,
        icon: cc.Node
    },
    onLoad: function() {
        cc.systemEvent.on("UPDATE_FARM_LEVEL", this.updateLevel, this), cc.systemEvent.on("UPDATE_FARM_COINS", this.updateCoins, this), cc.systemEvent.on("UPDATE_FARM_PROGRESS", this.updateProgressBar, this)
    },
    updateProgressBar: function(e) {
        this.progressBar.progress = e.num,  this.icon.runAction(cc.sequence(cc.scaleTo(.2, 1.1), cc.scaleTo(.2, .9), cc.scaleTo(.2, 1))), e.islevelUp && cc.director.farmDialog.showFarmLevelUpPrompt(), this.updateLevel(), this.updateCoins()
    },
    updateLevel: function() {
        var e = framUtils.getLocalData("localFarmInfo");
        e ? (this.label_lv.string = new String(e.level), this.label_lv.node.getChildByName("Lv").getComponent(cc.Widget).left = -30) : this.label_lv.string = "1"
    },
    updateCoins: function(e) {
        if (console.log("updateCoins event : " + e), e)
            if (0 == e.number) {
                var t = framUtils.getObjectProperty("localFarmInfo", "coin");
                t || (t = 0), this.label_coins.string = new String(t)
            } else framUtils.numberRoll(this.label_coins, e.number);
        else {
            var s = framUtils.getObjectProperty("localFarmInfo", "coin");
            s || (s = 0), this.label_coins.string = new String(s)
        }
        cc.systemEvent.emit("UPDATE_LAND_STATUE")
    },
    updateCurrentProgress: function() {
        var e = framUtils.getLocalData("localFarmInfo");
        if (e) {
            var t = e.exp / FarmData.getLevelUpExp(e.level + 1);
            cc.systemEvent.emit("UPDATE_FARM_PROGRESS", {
                num: t
            })
        } else cc.systemEvent.emit("UPDATE_FARM_PROGRESS", {
            num: .01
        })
    },
    init: function() {
        this.updateLevel(), this.updateCoins(), this.updateCurrentProgress()
    },
    start: function() {
        this.init()
    }
});
