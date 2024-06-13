import utils  from "../utils"
import gameData from "../gameData"
cc.Class({
    extends: cc.Component,

    properties: {
        toolArea: cc.Node,
        //funcView: require("../mainScreen/funcView"),
        currentLevel: cc.Label,
        selectArea: cc.Node,
        bigStar: cc.Prefab,
        //guideView: require("../mainScreen/guideScreenNode") 
    },

    onLoad: function() {
        this.toolAreaScript = this.toolArea.getComponent("toolChoose")
    },
    showView: function() {
        if(8 == gameData.bestLevel){
            gameData.gameToolGuide || (
                gameData.gameToolList = [1, 1, 1],
                gameData.storeGameData()
            )
            cc.systemEvent.emit("STOP_TOUCH", {
                number: 1
            })
            this.scheduleOnce(function() {
                cc.director.guideView.showGameToolGuide(),
                cc.systemEvent.emit("STOP_TOUCH", {
                    number: 2
                })
            }, .6)
        }
        this.node.active = !0,
        utils.showPromptWithScale(this.node),
        this.toolAreaScript.updateGameToolNumber(gameData.gameToolList),
        this.currentLevel.string = (gameData.bestLevel + 1) + ""
    },
    hideView: function() {
        cc.director.screenDialog.hideAllChild()
        this.node.active = !1
        this.toolAreaScript.resumeData()
    }, 
    jumpToGameView: function() {  

        //cc.director.loadScene("interface")  
        cc.director.gameManager.setActive(2)       
        cc.director.jumpCode = 1
        cc.director.container.startNewGame()
        cc.director.screenDialog.hideAllChild()
        this.node.active = false
        if(cc.director.FbManager.IS_FB_INSTANT){
            var type = cc.director.FbManager.getContextSizeType()
            cc.log("===========context Type: ", type)
            cc.director.FbManager.switchToContextSolo()
        }               
    },
});
