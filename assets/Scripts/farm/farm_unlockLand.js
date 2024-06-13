var framUtils = require("./framUtils");
cc.Class({
    extends: cc.Component,

    properties: {
        land: cc.Node,
        land_effect: cc.Node,
        circleContainer: cc.Node,
        landUnlockCost: [cc.SpriteFrame],
        price: cc.Sprite
    },
    landScaleAnima: function() {
        var e = cc.sequence(cc.scaleTo(.25, 1.1), cc.scaleTo(.5, .9), cc.scaleTo(.25, 1)).repeatForever();
        this.land.runAction(e)
    },
    landUnlockEffect: function() {
        this.land_effect.getComponent(cc.Animation).play()
    },
    endLandUnlockEffect: function() {
        this.land_effect.getComponent(cc.Animation).stop()
    },
    circleScaleFadeAnimation: function(e, t, i) {
        e.scale = .6, e.active = !0;
        var s = cc.sequence(cc.callFunc(function() {
            e.active = !0, e.scale = .6, e.opacity = 255
        }), cc.spawn(cc.scaleTo(t, i), cc.fadeOut(t)), cc.callFunc(function() {
            e.active = !1
        })).repeatForever();
        e.runAction(s)
    },
    openWholeEffect: function(e) {
        for (var t = this, i = e.children, s = function(e) {
                t.scheduleOnce(function() {
                    this.circleScaleFadeAnimation(i[e], 5, 2.5)
                }, 1 * e)
            }, n = i.length - 1; n >= 0; n--) s(n)
    },
    startCircleLight: function() {
        this.openWholeEffect(this.circleContainer)
    },
    showView: function(e) {
        this.obj = e, this.node.active = !0, framUtils.showPromptWithScale(this.node), this.startCircleLight(), this.landScaleAnima(), this.landUnlockEffect()
    },
    hideAllLightCircle: function() {
        for (var e = this.circleContainer.children, t = e.length - 1; t >= 0; t--) e[t].active = !1, e[t].stopAllActions()
    },
    stopLandAnimation: function() {
        this.land.stopAllActions()
    },
    hideView: function() {
        cc.director.farmDialog.hideFarmChild()
        this.hideAllLightCircle(), this.stopLandAnimation(), this.endLandUnlockEffect(), this.node.active = !1, this.obj && cc.systemEvent.emit("ANIMA_LAND_UNLOCK", this.obj)
    },
    start: function() {
        this.startCircleLight(), this.landScaleAnima(), this.landUnlockEffect()
    }
});
