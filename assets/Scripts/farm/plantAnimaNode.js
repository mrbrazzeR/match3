var i = cc.Class({
    name: "plantViewList",
    properties: {
        viewList: [cc.SpriteFrame]
    }
});
cc.Class({
    extends: cc.Component,

    properties: {
        plantSpriteList: [i]
    },
    startPlantAnimation: function() {
        for (var e = this.node.children, t = e.length - 1; t >= 0; t--) e[t].active = !0, this.plantMoveAnimation(e[t], .5 + .1 * t)
    },
    endPlantAnimation: function() {
        for (var e = this.node.children, t = e.length - 1; t >= 0; t--) e[t].active = !1, e[t].stopAllActions()
    },
    endPlantAnimation1: function() {
        for (var e = this.node.children, t = function(t) {
                var i = cc.sequence(cc.fadeOut(.8), cc.callFunc(function() {
                    e[t].active = !1, e[t].stopAllActions()
                }));
                e[t].runAction(i)
            }, i = e.length - 1; i >= 0; i--) t(i)
    },
    plantMoveAnimation: function(e, t) {
        var i = cc.sequence(cc.scaleTo(t, 1.05), cc.scaleTo(t, .95), cc.scaleTo(t, 1)).repeatForever();
        e.runAction(i)
    },
    changePlantTexture: function(e, t, i) {
        if (i && (this.index = i), void 0 === this.statue)  this.statue = -1;
        else if (this.statue >= 0 && this.statue == t) return;
        this.statue = t, this.node.active = !0;
        for (var s = this.node.children, n = s.length - 1; n >= 0; n--) s[n].active = !0, s[n].stopAllActions(), s[n].getComponent(cc.Sprite).spriteFrame = this.plantSpriteList[e].viewList[t], this.fadeInFromSmall(s[n]);
        this.scheduleOnce(function() {
            this.startPlantAnimation()
        }, 1.5)
    },
    fadeInFromSmall: function(e) {
        e.opacity = 0, e.scale = .1;
        var t = cc.spawn(cc.fadeIn(.8), cc.scaleTo(.8, 1));
        e.runAction(t)
    },
    hideView: function() {
        this.endPlantAnimation(), this.node.active = !1
    },
    fadeOut: function() {
        this.endPlantAnimation1(), this.scheduleOnce(function() {
            this.node.active = !1
        }, 1.5)
    },
    onCollisionEnter: function() {
        var e = new cc.Event.EventCustom("colliderEvent", !0);
        e.detail = {
            index: this.index
        }, this.node.dispatchEvent(e)
    }
});
