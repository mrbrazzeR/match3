
cc.Class({
    extends: cc.Component,

    properties: {
      
    },

    computedLineDistanceAndRotation: function(e, t) {
        e = this.node.convertToNodeSpaceAR(e);
        var i = new cc.Vec2(e.x, e.y);
        t = this.node.convertToNodeSpaceAR(t);
        var s = i.sub(cc.v2(i.x, i.y + 100)),
            n = i.sub(t),
            a = parseInt(n.signAngle(s) * (180 / Math.PI));
        this.node.angle = -(a - 180)
    },
    unuse: function() {
        this.node.angle = -0
    },
    
});
