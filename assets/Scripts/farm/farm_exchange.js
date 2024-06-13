var framUtils = require("./framUtils"),
s = require("./FarmData").changeRate;
cc.Class({
    extends: cc.Component,

    properties: {
        node_icon: cc.Node,
        node_cost: cc.Node,
        list_cost: [cc.SpriteFrame],
        node_view: cc.Node,
        list_view: [cc.SpriteFrame],
        node_exchangeNumber: cc.Node,
        node_currency: cc.Node,
        node_btnDiamond: cc.Node,
        list_btnDiamond: [cc.SpriteFrame],
        node_btnCoins: cc.Node,
        list_btnCoins: [cc.SpriteFrame],
        node_coinsNumber: cc.Node,
        node_diamondNumber: cc.Node
    },
    showView: function() {
        this.node.active = !0, this.node_currency.active = !1, framUtils.showPromptWithScale(this.node), this.updateCoinsAndDiamondDisplay(), this.scheduleOnce(function() {
            this.showDiamondAndCoins(this.node_currency)
        }, .5), this.diamondExchangeToCoins()
    },
    showDiamondAndCoins: function(e) {
        var t = cc.view.getDesignResolutionSize(),
            i = cc.v2(0, (t.height + e.height) / 2),
            s = cc.v2(0, (t.height - e.height) / 2);
        e.position = i, e.active = !0;
        var n = cc.moveTo(.2, s);
        e.runAction(n)
    },
    hideView: function() {
        cc.director.farmDialog.hideFarmChild()
         cc.director.SoundManager.playSound("farm_btn")  
        this.node.active = !1
    },
    diamondExchangeToCoins: function() {
        this.changeMode = 1, this.changeSpriteView(this.node_view, this.list_view, 0), this.changeSpriteView(this.node_icon, this.list_cost, 1), this.changeSpriteView(this.node_btnDiamond, this.list_btnDiamond, 0), this.changeSpriteView(this.node_btnCoins, this.list_btnCoins, 1), this.unitConvert(100, this.changeMode)
    },
    coinsExchangeToCoins: function() {
        this.changeMode = 2, this.changeSpriteView(this.node_view, this.list_view, 1), this.changeSpriteView(this.node_icon, this.list_cost, 0), this.changeSpriteView(this.node_btnDiamond, this.list_btnDiamond, 1), this.changeSpriteView(this.node_btnCoins, this.list_btnCoins, 0), this.unitConvert(1e4, this.changeMode)
    },
    changeSpriteView: function(e, t, i) {
        e.getComponent(cc.Sprite).spriteFrame = t[i]
    },
    changeLabelContent: function(e, t) {
        e.getComponent(cc.Label).string = new String(t)
    },
    unitConvert: function(e, t) {
        1 == t ? (this.oringeNumber = e * s, this.exchangeNumber = e, this.changeLabelContent(this.node_cost, this.oringeNumber), this.changeLabelContent(this.node_exchangeNumber, this.exchangeNumber)) : 2 == t && (this.exchangeNumber = e, this.oringeNumber = this.exchangeNumber / s, this.changeLabelContent(this.node_cost, this.oringeNumber), this.changeLabelContent(this.node_exchangeNumber, this.exchangeNumber))
    },
    addExchangeNumber: function() {
        1 == this.changeMode ? this.exchangeNumber += 100 : 2 == this.changeMode && (this.exchangeNumber += 1e4), this.unitConvert(this.exchangeNumber, this.changeMode)
    },
    reduceExchangeNumber: function() {
        if (1 == this.changeMode) {
            if (this.exchangeNumber <= 100) return;
            this.exchangeNumber -= 100
        } else if (2 == this.changeMode) {
            if (this.exchangeNumber <= 1e4) return;
            this.exchangeNumber -= 1e4
        }
        this.unitConvert(this.exchangeNumber, this.changeMode)
    },
    exchange: function() {
        var e = framUtils.getCoins(),
            t = framUtils.getLocalData("localFarmInfo");
        1 == this.changeMode ? t.coin >= this.oringeNumber ? (e += this.exchangeNumber, framUtils.saveCoins(e), t.coin -= this.oringeNumber, framUtils.setLocalData(t, "localFarmInfo"), this.updateCoinsAndDiamondDisplay(), cc.systemEvent.emit("SHOW_WORD_NOTICE", {
            code: 1007
        })) : cc.systemEvent.emit("SHOW_WORD_NOTICE", {
            code: 1006
        }) : e > this.oringeNumber ? (t.coin += this.exchangeNumber, e -= this.oringeNumber, framUtils.saveCoins(e), framUtils.setLocalData(t, "localFarmInfo"), this.updateCoinsAndDiamondDisplay(), cc.systemEvent.emit("SHOW_WORD_NOTICE", {
            code: 1007
        })) : cc.systemEvent.emit("SHOW_WORD_NOTICE", {
            code: 1005
        })
    },
    updateCoinsAndDiamondDisplay: function() {
        var e = framUtils.getCoins(),
            t = framUtils.getObjectProperty("localFarmInfo", "coin");
        this.changeLabelContent(this.node_diamondNumber, e), this.changeLabelContent(this.node_coinsNumber, t), cc.systemEvent.emit("UPDATE_FARM_COINS")
    },
    
});
