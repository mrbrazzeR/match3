cc.Class({
    extends: cc.Component,

    properties: {},
        computedLineDistanceAndRotation: function(e, t) {
            e = this.node.convertToNodeSpaceAR(e);
            var i = new cc.Vec2(e.x, e.y);
            t = this.node.convertToNodeSpaceAR(t);
            var s = Math.ceil(i.sub(t).mag()),
                n = i.sub(cc.v2(i.x, i.y + 100)),
                a = i.sub(t),
                o = parseInt(a.signAngle(n) * (180 / Math.PI));
            this.node.height = s, this.node.angle = -o
        },
        unuse: function() {
            this.node.angle = -0
        },
        reuse: function() {},
        
});
