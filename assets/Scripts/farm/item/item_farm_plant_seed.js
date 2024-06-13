

cc.Class({
    extends: cc.Component,

    properties: {
        sprite_view: cc.Sprite,
        label_number: cc.Label,
        list_view: [cc.SpriteFrame],
        list_view_lock: [cc.SpriteFrame],
        node_locked: cc.Node,
        label_locked_level: cc.Label,
        node_buy: cc.Node,
        label_buy_price: cc.Label
    },
    onLoad: function() {},
    updateItem: function(e, t) {
        this.data = e, e.limitedLevel <= t ? (this.node.on(cc.Node.EventType.TOUCH_END, this.showPlantOperate, this), this.plantUnlocked()) : this.plantLocked()
    },
    plantLocked: function() {
        this.updateUnlockedLevel(this.data.limitedLevel), this.showLockedState(this.data.isUnlock)
    },
    plantUnlocked: function() {
        this.node_locked.active = !1, this.updateSpriteView(this.data.type, this.list_view), this.data.number > 0 ? (this.updateNumber(this.data.number), this.label_number.node.active = !0) : (this.node_buy.active = !0, this.updateBuyPrice(this.data.price))
    },
    updateSpriteView: function(e, t) {
        "number" == typeof e ? this.sprite_view.spriteFrame = t[e] : cc.log("error:type is not a number,37")
    },
    updateNumber: function(e) {
        "number" == typeof e ? e > 0 ? (this.hideBuyBtn(), this.label_number.string = e + "") : this.showBuybtn() : cc.log("error:num is not a number,51")
    },
    updateUnlockedLevel: function(e) {
        "number" == typeof e ? this.label_locked_level.string = "" + e : cc.log("error:num is not a number,60")
    },
    updateBuyPrice: function(e) {
        "number" == typeof e ? this.label_buy_price.string = e + "" : cc.log("error:num is not a number,69")
    },
    showLockedState: function() {
        this.label_number.node.active = !1, this.node_buy.active = !1, this.node_locked.active = !0, this.updateSpriteView(this.data.type, this.list_view_lock)
    },
    showBuybtn: function() {
        this.node_locked.active = !1, this.label_number.node.active = !1, this.node_buy.active = !0
    },
    hideBuyBtn: function() {
        this.node_locked.active = !1, this.label_number.node.active = !0, this.node_buy.active = !1
    },
    showPlantOperate: function() {
        this.data.isUnlock && this.data.number > 0 && (cc.director.farmDialog.hidePlantPrompt(), cc.director.farmDialog.showOperateView(), cc.director.currentPlantIndex = this.data.type, this.data.mode = 0, cc.systemEvent.emit("SHOW_OPERATE", {
            data: this.data
        }))
    },
    buyClick: function() {
        var e = new cc.Event.EventCustom("touchBuyBtn", !0);
        this.node.dispatchEvent(e)
    },
    
});
