

import utils  from "../utils"
import gameData from "../gameData"
cc.Class({
    extends: cc.Component,

    properties: {
        //rank_farm: require("./rank_farm"),
        //farm_shopPrefab: cc.Prefab,
        //farm_friend: require("./farm_friend"),
        //farm_warehousePrefab: cc.Prefab,
        //farm_plantPrefab: cc.Prefab,
        farm_operate: require("./farm_operateInterface"),
        // farm_propsPrefab: cc.Prefab,
        // farm_levelUpPrefab: cc.Prefab,
        // farm_messagePrefab: cc.Prefab,
        // farmLevel_levelUpPrefab: cc.Prefab,
        // farm_freeCoinsPrefab:cc.Prefab,
        // farm_landUnlockPrefab: cc.Prefab,
        // farm_plantUnlockPrefab: cc.Prefab,
        // farm_exchangePrefab: cc.Prefab,
        // farm_offlineExpPrefab: cc.Prefab,
        mask: cc.Node,
        node_farm_header: cc.Node,
        node_farm_btnArea: cc.Node
    },

    onLoad: function() {
        cc.director.farmDialog = this
        var _this = this
        this.farm_shop = null
        this.farm_plant= null
        this.farm_props= null
        this.farm_levelUp= null
        this.farm_message= null
        this.farmLevel_levelUp= null
        this.farm_freeCoins= null
        this.farm_landUnlock= null
        this.farm_plantUnlock= null
        this.farm_exchange= null
        this.farm_offlineExp = null
        this.farm_warehouse = null
        this.loadindex = 0
        this.objListPath = {
            farm_shop: "Prefabs/Dialogs/Farm/farmShop",
            farm_warehouse: "Prefabs/Dialogs/Farm/warehouse",
            farm_props: "Prefabs/Dialogs/Farm/operate_prop",
            farm_levelUp: "Prefabs/Dialogs/Farm/plant_level",
            farm_message: "Prefabs/Dialogs/Farm/helpMassage",
            farmLevel_levelUp: "Prefabs/Dialogs/Farm/farm_levelUp",
            farm_freeCoins: "Prefabs/Dialogs/freeCoinsPanel",    
            farm_landUnlock: "Prefabs/Dialogs/Farm/landUnlock",
            farm_plantUnlock: "Prefabs/Dialogs/Farm/plantUnlock",
            farm_exchange: "Prefabs/Dialogs/Farm/exchangeNode",
            farm_offlineExp: "Prefabs/Dialogs/Farm/offlineExp"
        }
        this.arrPath = Object.values(this.objListPath)

        setTimeout(() => {
            _this.preloadPrefab()
        }, 1000);
        //this.farm_operate.addOperateListener()
         cc.systemEvent.on("SHOW_LEVELUP", this.showLevelUpPrompt, this)
        cc.systemEvent.on("SHOW_PLANT_UNLOCK", this.showPlantUnlockPrompt, this)
           
    },

    preloadPrefab(){
        var _this = this   
        if(this.loadindex < this.arrPath.length && !gameData.loadedDialogFarm){
            this.loadPrefab(this.arrPath[this.loadindex], true).then(function(res) {
                if(res){
                    if(_this.loadindex == _this.arrPath.length - 1){
                        gameData.loadedDialogFarm = true
                        cc.log("====loadedDialogFarm====")
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

    hideFarmChild: function() {
        for (var e = this.node.children, t = e.length, i = 0; i < t; i++) e[i].active = !1
    },
    showFarmShop: function() {
        this.hideFarmChild(), this.mask.active = !0

        if(this.farm_shop){
            this.farm_shop.setSiblingIndex(-1)
            this.farm_shop.getComponent('farm_shop').showView()
        }else{
            this.loadPrefab("Prefabs/Dialogs/Farm/farmShop").then(function(res) {
                this.farm_shop = res
                this.farm_shop.getComponent('farm_shop').showView()
            }.bind(this))
        }   

    },
    hideFarmShop: function() {
        this.hideFarmChild()
        this.farm_shop.hideView()
         cc.director.SoundManager.playSound("farm_btn")  
      
    },
    showWarehouseView: function() {
        this.hideFarmChild(), this.mask.active = !0

        if(this.farm_warehouse){
            this.farm_warehouse.setSiblingIndex(-1)
            this.farm_warehouse.getComponent('farm_warehouse').showView()
        }else{
            this.loadPrefab("Prefabs/Dialogs/Farm/warehouse").then(function(res) {
                this.farm_warehouse = res
                this.farm_warehouse.getComponent('farm_warehouse').showView()
            }.bind(this))
        }   
        cc.director.SoundManager.playSound("farm_btn")
    },
    hideWarehouseView: function() {
        this.hideFarmChild()
        this.farm_warehouse.hideView()
    },
    showPlantPrompt: function() {
        this.hideFarmChild(), this.mask.active = !0
       
        cc.director.SoundManager.playSound("farm_btn")
        if(this.farm_plant){
            this.farm_plant.setSiblingIndex(-1)
            this.farm_plant.getComponent('farm_plantPrompt').showView()
        }else{
            this.loadPrefab("Prefabs/Dialogs/Farm/operate_plant").then(function(res) {
                this.farm_plant = res
                this.farm_plant.getComponent('farm_plantPrompt').showView()
            }.bind(this))
        }  
    },
    hidePlantPrompt: function() {
        this.mask.active = !1, 
        this.farm_plant.getComponent('farm_plantPrompt').hideView()
        , cc.director.SoundManager.playSound("farm_btn")
    },
    hideFarmAndBtn: function() {
        this.node_farm_header.active = !0, this.node_farm_btnArea.active = !1
    },
    showFarmAndBtn: function() {
        this.hideFarmChild(), this.node_farm_header.active = !0, this.node_farm_btnArea.active = !0
    },
    showOperateView: function() {
        this.hideFarmAndBtn()
        this.farm_operate.showView()
        , cc.director.SoundManager.playSound("farm_btn")
    },
    hideOperateView: function() {
        this.farm_operate.hideView(), this.showFarmAndBtn(), cc.director.SoundManager.playSound("farm_btn")
    },
    showPropsView: function() {
        this.hideFarmChild(), this.mask.active = !0

        cc.director.SoundManager.playSound("farm_btn")
        if(this.farm_props){
            this.farm_props.setSiblingIndex(-1)
            this.farm_props.getComponent('farm_propsPrompt').showView()
        }else{
            this.loadPrefab("Prefabs/Dialogs/Farm/operate_prop").then(function(res) {
                this.farm_props = res
                this.farm_props.getComponent('farm_propsPrompt').showView()
            }.bind(this))
        }  
    },
    hidePropsView: function() {
        this.mask.active = !1, this.farm_props.hideView(), cc.director.SoundManager.playSound("farm_btn")
    },
    hideOperateView1: function() {
        this.farm_operate.hideView(), this.showFarmAndBtn(), this.showPropsView()
    },
    showLevelUpPrompt: function(e) {
        this.hideFarmChild(), this.mask.active = !0

        if(this.farm_levelUp){
            this.farm_levelUp.setSiblingIndex(-1)
            this.farm_levelUp.getComponent('farm_levelUp').showView(e.type)
        }else{
            this.loadPrefab("Prefabs/Dialogs/Farm/plant_level").then(function(res) {
                this.farm_levelUp = res
                this.farm_levelUp.getComponent('farm_levelUp').showView(e.type)
            }.bind(this))
        } 
    },
    hideLevelUpPrompt: function() {
        this.hideFarmChild(), this.farm_levelUp.hideView(), cc.director.SoundManager.playSound("farm_btn")
    },
    showMessagePrompt: function() {
        this.hideFarmChild(), this.mask.active = !0
       
        cc.director.SoundManager.playSound("farm_btn")
        if(this.farm_message){
            this.farm_message.setSiblingIndex(-1)
            this.farm_message.getComponent('farm_message').showView()
        }else{
            this.loadPrefab("Prefabs/Dialogs/Farm/helpMassage").then(function(res) {
                this.farm_message = res
                this.farm_message.getComponent('farm_message').showView()
            }.bind(this))
        } 
    },
    hideMessagePrompt: function() {
        this.farm_message.hideView(), cc.director.SoundManager.playSound("farm_btn")
    },
    showFarmLevelUpPrompt: function() {
        this.hideFarmChild(), this.mask.active = !0

        if(this.farmLevel_levelUp){
            this.farmLevel_levelUp.setSiblingIndex(-1)
            this.farmLevel_levelUp.getComponent('farmLevel_levelUp').showView()
        }else{
            this.loadPrefab("Prefabs/Dialogs/Farm/farm_levelUp").then(function(res) {
                this.farmLevel_levelUp = res
                this.farmLevel_levelUp.getComponent('farmLevel_levelUp').showView()
            }.bind(this))
        } 
    },
    hideFarmLevelUpPrompt: function() {
        this.hideFarmChild(), this.farmLevel_levelUp.hideView(), cc.director.SoundManager.playSound("farm_btn")
    },
    showFreeCoinsByVideo: function() {
        this.hideFarmChild(), this.mask.active = !0

        if(this.farm_freeCoins){
            this.farm_freeCoins.setSiblingIndex(-1)
            this.farm_freeCoins.getComponent('freeCoinsPanel').showView()
        }else{
            this.loadPrefab("Prefabs/Dialogs/freeCoinsPanel").then(function(res) {
                this.farm_freeCoins = res
                this.farm_freeCoins.getComponent('freeCoinsPanel').showView()
            }.bind(this))
        } 
        cc.director.SoundManager.playSound("farm_btn")
    },
    hideFreeCoinsByVideo: function() {
        this.hideFarmChild(), this.farm_freeCoins.hideView(), cc.director.SoundManager.playSound("farm_btn")
    },
    showLandUnlockPormpt: function(e) {
        this.hideFarmChild(), this.mask.active = !0
  
        if(this.farm_landUnlock){
            this.farm_landUnlock.setSiblingIndex(-1)
            this.farm_landUnlock.getComponent('farm_unlockLand').showView(e)
        }else{
            this.loadPrefab("Prefabs/Dialogs/Farm/landUnlock").then(function(res) {
                this.farm_landUnlock = res
                this.farm_landUnlock.getComponent('farm_unlockLand').showView(e)
            }.bind(this))
        } 
    },
    hideLandUnlockPropmt: function() {
        this.hideFarmChild(), this.farm_landUnlock.hideView()
    },
    showPlantUnlockPrompt: function(e) {
        this.hideFarmChild(), this.mask.active = !0
      
        if(this.farm_plantUnlock){
            this.farm_plantUnlock.setSiblingIndex(-1)
            this.farm_plantUnlock.getComponent('farm_plantUnlock').showView(e.type)
        }else{
            this.loadPrefab("Prefabs/Dialogs/Farm/plantUnlock").then(function(res) {
                this.farm_plantUnlock = res
                this.farm_plantUnlock.getComponent('farm_plantUnlock').showView(e.type)
            }.bind(this))
        } 
    },
    hidePlantUnlockPrompt: function() {
        this.hideFarmChild(), this.farm_plantUnlock.hideView()
    },
    showExchangePrompt: function() {
        this.hideFarmChild(), this.mask.active = !0

        if(this.farm_exchange){
            this.farm_exchange.setSiblingIndex(-1)
            this.farm_exchange.getComponent('farm_exchange').showView()
        }else{
            this.loadPrefab("Prefabs/Dialogs/Farm/exchangeNode").then(function(res) {
                this.farm_exchange = res
                this.farm_exchange.getComponent('farm_exchange').showView()
            }.bind(this))
        } 
    },
    hideExchangePrompt: function() {
        this.hideFarmChild(), this.farm_exchange.hideView()
    },
    showOfflineExpPrompt: function() {
        //this.hideFarmChild(), this.mask.active = !0, this.farm_offlineExp.showView()
    },
    hideOfflineExpPrompt: function() {
        this.hideFarmChild()

        if(this.farm_offlineExp){
            this.farm_offlineExp.setSiblingIndex(-1)
            this.farm_offlineExp.getComponent('farm_offlineExp').showView()
        }else{
            this.loadPrefab("Prefabs/Dialogs/Farm/offlineExp").then(function(res) {
                this.farm_offlineExp = res
                this.farm_offlineExp.getComponent('farm_offlineExp').showView()
            }.bind(this))
        } 
    },
    
});
