var framUtils = require("./framUtils");
cc.Class({
    extends: cc.Component,

    properties: {
        offlineNumber: cc.Node,
        house: cc.Node,
        doubleOfflineNumber: cc.Node,
        btn_get: cc.Node,
        btn_collect: cc.Node,
        btn_close: cc.Node
    },
    computedOfflineExp: function() {
        var e = cc.director.FarmManager.getCurrentAllLandExp();
        this.exp = e
    },
    getOfflineExp: function() {
        cc.director.farmDialog.hideOfflineExpPrompt()
    },
    getDoubleOfflineExp: function() {
        var e = this.offlineNumber.parent.convertToWorldSpaceAR(this.offlineNumber.position);
        cc.systemEvent.emit("UPDATE_FARM", {
            coins: 0,
            exp: 2 * this.exp,
            worldPos: e
        }), cc.director.farmDialog.hideOfflineExpPrompt(), cc.director.FarmManager.resetAllLandExp()
    },
    watchVideoAd: function() {
        this.numberRoll(this.offlineNumber, this.exp), this.btn_collect.active = !0, this.btn_get.active = !1, this.btn_close.active = !1
    },
    showView: function() {
        this.node.active = !0, framUtils.showPromptWithScale(this.node), this.playNodeAnimation(this.house, 1), this.computedOfflineExp(), this.computedOfflineExp(), this.changeNodeLabelString(this.offlineNumber, this.exp), this.changeNodeLabelString(this.doubleOfflineNumber, 2 * this.exp), this.btn_collect.active = !1, this.btn_close.active = !0, this.btn_get.active = !0
    },
    hideView: function() {
        this.playNodeAnimation(this.house, 2), this.node.active = !1
    },
    changeNodeLabelString: function(e, t) {
        e.getComponent(cc.Label).string = new String(t)
    },
    playNodeAnimation: function(e, t, i) {
        var s = e.getComponent(cc.Animation);
        s ? i ? 1 == t ? s.play(i) : 2 == t ? s.stop(i) : cc.log(t, "sorry, your type is not exist!") : 1 == t ? s.play() : 2 == t ? s.stop() : cc.log(t, "sorry, your type is not exist!") : cc.log("no animation component on this node!")
    },
    numberRoll: function(e, t) {
        var i, s, n = this,
            a = e.getComponent(cc.Label),
            o = parseInt(a.string),
            c = Math.floor(t / 20),
            r = 0,
            d = !1;
        c > 1 ? (s = 20, r = t - 20 * (i = c), d = !0) : (i = 1, s = t);
        for (var l = function(e) {
                n.scheduleOnce(function() {
                    o += i, e == s - 1 && r > 0 && d && (o += r), a.string = new String(o)
                }, .05 * e)
            }, h = 0; h < s; h++) l(h)
    },
    
    // update (dt) {},
});
