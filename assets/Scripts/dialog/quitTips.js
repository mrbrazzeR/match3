import utils  from "../utils"
import gameData from "../gameData"
cc.Class({
    extends: cc.Component,

    properties: {},
    showView: function() {
        this.node.active = !0, utils.showPromptWithScale(this.node)
        cc.director.SoundManager.playSound("btnEffect")
    },
    hideView: function() {
        this.node.active = !1
        cc.director.dialogScript.hideAllChildrenNode()
        cc.director.SoundManager.playSound("btnEffect")
    },
    showRetryPrompt(){

    },
    jumpToInterface: function() {
        cc.director.SoundManager.playSound("btnEffect") 
        gameData.tournamentData = null
        gameData.passRate = -1
        gameData.storeGameData()
        cc.director.dialogScript.hideAllChildrenNode()
        //cc.director.loadScene("interface")
       /*  cc.director.gameManager.setActive(1)
        cc.director.jumpCode = 2 */
        this.node.active = !1
        cc.director.dialogScript.showRetryPrompt()  
        
    },
            
});
