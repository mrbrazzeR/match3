

cc.Class({
    extends: cc.Component,

    properties: {
        light: cc.Node,
        view: cc.Sprite,
        viewList: [cc.SpriteFrame]
    },

    initView: function(e) {
        this.view.spriteFrame = this.viewList[e], this.lightAnimation()
    },
    lightAnimation: function() {
        var e = cc.sequence(cc.rotateBy(2, 90), cc.fadeOut(.2));
        this.light.runAction(e)
    },
});
