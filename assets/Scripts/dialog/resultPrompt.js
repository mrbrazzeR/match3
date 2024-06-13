
import utils  from "../utils"
import gameData from "../gameData"
cc.Class({
    extends: cc.Component,

    properties: {
        level: cc.Label,
        score: cc.Label,
        nodeList: [cc.Node],
        targetContainer: cc.Node,
        twinkle: cc.Node,
        targetDisplayList: [cc.Node],
        blockView: [cc.SpriteFrame],
        toolView: [cc.SpriteFrame],
        shadowClip: cc.AnimationClip,
        titleWin: cc.Node
    },
    showView: function(e) {
        this.node.active = !0     
        this.nodeList.forEach(e => {
            e.getChildByName("star_inner").active = false
        });
        this.hideToolTargetList()
        this.lightRotation(this.twinkle)
        
        if(gameData.tournamentData){
            this.excuteStarLevelAnimation(cc.director.dialogScript.progressBar.passRate)
        }else{
            gameData.passRate = cc.director.dialogScript.progressBar.passRate
            this.excuteStarLevelAnimation(gameData.passRate)
        }
        
        this.updateLevelScore()
        this.toolTargetDisPlay(e)
        this.updatePlayerSuccessLevel()
        this.updateLevelNumber()
    },
    hideView: function() {
        this.hideToolTargetList(), this.node.active = !1
    },
    excuteStarLevelAnimation: function(e) {
        for (var t = this, i = function(i) {
                t.scheduleOnce(function() {
                    var t = this.nodeList[i].getChildByName("star_inner");
                    this.starAnimation(t), i == e - 1 && cc.director.SoundManager.playSound("victory")
                }, .3 * i)
            }, s = 0; s < e; s++) i(s);
        this.scheduleOnce(function() {
            for (var t = this, i = function(e) {
                    t.scheduleOnce(function() {
                        var t = this.nodeList[e].getChildByName("star_inner");
                        this.addStarShadowAnima(t)
                    }, .3 * e)
                }, s = 0; s < e; s++) i(s)
        }, 1.2)
    },
    starAnimation: function(e) {
        var t = e.getActionByTag(1);
        if (!t || t.isDone()) {
            e.active = !0, e.position = cc.v2(0, 200), e.scale = .01;
            var i = cc.spawn(cc.scaleTo(.3, 1), cc.moveTo(.3, cc.v2(0, 0)), cc.callFunc(function() {
                cc.director.SoundManager.playSound("starEffect")
            }));
            i.tag = 1, e.runAction(i)
        }
    },
    addStarShadowAnima: function(e) {
        e.addComponent(cc.Animation);
        var t = e.getComponent(cc.Animation);
        t.addClip(this.shadowClip), t.play("starShadowAnima")
    },
    updateLevelScore: function() {
        this.score.string = gameData.currScore + ""
    },
    toolTargetDisPlay: function(e) {
        for (var t = utils.computedNodeGap(e.length, this.targetContainer, this.targetDisplayList[0]), s = 0; s < e.length; s++) {
            var n = this.targetDisplayList[s];
            n.active = !0;
            var a = n.getChildByName("icon");
            n.position = cc.v2(t * (s + 1) + n.width * s + n.width / 2, 0);
            var o = e[s][0];
            o >= 20 ? 38 == o ? a.getComponent(cc.Sprite).spriteFrame = this.toolView[10] : 39 == o ? a.getComponent(cc.Sprite).spriteFrame = this.toolView[11] : 37 == o ? a.getComponent(cc.Sprite).spriteFrame = this.toolView[12] : (o -= 20, a.getComponent(cc.Sprite).spriteFrame = this.toolView[o]) : a.getComponent(cc.Sprite).spriteFrame = this.blockView[o]
        }
    },
    hideToolTargetList: function() {
        for (var e = 0; e < this.targetDisplayList.length; e++) this.targetDisplayList[e].active = !1
    },
    lightRotation: function(e) {
        var t = cc.rotateBy(2, 180).repeatForever();
        t.tag = 1, e.runAction(t)
    },
   
    updateLevelNumber: function() {
        if(gameData.tournamentData){
            this.level.node.active = false
            this.titleWin.active = true
        }else{
            this.level.node.active = true
            this.titleWin.active = false
            this.level.string = gameData.bestLevel + ""
        }
        
    },
    updatePlayerSuccessLevel: function() {   
        if(!gameData.tournamentData){
            gameData.totalStar += gameData.passRate
            gameData.bestLevel += 1
            //this.saveDataToServer()
            gameData.storeGameData();
            cc.log("=====storeGameData====== updatePlayerSuccessLevel")
        }
    },
    saveDataToServer(){
        cc.director.ServerManager.requestData(
            'updateUser',
            'POST',     
            {
                "idUser": gameData.idUser,
                "avatar": gameData.avatar,
                "bestLevel": gameData.bestLevel,
            }
        ).then(function(res){
            if(res){
                cc.log("saveDataToServer", gameData.bestLevel)
            }         
        }).catch(function(error){                              
            cc.log("err saveDataToServer",error)   
               
        }); 
    },
    jumpToMainScreen: function() {
        var _this = this;
        cc.director.SoundManager.playSound("btnEffect")
        window.NativeManager.reportLevelEvent(gameData.bestLevel)
        gameData.tournamentData = null
        var dataSaveFB = {}
        if(gameData.pinkMarkData.isGet){
            gameData.pinkMarkData.isGet = null
            dataSaveFB = {
                pinkMarkData: JSON.stringify(gameData.pinkMarkData)
            }
        }    
        this.checkAndShowAds((callback) => {
            if(callback == "begin"){
                dataSaveFB.isBegin = false
            }
            if(Object.keys(dataSaveFB).length > 0){
                if(cc.director.FbManager.IS_FB_INSTANT){
                    cc.director.FbManager.updateDataFB(dataSaveFB) 
                }else{
                    cc.log("pinkMarkData isGet = null")
                    cc.sys.localStorage.setItem("pinkMarkData", JSON.stringify(gameData.pinkMarkData));
                    cc.sys.localStorage.setItem("isBegin", gameData.isBegin);
                }
            }            
            _this.node.active = !1
            cc.director.gameManager.setActive(1)
            cc.director.jumpCode = 2
            cc.director.dialogScript.hideAllChildrenNode()  
        });              
    },
    checkAndShowAds(callback){  
        if(gameData.isBegin){
            gameData.isBegin = false
            callback("begin")
        }else{
            if(cc.director.FbManager.FBcanShow()){
                cc.audioEngine.pauseAll();
                cc.director.FbManager.FBpreloadedInterstitial.showAsync()
                .then(function() {
                    cc.log('Interstitial ad 1 finished successfully');
                }).catch(function(error) {
                    cc.log(error)
                }).finally(function() {
                    cc.log("finally")
                    cc.audioEngine.resumeAll();
                    callback()
                    cc.director.FbManager.resetAds()
                })
            }else{
                callback()
            }
        }
    },
});
