import utils  from "../utils"
import gameData from "../gameData"
cc.Class({
    extends: cc.Component,

    properties: {
        light: cc.Node,
        success: cc.Node,
        fail: cc.Node,
    },

    onLoad: function() {
    },
    successView: function() {
        cc.director.SoundManager.playSound("tips_success"),
        this.success.active = !0,
        this.light.active = !0,
        this.fail.active = !1,
        this.success.scale = this.light.scale = .2,
        this.success.runAction(cc.scaleTo(1, 1).easing(cc.easeBackOut())),
        this.light.runAction(cc.spawn(cc.scaleTo(1, 1), cc.rotateBy(5, 360)))
    },
    failView: function() {
        cc.director.SoundManager.playSound("tips_fail"),
        this.fail.scale = this.light.scale = .2,
        this.success.active = !1,
        this.fail.active = !0,
        this.light.active = !1,
        this.fail.runAction(cc.scaleTo(1, 1).easing(cc.easeBackOut()))
    },
    showView: function(e) {
        this.node.active = !0,
        1 == e ? this.successView() : this.failView(),
        this.scheduleOnce(function() {
            cc.director.dialogScript.hideResultTipsView(e)
        }, 2)
    },
    hideView: function(e) {
        if (
            this.node.active = !1,
            this.light.stopAllActions(),
            this.light.active = !1,
            this.success.active = !1,
            this.fail.active = !1,
            1 == e
        ) {
 
            var t = utils.randomGetGrid(cc.director.container.target.stepCount, gameData.starMatrix)
              , n = cc.director.container.target.step.node.parent.convertToWorldSpaceAR(cc.director.container.target.step.node);
              cc.director.container.target.changeStepToRocket(t, n),
              cc.director.container.target.submitPlayerUsedStep()
        } else
            cc.director.dialogScript.showVideoRewardView()
    },
    
});
