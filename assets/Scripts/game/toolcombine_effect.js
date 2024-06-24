

cc.Class({
    extends: cc.Component,

    properties: {
        light: cc.Node,
        particle: cc.ParticleSystem
    },

    effect: function() {
        this.node.active = true
        this.light.opacity = 255;
        var action = cc.spawn(cc.scaleTo(0.5, 2), cc.fadeOut(0.5));
        this.particle.resetSystem()
        this.light.runAction(action)
    },
    start: function() {
        //this.effect()
    }
});
