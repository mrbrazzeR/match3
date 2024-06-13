import utils  from "../utils"
import gameData from "../gameData"
import psconfig from "../psconfig"
var playerTooLCostList = psconfig.playerTooLCostList;
cc.Class({
    extends: cc.Component,

    properties: {
        contentList: cc.Node,
        item: cc.Prefab,
    },

    onLoad: function() {
        this.node.on("buyPlayerTool", this.buyPlayerTool, this)
        this.winSize = cc.view.getDesignResolutionSize()
        cc.systemEvent.on("UPDATE_TOOLLIST_SHOP", this.updatePlayerToolCount, this)
    },
    showView: function() {
        this.node.active = !0, utils.showPromptWithScale(this.node), this.initShopList(), this.playerToolIntoView(!0)
    },
    initShopList: function() {
        this.contentList.children.length > 0 && this.contentList.removeAllChildren();
        for (var e = 0; e < playerTooLCostList.length; e++) {
            var t = cc.instantiate(this.item);
            t.getComponent("item_shop").initItemView(playerTooLCostList[e]), t.parent = this.contentList
        }
    },
    hideView: function() {
        cc.director.funcView.hideAllChilden()
        this.node.active = !1
    },
    buyPlayerTool: function(e) {
        var t = e.detail.data.type,
            i = e.detail.data.price;
        gameData.starCount -= i
        cc.systemEvent.emit("UPDATE_COINS")
        cc.systemEvent.emit("SUCCESS_BUY_ANIMA", {
            type: t
        })
    },
    updatePlayerToolCount: function(e) {
        gameData.game_prop.length <= 0 && (gameData.game_prop = [{
            type: 0,
            name: "battle",
            number: 0
        }, {
            type: 1,
            name: "fork",
            number: 0
        }, {
            type: 2,
            name: "hammer",
            number: 0
        }, {
            type: 3,
            name: "dice",
            number: 0
        }]);

        if (e && "number" == typeof e.type) {
            gameData.changeGameTool("playerTool", 1, e.type, true)
            cc.log("storeGameData changeGameTool")
            gameData.storeGameData()
            cc.director.funcView.toolItemList[e.type].getChildByName("number").getComponent(cc.Label).string = "" + gameData.game_prop[e.type].number;}
        else{
            for (var i = 0; i <  cc.director.funcView.toolItemList.length; i++){  
                cc.director.funcView.toolItemList[i].getChildByName("number").getComponent(cc.Label).string = "" + gameData.game_prop[i].number
            }
        }
    },
    playerToolIntoView: function(e) {
        this.winSize || (this.winSize = cc.view.getDesignResolutionSize()),  cc.director.funcView.footer.position = cc.v2(0, -this.winSize.height / 2 -  cc.director.funcView.footer.height), e && this.updatePlayerToolCount(),  cc.director.funcView.footer.active = !0;
        var t = cc.spawn(cc.fadeIn(.3), cc.moveTo(.3, cc.v2(0, -this.winSize.height / 2 +  cc.director.funcView.footer.height / 2)).easing(cc.easeBackOut(3)));
         cc.director.funcView.footer.runAction(t)
    },
    playerToolAwayFromView: function() {
        this.winSize || (this.winSize = cc.view.getDesignResolutionSize());
        var e = this,
            t = cc.sequence(cc.spawn(cc.fadeOut(.3), cc.moveTo(.3, cc.v2(0, -this.winSize.height / 2))), cc.callFunc(function() {
                e.footer.active = !1
            }));
         cc.director.funcView.footer.runAction(t)
    },
});
