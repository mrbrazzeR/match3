cc.Class({
    extends: cc.Component,

    properties: {
        label_tips_text: cc.Label,
        label_plant_number: cc.Label,
        sprite_plant_view: cc.Sprite,
        list_plant_seed: [cc.SpriteFrame],
        list_plant_props: [cc.SpriteFrame]
    },
    onLoad: function() {
        cc.systemEvent.on("UPDATE_OPERATE_NUMBER", this.updatePlantNumber, this)
        this.addOperateListener()
    },
    addOperateListener: function() {
        cc.systemEvent.on("SHOW_OPERATE", this.updateOperateView, this), this.operateTextList = ["In using the seeds", "In using the props"]
    },
    updatePlantNumber: function(e) {
        this.updateLabelString(e.number, this.label_plant_number), 0 == e.number && this.scheduleOnce(function() {
            this.showPromptByMode()
        }, 3)
    },
    updateOperateView: function(e) {
        var t = e.data;
        this.data = t, this.updateLabelString(this.operateTextList[t.mode], this.label_tips_text), this.updateLabelString(t.number, this.label_plant_number), 0 == t.mode ? this.updateSpriteView(this.sprite_plant_view, this.list_plant_seed, t.type) : 1 == t.mode && this.updateSpriteView(this.sprite_plant_view, this.list_plant_props, t.type)
    },
    updateLabelString: function(e, t) {
        t.string = new String(e)
    },
    updateSpriteView: function(e, t, i) {
        e.spriteFrame = t[i]
    },
    showView: function() {
        this.node.active = !0, cc.systemEvent.emit("HIDE_LAND_STATUE")
    },
    hideView: function() {
        this.node.active = !1, cc.director.currentPlantIndex = -1, cc.director.currentPropsIndex = -1, cc.systemEvent.emit("SHOW_LAND_STATUE")
    },
    showPromptByMode: function() {
        cc.director.farmDialog.hideOperateView()
         0 == this.data.mode ? cc.director.farmDialog.showPlantPrompt() : 1 == this.data.mode && cc.director.farmDialog.showPropsView()
    },
    
});
