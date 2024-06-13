// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        effectTime: cc.Label,
        item_view: cc.Sprite,
        item_view_viewList: [cc.SpriteFrame],
        item_costNum: cc.Label,
        label_name: cc.Label,
        node_addItem: cc.Node
    },
    updateItem: function(e) {
        this.data = e, this.updateItemView(this.data.type), this.item_costNum.string = e.cost + "", this.updateLabelString(e.price, this.item_costNum), this.updateLabelString(e.name, this.label_name), this.updateLabelString(e.timeStr, this.effectTime)
    },
    buy_fertilizer: function() {
        var e = new cc.Event.EventCustom("buy_prop", !0);
        e.detail = {
            price: this.data.price,
            type: this.data.type
        }, this.node.dispatchEvent(e), this.tipsBuySuccess()
    },
    tipsBuySuccess: function() {
        var e = cc.instantiate(this.node_addItem),
            t = cc.sequence(cc.fadeIn(.1), cc.moveTo(.5, cc.v2(e.position.x, e.position.y + 50)), cc.fadeOut(.1), cc.callFunc(function() {
                e.removeFromParent()
            }));
        e.active = !0, e.parent = this.node, e.runAction(t)
    },
    updateItemView: function(e) {
        this.item_view.spriteFrame = this.item_view_viewList[e]
    },
    updateItemName: function(e) {
        var t;
        e < 4 ? t = 0 : e < 8 ? t = 1 : e < 12 ? t = 2 : e < 15 && (t = 3), this.sprite_name.spriteFrame = this.list_itemName[t]
    },
    updateLabelString: function(e, t) {
        t.string = new String(e)
    },
    isEnoughBuy: function() {
        var e = cc.game.FarmUtils.getLocalData("localFarmInfo").coin;
        if (e || (e = 0), e >= this.data.cost) return !0;
        cc.systemEvent.emit("SHOW_WORD_NOTICE", {
            code: 1001
        })
    },
});
