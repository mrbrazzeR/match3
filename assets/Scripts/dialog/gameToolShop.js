import utils  from "../utils"
import gameData from "../gameData"
import psconfig from "../psconfig"
cc.Class({
    extends: cc.Component,

    properties: {
        tool_name: cc.Sprite,
        tool_view: cc.Sprite,
        tool_function: cc.Sprite,
        viewList: [cc.SpriteFrame],
        funcList: [cc.SpriteFrame],
        nameList: [cc.SpriteFrame],
        price: cc.Label
    },

    onLoad: function() {
        this.count = 0, cc.director.UiCacheList = [], this.playerToolPrice = psconfig.playerTooLCostList, this.gameToolCost = psconfig.gameToolCost, this.currentPrice = 0
    },
    showView: function(e, t) {
        cc.log("showView tool SHop", e,t)
        this.node.active = !0
        utils.showPromptWithScale(this.node)
        1 == t && (
            this.tool_name.spriteFrame = this.nameList[e], this.tool_view.spriteFrame = this.viewList[e], this.tool_function.spriteFrame = this.funcList[e], this.price.string = this.gameToolCost + "", this.currentPrice = this.gameToolCost
        )
        2 == t && (
            this.tool_name.spriteFrame = this.nameList[e + 2], this.tool_view.spriteFrame = this.viewList[e + 2], this.tool_function.spriteFrame = this.funcList[e + 2], this.price.string = this.playerToolPrice[e - 1].price + "", this.currentPrice = this.playerToolPrice[e - 1].price
        )
        this.type = e
        this.index = t
    },
    hideView: function() {
        //cc.director.screenDialog.mask.active = false
        cc.log(this.index)
        cc.director.screenDialog.hideAllChild()
        this.node.active = !1;
        var e = cc.director.gameManager.screenName;
        if(e =="game"){
            if(this.index == 1){
                cc.director.dialogScript.showRetryPrompt()      
                cc.log("showRetryPrompt")     
            }
            //cc.director.dialogScript.hideAllChildrenNode()
            //cc.director.dialogScript.mask.active = false
        }
        if(e =="main"){
            cc.director.screenDialog.showStartPrompt()
            //cc.director.screenDialog.hideAllChild()
        }
   
    },
    buyGameTool: function() {
        var e, t;
        cc.director.SoundManager.playSound("btnEffect")
        1 == this.index && (e = "gameTool", t = this.type);
        2 == this.index && (e = "playerTool", t = this.type - 1);
        var i = cc.director.gameManager.screenName;
        if(gameData.starCount >= this.currentPrice){
            gameData.starCount -= this.currentPrice
            if("game" == i){
                gameData.changeGameTool(e, 1, t, !0)
                cc.log("storeGameData changeGameTool")
                gameData.storeGameData()
                1 == this.index ? this.hideView() : (
                    cc.systemEvent.emit("AFTER_BUY_PLAYERTOOL", {
                         num: t + 1
                    }), cc.director.dialogScript.hidePlayerShop()
                )
            }

            if("main" == i){
                gameData.changeGameTool(e, 1, t, !0)
                cc.log("storeGameData changeGameTool")
                gameData.storeGameData()
       
                cc.systemEvent.emit("UPDATE_COINS"), 
                cc.systemEvent.emit("TIPS_SUCCESS", {
                    word: "Buy success!"
                })
            }
        }else{
            "game" == i && cc.director.dialogScript.showFreeCoinsPanel(this.index)
            "main" == i && cc.director.screenDialog.showCoinsPanel()
        }
      
    },
    
});
