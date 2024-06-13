
import utils  from "./utils"
import gameData from "./gameData"

cc.Class({
    extends: cc.Component,

    properties: {
        mainScreen: cc.Node,
        gameView: cc.Node,
        loading: cc.Node
    },

    onLoad: function() {
        cc.director.gameManager = this
        //cc.game.addPersistRootNode(thigameData.node),
        cc.systemEvent.on("LOADING_SHOW", this.showLoading, this),
        cc.systemEvent.on("LOADDING_HIDE", this.hideLoading, this), 
        this.mainScreen.active = true
        this.gameView.active = false
        this.screenName = "main"
    },
    setActive(type){
        var _this = this
        if(type == 1){
            this.mainScreen.active = true
            this.gameView.active = false
            this.screenName = "main"
            this.mainScreen.getComponent("mainScreen").initMainScreen()
        }else{
            this.mainScreen.active = false
            this.gameView.active = true
            this.screenName = "game"      
            setTimeout(() => {
                cc.director.dialogScript.preloadPrefab()
            }, 1000);
        }
        
    },
 
    showLoading: function() {
        this.loading.active = true
    },
    hideLoading: function() {
        this.loading.active = false
    },

    checkTimeCount: function() {
       
    },
    timeCount: function() {
        cc.log("turn off")
      
    },
  
    
});
