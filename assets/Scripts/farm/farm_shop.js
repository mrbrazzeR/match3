var FarmData = require("./FarmData"),
framUtils = require("./framUtils"),
 n = FarmData.plantLimitedList;
cc.Class({
    extends: cc.Component,

    properties: {
        btn_seed: cc.Node,
        btn_prop: cc.Node,
        btn_seed_viewList: [cc.SpriteFrame],
        btn_prop_viewList: [cc.SpriteFrame],
        node_seedContainer: cc.Node,
        node_propContainer: cc.Node,
        item_seed: cc.Prefab,
        item_prop: cc.Prefab,
        node_seed: cc.Node,
        node_prop: cc.Node,
        node_coin: cc.Node,
        label_coin_number: cc.Label
    },
    onLoad: function() {
        this.node.on("buy_prop", this.buyProps, this), this.node.on("buySeed", this.buySeed, this), this.propPool = new cc.NodePool, this.seedPool = new cc.NodePool, this.addNumberPool = new cc.NodePool
    },
    initSeedContainer: function() {
        var e = framUtils.getObjectProperty("localFarmInfo", "level");
        e = "number" == typeof e ? e : 1, this.node_seedContainer.children.length > 0 && this.recycleRankItem(this.node_seedContainer, this.seedPool, "item_farm_seed");
        cc.log("===", this.composeShopSeedData())
        for (var t, i = this.composeShopSeedData(), a = FarmData.length, o = 0; o < a; o++) 
            t = this.seedPool.size() > 0 ? this.seedPool.get() : cc.instantiate(this.item_seed), 
            i[o].limitedlevel = n[o], t.parent = this.node_seedContainer, 
            t.getComponent("item_farm_seed").initItemSeed(i[o], e)
    },
    composeShopSeedData: function() {
        var e = framUtils.getLocalData("seedData");
        e || (e = FarmData.seedData);
        for (var t = FarmData.shopSeedData, n = t.length, a = 0; a < n; a++)
            for (var o = t[a], c = 0; c < e.length; c++) {
                var r = e[c];
                if (o.type == r.type) {
                    o.number = r.number, o.level = r.level, o.name = FarmData.plantInfo[o.type].name, o.timeCost = FarmData.seedLabel[o.type].matureTime, o.produce = FarmData.getPlantProduce(r.level, r.type);
                    break
                }
            }
        return t
    },
    computedCurrentProduce: function(e, t) {
        return Math.floor(e * Math.pow(1 + FarmData.PRODUCE_RATE, t - 1))
    },
    initPropContainer: function() {
        this.node_propContainer.children.length > 0 && this.recycleRankItem(this.node_propContainer, this.propPool, "item_farm_prop");
        for (var e = FarmData.propShopList, t = e.length, s = 0; s < t; s++) {
            var n = cc.instantiate(this.item_prop),
                a = e[s];
            a.index = s, n.getComponent("item_farm_prop").updateItem(a), n.parent = this.node_propContainer
        }
    },
    buyProps: function(e) {
        var t = e.detail;
        cc.systemEvent.emit("UPDATE_PROPS", {
            data: {
                mode: 1,
                type: t.type
            }
        }), this.updateCoins(), this.iconCoinScale(), cc.director.SoundManager.playSound("farm_shopBuy")
    },
    buySeed: function(e) {
        var t = e.detail;
        cc.systemEvent.emit("ADD_COINS", -t.price), cc.systemEvent.emit("UPDATE_SEED", {
            data: {
                mode: 1,
                type: t.type,
                number: 1
            }
        }), this.updateCoins(), this.iconCoinScale(), cc.director.SoundManager.playSound("farm_shopBuy")
    },
    buySuccess: function() {},
    buyFail: function() {},
    showSeedContainer: function() {
        if(!this.node_seed.active){
             cc.director.SoundManager.playSound("farm_btn")
             this.initSeedContainer(), 
             this.node_seed.active = !0, 
             this.node_prop.active = !1, 
             this.btn_seed.getComponent(cc.Sprite).spriteFrame = this.btn_seed_viewList[0], 
             this.btn_prop.getComponent(cc.Sprite).spriteFrame = this.btn_prop_viewList[1]
        }

    },
    showPropContainer: function() {
        this.node_prop.active || (cc.director.SoundManager.playSound("farm_btn"), this.initPropContainer(), this.node_seed.active = !1, this.node_prop.active = !0, this.btn_seed.getComponent(cc.Sprite).spriteFrame = this.btn_seed_viewList[1], this.btn_prop.getComponent(cc.Sprite).spriteFrame = this.btn_prop_viewList[0])
    },
    showView: function() {
        this.node.active = !0, this.showPromptWithScale(this.node), this.showSeedContainer(), this.updateCoins()
    },
    showPromptWithScale: function(e) {
        e.scale = .2, e.runAction(cc.scaleTo(.3, 1).easing(cc.easeBackOut(3)))
    },
    recycleRankItem: function(e, t, i) {
        var s = e.children;
        if (s.length > 0)
            for (var n = s.length - 1; n >= 0; n--) {
                var a = s[n];
                a.name == i ? t.put(a) : a.removeFromParent()
            }
    },
    hideView: function() {
        cc.director.farmDialog.hideFarmChild()
        this.node_prop.active = !1, this.node_seed.active = !1, this.node.active = !1
    },
    
    updateCoins: function() {
        var e = framUtils.getLocalData("localFarmInfo").coin;
        e || (e = 0), console.log(e, "217"), this.label_coin_number.string = e + ""
    },
    iconCoinScale: function() {
        var e = cc.sequence(cc.scaleTo(.3, 1.2), cc.scaleTo(.3, .9), cc.scaleTo(.1, 1));
        this.node_coin.stopAllActions(), this.node_coin.runAction(e)
    }
});
