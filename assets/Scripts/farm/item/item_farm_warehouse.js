
cc.Class({
    extends: cc.Component,

    properties: {
        view: cc.Node,
        list_view: [cc.SpriteFrame],
        label_number: cc.Label
    },
    onLoad: function() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
    },
    initItemDetail: function(e) {
        this.data = e, this.updateNumber(e.number), this.updateView(e.type)
    },
    updateNumber: function(e) {
        "number" == typeof e ? this.label_number.string = "" + e : cc.log("The params is not number!")
    },
    updateView: function(e) {
        "number" == typeof e && (this.view.getComponent(cc.Sprite).spriteFrame = this.list_view[e])
    },
    onTouchEnd: function() {
        var e = new cc.Event.EventCustom("click_item", !0);
        e.detail = {
            index: this.data.index,
            number: this.data.number,
            type: this.data.type
        }, this.node.dispatchEvent(e), cc.director.currentPlantIndex = this.data.type
    },
    
});
