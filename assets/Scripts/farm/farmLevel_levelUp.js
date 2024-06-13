var framUtils = require("./framUtils"),
FarmData = require("./FarmData");
cc.Class({
    extends: cc.Component,

    properties: {
        node_light: cc.Node,
        label_lastLevel: cc.Label,
        label_nextLevel: cc.Label,
        node_particle: cc.ParticleSystem,
        node_farmIcon: cc.Node
    },
    light_rotation: function() {
        var e = cc.rotateBy(2, 180).repeatForever();
        this.node_light.runAction(e)
    },
    updateLevel: function() {
        var e = framUtils.getLocalData("localFarmInfo");
        this.changeLabelString(this.label_lastLevel, e.level - 1), this.changeLabelString(this.label_nextLevel, e.level), this.currentLevel = e.level
    },
    showView: function() {
        this.node.active = !0, framUtils.showPromptWithScale(this.node), this.updateLevel(), this.light_rotation(), this.playFarmLevelUpAnimation()
    },
    hideView: function() {
        cc.director.farmDialog.hideFarmChild()
        this.node_light.stopAllActions(), this.node.active = !1, cc.director.FarmManager.isLandUnlockBylevelUp(), this.isNeedShowPlantUnlockPrompt()
    },
    isNeedShowPlantUnlockPrompt: function() {
        var e = FarmData.plantLimitedList.indexOf(this.currentLevel);
        e >= 0 && cc.systemEvent.emit("SHOW_PLANT_UNLOCK", {
            type: e
        })
    },
    changeLabelString: function(e, t) {
        e.string = "lv." + new String(t)
    },
    playFarmLevelUpAnimation: function() {
        var e = this.node_farmIcon.getComponent(cc.Animation);
        e.play("levelUp_farm");
        var t = e.getClips()[0].duration;
        this.scheduleOnce(function() {
            this.playParticleAnimation()
        }, t)
    },
    playParticleAnimation: function() {
        this.node_particle.node.active = !0, this.node_particle.resetSystem()
    },
    
});
