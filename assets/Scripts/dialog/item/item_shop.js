import gameData from "../../gameData"
cc.Class({
    extends: cc.Component,

    properties: {
        item_view: cc.Sprite,
        item_name: cc.Sprite,
        item_function: cc.Sprite,
        viewList: [cc.SpriteFrame],
        nameList: [cc.SpriteFrame],
        functionList: [cc.SpriteFrame],
        price: cc.Label
    },

    initItemView: function(e) {
        this.item_view.spriteFrame = this.viewList[e.type]
        this.item_name.spriteFrame = this.nameList[e.type]
        this.item_function.spriteFrame = this.functionList[e.type]
        this.price.string = e.price + ""
        this.data = e
    },
    buy: function() {
        if (
            cc.director.SoundManager.playSound("btnEffect"), gameData.starCount >= this.data.price) {
            var e = new cc.Event.EventCustom("buyPlayerTool", !0),
                t = this.item_view.node.parent.convertToWorldSpaceAR(this.item_view.node.position);
            e.detail = {
                data: this.data,
                pos: t,
                type: this.data.type
            }, this.node.dispatchEvent(e)
        }else cc.director.screenDialog.showCoinsPanel()
    },
    buySuccessAnimation: function() {
        var e = this.data.type;
        cc.systemEvent.emit("SUCCESS_BUY_ANIMA", {
            type: e
        })
    },
});
