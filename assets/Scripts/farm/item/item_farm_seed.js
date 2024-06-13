
cc.Class({
    extends: cc.Component,

    properties: {
        itme_level: cc.Label,
        itemView: cc.Sprite,
        item_name: cc.Label,
        item_get_icon: cc.Sprite,
        item_get_number: cc.Label,
        item_sell_price: cc.Label,
        item_time_cost: cc.Label,
        item_amount_number: cc.Label,
        itemView_viewList: [cc.SpriteFrame],
        node_display_unlock: cc.Node,
        node_display_lock: cc.Node,
        label_lock_name: cc.Label,
        label_lock_level: cc.Label,
        sprite_lock_view: cc.Sprite,
        list_lock_view: [cc.SpriteFrame],
        item_bg: cc.Sprite,
        list_itembg: [cc.SpriteFrame],
        node_addItem: cc.Node
    },
    initItemSeed: function(e, t) {
        this.data = e, e.limitedlevel <= t ? (this.changeItemBg(0), this.updateUnlockDetail(e)) : (this.changeItemBg(1), this.updateLockDetail(e))
    },
    updateItemViewByType: function(e) {
        this.itemView.spriteFrame = this.itemView_viewList[e.type], this.item_name.string = new String(e.name), this.item_time_cost.string = new String(e.timeCost), this.item_time_cost.getComponent(cc.Widget).left = 40
    },
    updateLabelStr: function(e, t) {
        e.string = new String(t)
    },
    tipsBuySuccess: function() {
        //console.log("fuck!!!");
        var e = cc.instantiate(this.node_addItem),
            t = cc.sequence(cc.fadeIn(.1), cc.moveTo(.5, cc.v2(e.position.x, e.position.y + 50)), cc.fadeOut(.1), cc.callFunc(function() {
                e.removeFromParent()
            }));
        e.active = !0, e.parent = this.node, e.runAction(t)
    },
    buySeed: function() {
        if (this.isEnoughBuy()) {
            var e = new cc.Event.EventCustom("buySeed", !0);
            e.detail = this.data, this.node.dispatchEvent(e), this.changeSeedNumber(), this.tipsBuySuccess()
        } else cc.systemEvent.emit("SHOW_WORD_NOTICE", {
            code: 1001
        })
    },
    changeSeedNumber: function() {
        this.data.number += 1, this.updateLabelStr(this.item_amount_number, this.data.number)
    },
    changeItemBg: function(e) {
        this.item_bg.spriteFrame = this.list_itembg[e]
    },
    isEnoughBuy: function() {
        var e = cc.game.FarmUtils.getLocalData("localFarmInfo").coin;
        return e || (e = 0), e >= this.data.price
    },
    updateLockDetail: function(e) {
        this.node_display_unlock.active = !1, this.node_display_lock.active = !0, this.label_lock_name.string = new String(e.name), this.label_lock_level.string = new String("level " + e.limitedlevel + " unlock"), this.sprite_lock_view.spriteFrame = this.list_lock_view[e.type]
    },
    updateUnlockDetail: function(e) {
        this.node_display_unlock.active = !0, this.node_display_lock.active = !1, this.itme_level.string = "lv." + e.level, this.updateItemViewByType(e), this.updateLabelStr(this.item_sell_price, e.price), this.updateLabelStr(this.item_amount_number, e.number), this.updateLabelStr(this.item_get_number, e.produce)
    },
    
});
