// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        sprite_itemView: cc.Sprite,
        list_itemView: [cc.SpriteFrame],
        label_itemEffectTime: cc.Label,
        label_itemNumber: cc.Label
    },
    onLoad: function() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.showFertilization, this)
    },
    initItem: function(e) {
        console.log(e), this.data = e, this.updateView(e.type), this.label_itemEffectTime.string = new String(e.timeStr), this.updateNumber(e.number)
    },
    updateView: function(e) {
        "number" == typeof e ? this.sprite_itemView.spriteFrame = this.list_itemView[e] : cc.log("type is null or params error!----view")
    },
    updateEffectTime: function(e) {
        "number" == typeof e ? this.sprite_itemEffectTime.spriteFrame = this.list_effectTime[e] : cc.log("type is null or params error---effectTime!")
    },
    updateNumber: function(e) {
        this.label_itemNumber.string = new String(e)
    },
    showFertilization: function() {
        if (this.data.number > 0)
            if (cc.director.currentPropsIndex = this.data.type, this.data.type >= 0 && this.data.type < 4 || this.data.type >= 12 && this.data.type < 15) cc.director.farmDialog.hidePropsView(), cc.director.farmDialog.showOperateView(), cc.director.currentPropsIndex = this.data.type, this.data.mode = 1, cc.systemEvent.emit("SHOW_OPERATE", {
                data: this.data
            });
            else {
                var e = new cc.Event.EventCustom("atuoUseProp", !0);
                this.data.mode = 1, e.detail = {
                    data: this.data
                }, this.node.dispatchEvent(e), cc.systemEvent.emit("SHOW_OPERATE", {
                    data: this.data
                })
            }
    },
    
});
