cc.Class({
    extends: cc.Component,

    properties: {
        mask: cc.Node,
        funcNode: cc.Node,
        item: cc.Node,
        explainView: cc.Sprite,
        iconView: cc.Sprite,
        explain_list: [cc.SpriteFrame],
        icon_list: [cc.SpriteFrame]
    },

    onLoad: function() {
        var e = cc.view.getVisibleSize();
        this.startPos = cc.v2(0, (e.height + this.funcNode.height) / 2),
        this.endPos = cc.v2(0, (e.height - this.funcNode.height) / 2),
        cc.systemEvent.on("FUNCTION_EXPLAIN_ON", this.showView, this),
        cc.systemEvent.on("FUNCTION_EXPLAIN_OFF", this.hideView, this)
        this.initFuncNode()
    },
  
    showView: function(e) {
        var t = e.type
          , i = e.itemPos;
        this.item.position = this.node.convertToNodeSpaceAR(i),
        this.explainView.spriteFrame = this.explain_list[t],
        this.iconView.spriteFrame = this.icon_list[t],
        this.item.getComponent(cc.Sprite).spriteFrame = this.icon_list[t],
        this.show_(),
        this.initFuncNode()
    },
    hideView: function() {
        this.hide_()
    },
    initFuncNode: function() {
        this.funcNode.stopAllActions(),
        this.funcNode.position = this.startPos,
        this.funcNode.runAction(cc.spawn(cc.fadeIn(.1), cc.moveTo(.5, this.endPos)))
    },
    show_: function() {
        this.mask.active = !0,
        this.mask.opacity = 220,
        this.funcNode.active = !0,
        this.item.active = !0,
        this.item.opacity = 255
    },
    hide_: function() {
        cc.director.SoundManager.playSound("btnEffect"),
        this.funcNode.stopAllActions(),
        this.nodeFadeOut(this.mask),
        this.nodeFadeOut(this.item),
        this.funcNode.runAction(cc.sequence(cc.moveTo(.5, this.startPos), cc.fadeOut(.1)))
    },
    nodeFadeOut: function(e) {
        e.runAction(cc.sequence(cc.fadeOut(.5), cc.callFunc(function() {
            e.active = !1
        })))
    },
    cancleTool: function() {
        cc.systemEvent.emit("CLEAR_BTN"),
        cc.systemEvent.emit("FUNCTION_EXPLAIN_OFF")
    },
   
});
