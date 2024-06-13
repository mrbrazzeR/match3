
cc.Class({
    extends: cc.Component,

    properties: {
        water: cc.Node,
                waterAnima: cc.Node
    },

    fallDown: function(e) {
        var t = this;
        t.node.active = !0, t.water.active = !0, t.waterAnima.active = !1;
        var i = cc.sequence(cc.moveTo(.5, e), cc.callFunc(function() {
            t.water.active = !1, t.waterAnima.active = !0, t.waterFallDownAnimation()
        }));
        this.node.runAction(i)
    },
    waterFallDownAnimation: function() {
        var e = this.waterAnima.getComponent(cc.Animation);
        e.play("waterFall");
        var t = e.getClips()[0].duration;
        this.scheduleOnce(function() {
            this.waterAnima.active = !1, cc.director.nodePool.put(this.node)
        }, t)
    },
    
});
