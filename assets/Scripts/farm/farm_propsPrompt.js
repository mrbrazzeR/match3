var framUtils = require("./framUtils"),
FarmData = require("./FarmData");
cc.Class({
    extends: cc.Component,

    properties: {
        container: cc.Node,
        item_props: cc.Prefab,
        node_touchNode1: cc.Node,
        node_touchNode2: cc.Node
    },
    onLoad: function() {
        this.node_touchNode1.on(cc.Node.EventType.TOUCH_END, this.hideView, this), this.node_touchNode2.on(cc.Node.EventType.TOUCH_END, this.hideView, this), this.node.on("atuoUseProp", this.autoUseProp, this), this.itemPool = new cc.NodePool
    },
    showView: function() {
        this.initPropContainer(), this.node.active = !0, this.nodeFadeIn()
    },
    initPropContainer: function() {
        this.container.children.length > 0 && this.recycleItem();
        var e, t = framUtils.getLocalData("propsData");
        t || (t = FarmData.propsData, framUtils.setLocalData(t, "propsData"));
        for (var n = 0; n < t.length; n++) e = this.itemPool && this.itemPool.size() > 0 ? this.itemPool.get() : cc.instantiate(this.item_props), t[n].timeStr = FarmData.propShopList[t[n].type].timeStr, e.parent = this.container, e.getComponent("item_farm_backpack").initItem(t[n])
    },
    recycleItem: function() {
        var e, t = this.container.children.length;
        if (t > 0)
            for (var i = t - 1; i >= 0; i--) "item_farm_prop" == (e = this.container.children[i]).name ? this.itemPool.put(e) : e.removeFromParent();
        else cc.log("error:no children in the container")
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
        cc.director.currentPropsIndex = -1, this.nodeFadeOut(), cc.director.SoundManager.playSound("farm_btn")
    },
    autoUseProp: function(e) {
        console.log(e.detail);
        var t = e.detail.data;
        t.type >= 4 && t.type < 8 ? cc.systemEvent.emit("FERT_ALLLAND_TIME", {
            type: t.type,
            mode: 1
        }) : t.type >= 8 && t.type < 12 && cc.systemEvent.emit("STARTOVER_AUTOWATER", {
            type: t.type,
            mode: 1
        }), this.hideView(), cc.systemEvent.emit("UPDATE_PROPS", {
            data: {
                mode: 2,
                type: t.type
            }
        })
    },
    showFarmGuide: function() {
        cc.systemEvent.emit("SHOW_FARM_GUIDE")
    },
    
});
