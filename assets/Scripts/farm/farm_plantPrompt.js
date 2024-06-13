var framUtils = require("./framUtils"),
FarmData = require("./FarmData"),
n = FarmData.plantLimitedList;
cc.Class({
    extends: cc.Component,

    properties: {
        container: cc.Node,
        item_plant_seed: cc.Prefab,
        node_touchNode1: cc.Node,
        node_touchNode2: cc.Node
    },
    onLoad: function() {
        this.node_touchNode1.on(cc.Node.EventType.TOUCH_END, this.hideView, this), this.node_touchNode2.on(cc.Node.EventType.TOUCH_END, this.hideView, this), this.itemPool = new cc.NodePool, this.node.on("touchBuyBtn", this.touchBuyBtn, this)
    },
    initPlantContainer: function() {
        var e = framUtils.getObjectProperty("localFarmInfo", "level");
        e = "number" == typeof e ? e : 1, this.container.children.length > 0 && this.recycleItem();
        var t, a = framUtils.getLocalData("seedData");
        a || (a = FarmData.seedData, framUtils.setLocalData(a, "seedData"));
        for (var o = 0; o < a.length; o++) t = this.itemPool && this.itemPool.size() > 0 ? this.itemPool.get() : cc.instantiate(this.item_plant_seed), a[o].limitedLevel = n[o], t.parent = this.container, t.getComponent("item_farm_plant_seed").updateItem(a[o], e)
    },
    recycleItem: function() {
        var e, t = this.container.children.length;
        if (t > 0)
            for (var i = t - 1; i >= 0; i--) "item_farm_plant_seed" == (e = this.container.children[i]).name ? this.itemPool.put(e) : e.removeFromParent();
        else cc.log("error:no children in the container")
    },
    showView: function() {
        this.initPlantContainer(), this.node.active = !0, this.nodeFadeIn()
    },
    nodeFadeIn: function() {
        var e = cc.view.getDesignResolutionSize(),
            t = -(e.height + this.node.height) / 2,
            i = -(e.height - this.node.height) / 2,
            s = cc.v2(0, t);
        this.node.position = s;
        var n = cc.spawn(cc.fadeIn(.25), cc.moveTo(.25, cc.v2(0, i)));
        this.node.runAction(n)
    },
    nodeFadeOut: function() {
        var e = this,
            t = -(cc.view.getDesignResolutionSize().height + this.node.height) / 2,
            i = cc.sequence(cc.spawn(cc.fadeOut(.25), cc.moveTo(.25, cc.v2(0, t))), cc.callFunc(function() {
                cc.director.farmDialog.mask.active = !1, e.node.active = !1
            }));
        this.node.runAction(i)
    },
    hideView: function() {
        cc.director.currentPlantIndex = -1, 
        cc.director.SoundManager.playSound("farm_btn"), 
        this.nodeFadeOut()
    },
    touchBuyBtn: function() {
        cc.director.currentPlantIndex = -1;
        var e = this,
            t = -(cc.view.getDesignResolutionSize().height + this.node.height) / 2,
            i = cc.sequence(cc.spawn(cc.fadeOut(.25), cc.moveTo(.25, cc.v2(0, t))), cc.callFunc(function() {
                cc.director.farmDialog.mask.active = !1, e.node.active = !1, cc.director.farmDialog.showFarmShop()
            }));
        this.node.runAction(i)
    },
    showFarmGuide: function() {
        cc.systemEvent.emit("SHOW_FARM_GUIDE")
    }
});
