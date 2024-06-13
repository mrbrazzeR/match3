var framUtils = require("./framUtils"),
FarmData = require("./FarmData");
cc.Class({
    extends: cc.Component,

    properties: {
        viewList: [cc.SpriteFrame],
        node_view: cc.Node,
        node_unlockAnimation: cc.Node,
        node_name: cc.Label
    },
    showView: function(e) {
        this.node.active = !0, framUtils.showPromptWithScale(this.node), this.type = e, this.playUnlockAnimation(this.node_unlockAnimation), console.log(e, "43,plantunlock"), this.changeSpriteView(this.node_view, this.viewList, e);
        var t = FarmData.plantInfo[e].name;
        this.changeLabelContent(this.node_name, t)
    },
    hideView: function() {
        cc.director.farmDialog.mask.active = !1
        this.node_unlockAnimation.active = !1, this.node.active = !1, this.sendRequestToAnimaLayer()
    },
    playUnlockAnimation: function(e) {
        e.active = !0, e.getComponent(cc.Animation).play()
    },
    sendRequestToAnimaLayer: function() {
        var e = this.node_view.parent.convertToWorldSpaceAR(this.node_view.position),
            t = {};
        t.type = this.type, t.number = FarmData.plantUnlockSeedReward[this.type], cc.systemEvent.emit("OBTAIN_SEED", {
            worldPos: e,
            data: t
        })
    },
    changeSpriteView: function(e, t, i) {
        e.getComponent(cc.Sprite).spriteFrame = t[i]
    },
    changeLabelContent: function(e, t) {
        e.getComponent(cc.Label).string = new String(t)
    },
    
});
