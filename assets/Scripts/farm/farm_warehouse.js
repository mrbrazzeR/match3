var framUtils = require("./framUtils"),
FarmData = require("./FarmData");
cc.Class({
    extends: cc.Component,

    properties: {
        warehouse_container: cc.Node,
        item_vagetable: cc.Prefab,
        item_prompt_view: cc.Sprite,
        display_view_list: [cc.SpriteFrame],
        mask: cc.Node,
        node_prompt: cc.Node,
        node_sell: cc.Node,
        label_prompt_number: cc.Label,
        node_prompt_name: cc.Sprite,
        label_btn_sell_price: cc.Label,
        label_btn_sell_totalPrice: cc.Label,
        node_null: cc.Node,
        node_btn_sellAll: cc.Node,
        node_farmer: cc.Node
    },
    onLoad: function() {
        this.node.on("click_item", this.showItemDeatailPrompt, this)
    },
    showItemDeatailPrompt: function(e) {
        for (var t, i = e.detail, n = {}, a = FarmData.plantInfo, o = -1, c = 0; c < a.length; c++)
            if (a[c].type == i.type) {
                o = c;
                break
            } o >= 0 ? (t = a[o]) && (n.name = t.name, n.price = t.price, n.type = t.type, n.number = i.number, this.showItemPrompt(n)) : cc.log("warehouse error: no type! ")
    },
    updatePromptView: function(e) {
        this.data = e, console.log(e), this.label_prompt_number.string = e.number + "", this.label_btn_sell_price.string = e.number * e.price + "", this.item_prompt_view.spriteFrame = this.display_view_list[e.type], this.itemCount = e.number, this.addItemNumber()
    },
    addItemNumber: function() {
        this.itemCount < this.data.number ? (this.itemCount++, this.label_prompt_number.string = this.itemCount + "") : this.label_prompt_number.string = this.itemCount + "", this.label_btn_sell_price.string = this.itemCount * this.data.price + ""
    },
    reduceItemNumber: function() {
        this.itemCount > 1 ? (this.itemCount--, this.label_prompt_number.string = this.itemCount + "") : this.label_prompt_number.string = this.itemCount + "", this.label_btn_sell_price.string = this.itemCount * this.data.price + ""
    },
    showItemPrompt: function(e) {
        this.itemCount = e.number, this.mask.active = !0, this.node_prompt.active = !0, framUtils.showPromptWithScale(this.node_prompt), this.updatePromptView(e)
    },
    hideItemPrompt: function() {
        this.mask.active = !1, this.node_prompt.active = !1
    },
    initWarehouseContainer: function() {
        this.recycleItem();
        var e, t = framUtils.getLocalData("warehouseData");
        if (t) {
            if ((e = t.length) <= 0) return this.node_null.active = !0, void(this.node_btn_sellAll.getComponent(cc.Button).interactable = !1);
            this.node_btn_sellAll.getComponent(cc.Button).interactable = !0, this.node_null.active = !1;
            for (var s = 0; s < e; s++) {
                var n = void 0;
                this.itemPool ? n = this.itemPool.size() > 0 ? this.itemPool.get() : cc.instantiate(this.item_vagetable) : (this.itemPool = new cc.NodePool, n = cc.instantiate(this.item_vagetable));
                var a = t[s];
                a.index = s, n.getComponent("item_farm_warehouse").initItemDetail(a), n.parent = this.warehouse_container
            }
        } else this.node_null.active = !0, this.node_btn_sellAll.getComponent(cc.Button).interactable = !1
    },
    recycleItem: function() {
        var e = this.warehouse_container.children.length;
        if (e && e > 0)
            for (var t = e - 1; t >= 0; t--) {
                var i = this.warehouse_container.children[t];
                this.itemPool || (this.itemPool = new cc.NodePool), this.itemPool.put(i)
            }
    },
    sell: function() {
        var e = {
            type: this.data.type,
            number: this.itemCount
        };
        cc.systemEvent.emit("UPDATE_WAREHOUSE", {
            data: e,
            mode: 2
        });
        var t = this.data.price * this.itemCount;
        cc.systemEvent.emit("OBTAIN_COINS", {
            coin: t
        }), this.hideItemPrompt(), this.initWarehouseContainer()
    },
    sellAll: function() {
        for (var e = framUtils.getLocalData("warehouseData"), t = 0; t < e.length; t++) {
            var s = {
                type: e[t].type,
                number: e[t].number
            };
            cc.systemEvent.emit("UPDATE_WAREHOUSE", {
                data: s,
                mode: 2
            })
        }
        var n = this.totalEarn;
        cc.systemEvent.emit("OBTAIN_COINS", {
            coin: n
        }), this.hideSellAll(), this.initWarehouseContainer()
    },
    showView: function() {
        this.node.active = !0, this.showPromptWithScale(this.node), this.initWarehouseContainer()
    },
    hideView: function() {
        cc.director.farmDialog.hideFarmChild()
        this.node_farmer.active = !1, this.node.active = !1
    },
    showSellAll: function() {
        var e = this.computedAllPrice();
        this.totalEarn = e, this.mask.active = !0, this.node_sell.active = !0, framUtils.showPromptWithScale(this.node_sell), this.label_btn_sell_totalPrice.string = e + ""
    },
    hideSellAll: function() {
        this.mask.active = !1, this.node_sell.active = !1
    },
    showPromptWithScale: function(e) {
        var t = this;
        e.scale = .2, e.runAction(cc.sequence(cc.scaleTo(.3, 1).easing(cc.easeBackOut(3)), cc.callFunc(function() {
            t.farmerFadeIn()
        })))
    },
    computedAllPrice: function() {
        var e, t = framUtils.getLocalData("warehouseData"),
            n = FarmData.plantInfo,
            a = 0;
        if (t)
            for (var o = t.length, c = 0; c < o; c++) {
                for (var r = t[c].type, d = 0; d < n.length; d++)
                    if (r === n[d].type) {
                        e = n[d].price;
                        break
                    } a += e * t[c].number
            }
        return console.log(a), a
    },
    warehouseFadeIn: function() {
        var e = this;
        this.node.position = cc.v2(800, -50), this.node_farmer.active = !1;
        var t = cc.sequence(cc.moveTo(.5, cc.v2(0, -50)).easing(cc.easeIn(3)), cc.callFunc(function() {
            e.farmerFadeIn()
        }));
        this.node.runAction(t)
    },
    farmerFadeIn: function() {
        this.node_farmer.active = !0, this.node_farmer.position = cc.v2(-650, 100);
        var e = cc.moveTo(.5, cc.v2(-100, 100)).easing(cc.easeIn(3));
        this.node_farmer.runAction(e)
    },
    warehouseFadeOut: function() {
        this.node.position = cc.v2(0, -50), this.node_farmer.active = !1;
        var e = cc.sequence(cc.moveTo(.5, cc.v2(800, -50)).easing(cc.easeIn(3)), cc.callFunc(function() {
            cc.director.farmDialog.hideWarehouseView()
        }));
        this.node.runAction(e)
    },
    farmerFadeOut: function() {
        var e = this;
        this.node_farmer.active = !0, this.node_farmer.position = cc.v2(-100, 100);
        var t = cc.sequence(cc.moveTo(.5, cc.v2(-650, 100)).easing(cc.easeIn(3)), cc.callFunc(function() {
            e.warehouseFadeOut()
        }));
        this.node_farmer.runAction(t), cc.director.SoundManager.playSound("farm_btn")
    },
    closeWarehouse: function() {
        this.farmerFadeOut()
    },
});
