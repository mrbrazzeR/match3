
import utils  from "../utils"
import gameData from "../gameData"

cc.Class({
    extends: cc.Component,

    properties: {
        mask: cc.Node,
        //resultPromptPrefab: cc.Prefab,
        //retryPromptPrefab: cc.Prefab,
        container: require("./container"),
        goalDisplay: require("../dialog/goalDisplay"),
        // settingPrefab: cc.Prefab,
        // videoRewardPrefab: cc.Prefab,
        // resultTipsPrefab: cc.Prefab,
        // gameToolShopPrefab: cc.Prefab,
        // freeCoinsPanelPrefab: cc.Prefab,
        //quitTipsPrefab: cc.Prefab,
        progressBar: require("./progressBar"),
        //tipsPrefab: cc.Prefab,
        tipsWordList: [cc.SpriteFrame]
    },

    onLoad: function() {  
        cc.director.dialogScript = this
        cc.systemEvent.on("GAMEVIEW_TIPS", this.showTips, this),
        cc.director.keyCode = -1
        //cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.keyBackDown, this)
        this.resultPrompt = null
        this.retryPrompt = null
        this.setting = null
        this.videoReward = null
        this.resultTips = null
        this.gameToolShop = null
        this.freeCoinsPanel = null
        this.quitTips = null
        this.tipsGame = null
        this.loadindex = 0

        this.objListPath = {
            resultPrompt: "Prefabs/Dialogs/Game/resultPrompt",
            retryPrompt: "Prefabs/Dialogs/Game/tryAgainPrompt",
            setting:"Prefabs/Dialogs/setting",
            videoReward: "Prefabs/Dialogs/Game/viewReward",
            resultTips: "Prefabs/Dialogs/Game/resultTips",
            gameToolShop:"Prefabs/Dialogs/gameToolShop",    
            freeCoinsPanel:"Prefabs/Dialogs/freeCoinsPanel",
            quitTips:"Prefabs/Dialogs/Game/quitTips",
            tipsGame:"Prefabs/Dialogs/Game/tips"
        }
        this.arrPath = Object.values(this.objListPath)
       
    },
    
    preloadPrefab(){
        var _this = this   
        if(this.loadindex < this.arrPath.length && !gameData.loadedDialogGame){
            this.loadPrefab(this.arrPath[this.loadindex], true).then(function(res) {
                if(res){
                    if(_this.loadindex == _this.arrPath.length-1){             
                        gameData.loadedDialogGame = true
                        cc.log("====loadedDialogGame====")
                    }  
                    _this.loadindex += 1
                    _this.preloadPrefab()             
                }
            }.bind(this))
        }
    },
    loadPrefab(url, type) {
        return new Promise((resolve, reject) => { 
            var _this = this;        
            utils.loadBundle( url, cc.Prefab).then(function(o, err){
                if(err){
                    reject(err)
                }else{
                    var child = cc.instantiate(o)
                    if(_this.node && _this.node.isValid){
                        _this.node.addChild(child)       
                        child.setSiblingIndex(-1)                  
                        if(type){  
                            child.destroy()
                        }                                 
                        resolve(child) 
                    }else{
                        reject("err")
                    }
                }                 
            })                      
        }) 
    },
    keyBackDown: function(e) {
        switch (e.keyCode) {
            case cc.macro.KEY.back:
                -1 == cc.director.keyCode ? (cc.director.toolType > 0 && (cc.systemEvent.emit("FUNCTION_EXPLAIN_OFF"), cc.systemEvent.emit("CLEAR_BTN"), cc.director.toolType = -1), this.showQuitView()) : (1 == cc.director.keyCode && this.resultPrompt.jumpToMainScreen(), 2 == cc.director.keyCode && this.retryPrompt.jumpToMainScreen(), 3 == cc.director.keyCode && this.showRetryPrompt(), 4 == cc.director.keyCode && this.hidePlayerShop(), 5 == cc.director.keyCode && this.hideFreeCoinsPanel(), 6 == cc.director.keyCode && this.hideQuitView())
        }
    },
    hideAllChildrenNode: function() {
        cc.director.keyCode = -1;
        for (var e = this.node.children, t = 0; t < e.length; t++) e[t].active = !1
    },
    showResultPromptView: function(e) {
        cc.systemEvent.emit("GAMEMASK_CONTROL", {
            order: 2
        }), this.hideAllChildrenNode(), cc.director.keyCode = 1, this.mask.active = !0

        if(this.resultPrompt){
            this.resultPrompt.setSiblingIndex(-1)
            this.resultPrompt.getComponent('resultPrompt').showView(e)
        }else{
            this.loadPrefab("Prefabs/Dialogs/Game/resultPrompt").then(function(res) {
                this.resultPrompt = res
                this.resultPrompt.getComponent('resultPrompt').showView(e)
            }.bind(this))
        }   

    },
    hideResultPromptView: function() {
        this.hideAllChildrenNode()
        this.resultPrompt.getComponent('resultPrompt').hideView()
    },
    showRetryPrompt: function() {
        this.hideAllChildrenNode(), cc.director.keyCode = 2, this.mask.active = !0

        if(this.retryPrompt){
            this.retryPrompt.setSiblingIndex(-1)
            this.retryPrompt.getComponent('retryPrompt').showView()
        }else{
            this.loadPrefab("Prefabs/Dialogs/Game/tryAgainPrompt").then(function(res) {
                this.retryPrompt = res
                this.retryPrompt.getComponent('retryPrompt').showView()
            }.bind(this))
        }   
         cc.director.SoundManager.playSound("lose") 
    },
    hideRetryPrompt: function() {
        this.hideAllChildrenNode()
        this.retryPrompt.getComponent('retryPrompt').hideView()
    },
    showLevelGoal: function(e) {
        this.goalDisplay.initGoalNumber(e)
    },
    showSettingPanel: function() {
        cc.director.SoundManager.playSound("btnEffect")  
        this.hideAllChildrenNode(), this.mask.active = !0

        if(this.setting){
            this.setting.setSiblingIndex(-1)
            this.setting.getComponent('setting').showView()
        }else{
            this.loadPrefab("Prefabs/Dialogs/setting").then(function(res) {
                this.setting = res
                this.setting.getComponent('setting').showView()
            }.bind(this))
        }
    },
    hideSettingPanel: function() {
        cc.director.SoundManager.playSound("btnEffect"), 
        this.hideAllChildrenNode()
        this.setting.getComponent('setting').hideView()
    },
    showVideoRewardView: function() {
        this.hideAllChildrenNode(), cc.director.keyCode = 3, this.mask.active = !0
      
        if(this.videoReward){
            this.videoReward.setSiblingIndex(-1)
            this.videoReward.getComponent('viewReward').showView()
        }else{
            this.loadPrefab("Prefabs/Dialogs/Game/viewReward").then(function(res) {
                this.videoReward = res
                this.videoReward.getComponent('viewReward').showView()
            }.bind(this))
        }   
    },
    hideVideoRewardView: function(e) {
        var t, i = e.target;
        
        t = i && "close" == i.name ? 0 : 1, this.hideAllChildrenNode()
         this.videoReward.getComponent('viewReward').hideView(t)
    },
    showResultTipsView: function(e) {
        this.hideAllChildrenNode()

        if(this.resultTips){
            this.resultTips.setSiblingIndex(-1)
            this.resultTips.getComponent('resultTips').showView(e)
        }else{
            this.loadPrefab("Prefabs/Dialogs/Game/resultTips").then(function(res) {
                this.resultTips = res
                this.resultTips.getComponent('resultTips').showView(e)
            }.bind(this))
        } 
    },
    hideResultTipsView: function(e) {
        this.hideAllChildrenNode()
         this.resultTips.getComponent('resultTips').hideView(e)
    },
    showPlayerShop: function(e, t) {
        this.hideAllChildrenNode(), cc.director.keyCode = 4, this.mask.active = !0
 
        if(this.gameToolShop){
            this.gameToolShop.setSiblingIndex(-1)
            this.gameToolShop.getComponent('gameToolShop').showView(e, t)
        }else{
            this.loadPrefab("Prefabs/Dialogs/gameToolShop").then(function(res) {
                this.gameToolShop = res
                this.gameToolShop.getComponent('gameToolShop').showView(e, t)
            }.bind(this))
        } 
    },
    hidePlayerShop: function() {
        this.hideAllChildrenNode()
        this.gameToolShop.getComponent('gameToolShop').hideView()
    },
    showFreeCoinsPanel: function(e) {
        this.hideAllChildrenNode(), cc.director.keyCode = 5, this.mask.active = !0

        if(this.freeCoinsPanel){
            this.freeCoinsPanel.setSiblingIndex(-1)
            this.freeCoinsPanel.getComponent('freeCoinsPanel').showView(e)
        }else{
            this.loadPrefab("Prefabs/Dialogs/freeCoinsPanel").then(function(res) {
                this.freeCoinsPanel = res
                this.freeCoinsPanel.getComponent('freeCoinsPanel').showView(e)
            }.bind(this))
        } 
    },
    hideFreeCoinsPanel: function() {
        this.hideAllChildrenNode(), this.freeCoinsPanel.getComponent('freeCoinsPanel').hideView()
    },
    showQuitView: function() {
        this.hideAllChildrenNode(), this.mask.active = !0
   
        if(this.quitTips){
            this.quitTips.setSiblingIndex(-1)
            this.quitTips.getComponent('quitTips').showView()
        }else{
            this.loadPrefab("Prefabs/Dialogs/Game/quitTips").then(function(res) {
                this.quitTips = res
                this.quitTips.getComponent('quitTips').showView()
            }.bind(this))
        } 
        cc.director.keyCode = 6
    },
    hideQuitView: function() {
        this.hideAllChildrenNode(), this.quitTips.getComponent('quitTips').hideView()
    },
    showTips: function(e) {
        if(this.tipsGame){
            this.tipsGame.setSiblingIndex(-1)
            this.tipsGame.stopAllActions()
            this.tipsGame.scale = .1, this.tipsGame.active = !0
            this.tipsGame.getChildByName("adSprite").getComponent(cc.Sprite).spriteFrame = this.tipsWordList[e.wordIndex];
            var t = cc.sequence(cc.spawn(cc.scaleTo(.5, 1), cc.fadeIn(.5)), cc.delayTime(1), cc.fadeOut(.5));
            t.tag = 1, this.tipsGame.runAction(t)
        }else{
            this.loadPrefab("Prefabs/Dialogs/Game/tips").then(function(res) {
                this.tipsGame = res
                this.tipsGame.stopAllActions()
                this.tipsGame.scale = .1, this.tipsGame.active = !0
                this.tipsGame.getChildByName("adSprite").getComponent(cc.Sprite).spriteFrame = this.tipsWordList[e.wordIndex];
                var t = cc.sequence(cc.spawn(cc.scaleTo(.5, 1), cc.fadeIn(.5)), cc.delayTime(1), cc.fadeOut(.5));
                t.tag = 1, this.tipsGame.runAction(t)
            }.bind(this))
        } 
    },
    
});
