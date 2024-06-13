var framUtils = require("./framUtils"),
FarmData = require("./FarmData");
cc.Class({
    extends: cc.Component,

    properties: {
        prefab_fountain_small: cc.Prefab,
        node_fountain_big: cc.Node,
        label_fountain_countdown: cc.Label
    },

    onLoad: function() {
        this.posList = [cc.v2(-300, -250), cc.v2(320, -20), cc.v2(-50, 240)], cc.systemEvent.on("STARTOVER_AUTOWATER", this.startoverAutoWater, this), cc.director.isAutoWater = !1, cc.director.isAutoInsec = !1
    },
    bigfountaianStartover: function() {
        this.node_fountain_big.getComponent(cc.Animation).play("fountain")
    },
    smallFountainStartover: function(e) {
        for (var t = 0; t < this.posList.length; t++) {
            var i = cc.instantiate(this.prefab_fountain_small);
            if (i.parent = this.node, i.position = this.posList[t], i.getComponent(cc.Animation).play("fountain_s"), e == t) break
        }
    },
    startoverAutoWater: function(e) {
        cc.director.SoundManager.playSound("farm_waterMachine");
        var t = e.type;
        this.bigfountaianStartover(), 9 == t ? this.smallFountainStartover(t - 9) : 10 == t ? this.smallFountainStartover(t - 9) : 11 == t && this.smallFountainStartover(t - 9), 1 == e.mode && this.recordPropsDetail(t)
    },
    recordPropsDetail: function(e) {
        var t = framUtils.getLocalData("autoProp");
        if (t) {
            var n = FarmData.propShopList[e].effectTime * FarmData.costTime.ONE_MIN,
                a = framUtils.getServerTime();
            e >= 8 && e < 12 ? (a > t.autowater.endTime ? (t.autowater.endTime = a + n, t.autowater.grade = e) : (t.autowater.endTime += n, t.autowater.grade < e && (t.autowater.grade = e)), this.endTime = t.autowater.endTime) : e >= 12 && e < 15 && (a > t.autoInsec.endTime ? (t.autoInsec.endTime = a + n, t.autoInsec.grade = e) : (t.autoInsec.endTime += n, t.autoInsec.grade < e && (t.autoInsec.grade = e)))
        } else {
            t = {};
            var o = FarmData.propShopList[e].effectTime * FarmData.costTime.ONE_MIN,
                c = framUtils.getServerTime() + o,
                r = {},
                d = {};
            e >= 8 && e < 12 ? (r.endTime = c, r.grade = e, d.endTime = -1, d.grade = -1) : e >= 12 && e < 15 && (r.endTime = -1, r.grade = -1, d.endTime = c, d.grade = grade), t.autowater = r, t.autoInsec = d
        }
        console.log(t), framUtils.setLocalData(t, "autoProp"), this.isAutoWater()
    },
    isAutoWater: function() {
        var e = framUtils.getServerTime(),
            t = framUtils.getLocalData("autoProp");
        t && t.autowater.endTime > e ? (this.label_fountain_countdown.node.active = !0, cc.systemEvent.emit("STARTOVER_AUTOWATER", {
            type: t.autowater.grade,
            mode: 2
        }), this.endTime = t.autowater.endTime, console.log(this.endTime, "122"), this.label_fountain_countdown.string = framUtils.countdown(this.endTime, 1), this.schedule(this.showFountainCountdown, 1), cc.director.isAutoWater = !0) : this.label_fountain_countdown.node.active = !1
    },
    showFountainCountdown: function() {
        var e = framUtils.countdown(this.endTime, 1);
        this.label_fountain_countdown.string = new String(e)
    },
    start: function() {
        this.isAutoWater()
    }
});
