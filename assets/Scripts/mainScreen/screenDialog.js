import utils  from "../utils"
import gameData from "../gameData"
cc.Class({
    extends: cc.Component,

    properties: {
        mask: cc.Node,
        // startPromptPrefab: cc.Prefab,
        // boxPanelPrefab: cc.Prefab,
        // settingPrefab: cc.Prefab,
        // gameToolShopPrefab: cc.Prefab,
        // freeCoinsPanelPrefab: cc.Prefab,
       // dailyBounsPrefab: cc.Prefab,
       // reviewUs: require("./reviewUs"),
       // lotteryPrefab: cc.Prefab,
        //hinderPreview: require("./hinderPreview"),
       // rank: require("./rank"),
        //tipsPrefab: cc.Prefab,
        tipsViewList: [cc.SpriteFrame]
    },
    onLoad: function() {
        var _this = this
        cc.systemEvent.on("TIPS_SUCCESS", this.showTips, this),
        cc.director.screenDialog = this
        this.loadindex = 0
        this.startPrompt = null
        this.boxPanel = null
        this.setting = null
        this.gameToolShop = null
        this.freeCoinsPanel = null
        this.dailyBouns = null
        this.lottery = null
        this.tipsScreen = null
        this.rank = null
        this.objListPath = {
            startPrompt: "Prefabs/Dialogs/MainScreen/startPrompt",
            dailyBouns:"Prefabs/Dialogs/MainScreen/dailyBouns",
            lottery:"Prefabs/Dialogs/MainScreen/lotteryDraw",
            boxPanel: "Prefabs/Dialogs/MainScreen/boxPanel",
            setting: "Prefabs/Dialogs/setting",
            tipsScreen:"Prefabs/Dialogs/MainScreen/tips",    
            gameToolShop:"Prefabs/Dialogs/gameToolShop",
            freeCoinsPanel:"Prefabs/Dialogs/freeCoinsPanel",
            rank:"Prefabs/Dialogs/MainScreen/rank",
        }
        this.arrPath = Object.values(this.objListPath)
        
        
    },
    start: function() {
    },
    preloadPrefab(){
        
        var _this = this   
        if(this.loadindex < this.arrPath.length && !gameData.loadedDialogMain){
            this.loadPrefab(this.arrPath[this.loadindex], true).then(function(res) {
                if(res){
                    if(_this.loadindex == _this.arrPath.length - 1){
                        gameData.loadedDialogMain = true
                        cc.log("====loadedDialogMain====")
                        //cc.director.gameManager.mainScreen.getComponent("mainScreen").btn_farmEnter.active = true
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
                    var child = cc.instantiate(o)//isValid
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
    
    hideAllChild: function() {
        for (var e = this.node.children, t = 0; t < e.length; t++)
            e[t].active = !1
    },
    showStartPrompt: function() {
        this.hideAllChild(),
        this.mask.active = !0,
        cc.director.SoundManager.playSound("btnEffect") 
        if(this.startPrompt){
            this.startPrompt.setSiblingIndex(-1)
            this.startPrompt.getComponent('startPrompt').showView()
        }else{
            this.loadPrefab(this.objListPath.startPrompt).then(function(res) {
                this.startPrompt = res
                this.startPrompt.getComponent('startPrompt').showView()
            }.bind(this))
        }   
    },
    showRank(){
        this.hideAllChild(),
        this.mask.active = !0,
        cc.director.SoundManager.playSound("btnEffect") 
        if(this.rank){
            this.rank.setSiblingIndex(-1)
            this.rank.getComponent('rank').showView()
        }else{
            this.loadPrefab(this.objListPath.rank).then(function(res) {
                this.rank = res
                this.rank.getComponent('rank').showView()
            }.bind(this))
        }   
    },
    hideStartPrompt: function() {
        this.hideAllChild()
        this.startPrompt.getComponent('startPrompt').hideView()
        cc.director.SoundManager.playSound("btnEffect")
    },
    showBoxPanel: function(e) {
        var t;
        t = "pinkBox" == e.target.name ? 2 : 1,
        this.hideAllChild(),
        this.mask.active = true
     
        if(this.boxPanel){
            this.boxPanel.setSiblingIndex(-1)
            this.boxPanel.getComponent('boxPanel').showView(t)
        }else{
            this.loadPrefab(this.objListPath.boxPanel).then(function(res) {
                this.boxPanel = res
                this.boxPanel.getComponent('boxPanel').showView(t)
            }.bind(this))
        }  
        cc.director.SoundManager.playSound("btnEffect")
    },
    hideBoxPanel: function() {
        this.hideAllChild(),
        this.boxPanel.getComponent('boxPanel').hideView()
        cc.director.SoundManager.playSound("btnEffect")
    },
    showSettingPanel: function() {
        cc.director.SoundManager.playSound("btnEffect"),
        this.hideAllChild(),
        this.mask.active = !0
        if(this.setting){
            this.setting.setSiblingIndex(-1)
            this.setting.getComponent('setting').showView()
        }else{
            this.loadPrefab(this.objListPath.setting).then(function(res) {
                this.setting = res
                this.setting.getComponent('setting').showView()
            }.bind(this))
        }  
    },
    hideSettingPanel: function() {
        cc.director.SoundManager.playSound("btnEffect"),
        this.hideAllChild(),
        this.setting.getComponent('setting').hideView()
    },
    showTips: function(e) {
    
        if(this.tipsScreen){
            this.tipsScreen.setSiblingIndex(-1)
            this.tipsScreen.stopAllActions(),
            this.tipsScreen.scale = .1,
            this.tipsScreen.active = !0,
            this.tipsScreen.getChildByName("wordSprite").getComponent(cc.Sprite).spriteFrame = this.tipsViewList[e.wordIndex];
            var t = cc.sequence(cc.spawn(cc.scaleTo(.5, 1), cc.fadeIn(.5)), cc.delayTime(1), cc.fadeOut(.5));
            t.tag = 1,
            this.tipsScreen.runAction(t)
        }else{
            this.loadPrefab(this.objListPath.tipsScreen).then(function(res) {
                this.tipsScreen = res
                this.tipsScreen.setSiblingIndex(-1)
                this.tipsScreen.stopAllActions()
                this.tipsScreen.scale = .1
                this.tipsScreen.active = !0
                this.tipsScreen.getChildByName("wordSprite").active = false
                this.tipsScreen.getChildByName("word").active = false
                if(e.word){
                    this.tipsScreen.getChildByName("word").active = true
                    this.tipsScreen.getChildByName("word").getComponent(cc.Label).string = e.word
                }else{
                    this.tipsScreen.getChildByName("wordSprite").active = true
                    this.tipsScreen.getChildByName("wordSprite").getComponent(cc.Sprite).spriteFrame = this.tipsViewList[e.wordIndex];
                }              
                var t = cc.sequence(cc.spawn(cc.scaleTo(.5, 1), cc.fadeIn(.5)), cc.delayTime(1), cc.fadeOut(.5));
                t.tag = 1,
                this.tipsScreen.runAction(t)
            }.bind(this))
        }        
    },
    showGameToolShop: function(e, t) {
        this.hideAllChild(),
        this.mask.active = !0

        if(this.gameToolShop){
            this.gameToolShop.setSiblingIndex(-1)
            this.gameToolShop.getComponent('gameToolShop').showView(e, t)
        }else{
            this.loadPrefab(this.objListPath.gameToolShop).then(function(res) {
                this.gameToolShop = res
                this.gameToolShop.getComponent('gameToolShop').showView(e, t)
            }.bind(this))
        }  
    },
    hideGameToolShop: function() {
        this.hideAllChild(),
        this.gameToolShop.getComponent('gameToolShop').hideView()
    },
    showCoinsPanel: function() {
        cc.director.SoundManager.playSound("btnEffect"),
        this.hideAllChild(),
        this.mask.active = !0
        if(this.freeCoinsPanel){
            this.freeCoinsPanel.setSiblingIndex(-1)
            this.freeCoinsPanel.getComponent('freeCoinsPanel').showView()
        }else{
            this.loadPrefab(this.objListPath.freeCoinsPanel).then(function(res) {
                this.freeCoinsPanel = res
                this.freeCoinsPanel.getComponent('freeCoinsPanel').showView()
            }.bind(this))
        }
    },
    hideCoinsPanel: function() {
        cc.director.SoundManager.playSound("btnEffect"),
        this.hideAllChild(),
        this.freeCoinsPanel.getComponent('freeCoinsPanel').hideView()
    },
    showDailyBouns: function() {
        //cc.loader.loadRes(this.bgSkinUrl, cc.SpriteFrame, this.onSkinLoaded.bind(this)))

        cc.systemEvent.emit("END_FINGER_GUIDE"),
        cc.director.SoundManager.playSound("btnEffect"),
        this.hideAllChild()
        this.mask.active = true
        if(this.dailyBouns){
            this.dailyBouns.setSiblingIndex(-1)
            this.dailyBouns.getComponent('dailyBouns').showView()
        }else{
            this.loadPrefab(this.objListPath.dailyBouns).then(function(res) {
                this.dailyBouns = res
                this.dailyBouns.getComponent('dailyBouns').showView()
            }.bind(this))
        }     
    },
    hideDailyBouns: function() {
        cc.director.SoundManager.playSound("btnEffect"),
        this.hideAllChild(),
        this.dailyBouns.getComponent('dailyBouns').hideView()
    },
    
    showLotteryView: function() {
        cc.systemEvent.emit("END_FINGER_GUIDE"),
        cc.director.SoundManager.playSound("btnEffect"),
        this.hideAllChild(),
        this.mask.active = !0
    
        if(this.lottery){
            this.lottery.setSiblingIndex(-1)
            this.lottery.getComponent('lottery').showView()
        }else{
            this.loadPrefab(this.objListPath.lottery).then(function(res) {
                this.lottery = res
                this.lottery.getComponent('lottery').showView()
            }.bind(this))
        }     
    },
    hideLotteryView: function() {
        cc.director.SoundManager.playSound("btnEffect"),
       this.lottery.getComponent('lottery').hideView()
    },
    showHinderPreview: function() {
        cc.director.SoundManager.playSound("btnEffect"),
        this.hideAllChild(),
        this.hinderPreview.showView()
    },
    hideHinderPreview: function() {
        cc.director.SoundManager.playSound("btnEffect"),
        this.hideAllChild(),
        this.hinderPreview.hideView()
    },
    shareGame: function() {
        window.NativeManager.goShare()
    },
    showChangeNamePrompt: function() {
        cc.director.SoundManager.playSound("btnEffect"),
        this.hideAllChild(),
        this.mask.active = !0,
        cc.systemEvent.emit("CHANGE_NAME_SHOW")
    },
    hideChangeNamePrompt: function() {
        cc.director.SoundManager.playSound("btnEffect"),
        this.showSettingPanel(),
        cc.systemEvent.emit("CHANGE_NAME_HIDE")
    },
    showTipsPromptView: function() {},
    hideTipsPromptView: function() {},
    

});
