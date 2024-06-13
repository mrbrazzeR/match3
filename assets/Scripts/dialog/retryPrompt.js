
import utils  from "../utils"
import gameData from "../gameData"
cc.Class({
    extends: cc.Component,

    properties: {
        level: cc.Label,
        toolList: require("./toolChoose"),
        selectArea: cc.Node,
        titleWin: cc.Node
    },
    showView: function() {
        this.node.active = !0
        utils.showPromptWithScale(this.node)
        this.toolList.updateGameToolNumber(gameData.gameToolList)
        this.updateLevelString()
    },
    hideView: function() {
        this.toolList.resumeData()
        this.node.active = !1
    },
    jumpToMainScreen: function() {
        gameData.passRate = -1
        gameData.storeGameData();
        gameData.tournamentData = null
        cc.log("=====storeGameData====== retryPromt")
         //cc.director.loadScene("interface")
        this.toolList.resumeData()
        this.node.active = !1
        cc.director.dialogScript.mask.active = false
        cc.director.gameManager.setActive(1)
        cc.director.jumpCode = 2
    },
    tryAgain: function() {
        gameData.continueTimesViewReward = 0
        cc.director.dialogScript.hideRetryPrompt()
        cc.director.container.startNewGame()    
    },
    updateLevelString: function() {
        if(gameData.tournamentData){
            this.level.node.active = false
            this.titleWin.active = true
        }else{        
            this.titleWin.active = false
            this.level.node.active = true
            this.level.string = gameData.bestLevel + 1 + ""
        }
    },
    
});
