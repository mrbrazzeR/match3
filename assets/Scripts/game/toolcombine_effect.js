

cc.Class({
    extends: cc.Component,

    properties: {
        light: cc.Node,
        particle: cc.ParticleSystem
    },

    effect: function() {
        this.light.opacity = 200;
        var e = cc.spawn(cc.scaleTo(.5, 2), cc.fadeOut(.5));
        this.particle.resetSystem(), this.light.runAction(e)
    },
    start: function() {
        this.effect()
    }
});
