var framUtils = require("./framUtils"),
FarmData = require("./FarmData");
cc.Class({
    extends: cc.Component,

    properties: {
        sprite_view: cc.Sprite,
        label_Level_current: cc.Label,
        label_Level_next: cc.Label,
        label_produce_current: cc.Label,
        label_produce_next: cc.Label,
        node_bg_light: cc.Node,
        list_view: [cc.SpriteFrame],
        node_particle: cc.ParticleSystem,
        node_animation: cc.Node
    },
    lightRatation: function() {
        var e = cc.rotateBy(6, 360).repeatForever();
        this.node_bg_light.runAction(e)
    },
    showView: function(e) {
        this.node.active = !0, framUtils.showPromptWithScale(this.node), this.updateView(e), this.updateLevel(e), this.updateProduce(e), this.lightRatation(), this.playParticleAnimation(), this.playAnimation(this.node_animation)
    },
    hideView: function() {
        cc.director.farmDialog.hideFarmChild()
        this.node_animation.active = !1, this.node.active = !1, this.node_bg_light.stopAllActions()
    },
    updateLevel: function(e) {
        var t = framUtils.getDataProperty(e, "seedData", "level");
        this.updateLabelString(this.label_Level_next, t), this.updateLabelString(this.label_Level_current, t - 1)
    },
    updateProduce: function(e) {
        var t = framUtils.getDataProperty(e, "seedData", "level"),
            n = FarmData.getPlantProduce(t - 1, e),
            a = FarmData.getPlantProduce(t, e);
        this.updateLabelString(this.label_produce_current, n), this.updateLabelString(this.label_produce_next, a)
    },
    updateView: function(e) {
        this.sprite_view.spriteFrame = this.list_view[e]
    },
    updateLabelString: function(e, t) {
        e.string = new String(t)
    },
    playParticleAnimation: function() {
        this.node_particle.node.active = !0, this.node_particle.resetSystem()
    },
    playAnimation: function(e) {
        e.active = !0, e.getComponent(cc.Animation).play()
    },
    
});
