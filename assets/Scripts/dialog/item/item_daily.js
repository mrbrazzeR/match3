
cc.Class({
    extends: cc.Component,

    properties: {
        reward: cc.Sprite,
        dayView: cc.Sprite,
        bgView: cc.Sprite,
        markView: cc.Node,
        light: cc.Node,
        rewardList: [cc.SpriteFrame],
        dayList: [cc.SpriteFrame],
        bgList: [cc.SpriteFrame]
    },

    initItem: function(e) {
        this.data = e, this.judgeStatus(e.status), this.changeIndex(e.index), this.changeRewardView(e.index)
    },
    judgeStatus: function(e) {
        this.markView.active = 1 == e
        2 == e && (
            this.lightAnimation(), 
            this.node.getComponent(cc.Button).interactable = !0, 
            this.reward.node.y = 0, 
            this.dayView.node.active = !1
        )
        this.changeBgView(e)
    },
    changeBgView: function(e) {
        this.bgView.spriteFrame = this.bgList[e - 1]
    },
    changeRewardView: function(e) {
        this.reward.spriteFrame = this.rewardList[e]
    },
    lightAnimation: function() {
        this.light.active = !0, this.light.runAction(cc.rotateBy(2, 90).repeatForever())
    },
    changeIndex: function(e) {
        this.dayView.spriteFrame = this.dayList[e]
    },
    clickEvent: function() {
        var e = new cc.Event.EventCustom("get_reward", !0),
            t = this.node.parent.convertToWorldSpaceAR(this.node.position);
        this.data.pos = t, e.detail = this.data, this.node.dispatchEvent(e)
    },
});
