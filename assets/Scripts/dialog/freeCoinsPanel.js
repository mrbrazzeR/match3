import utils  from "../utils"
import gameData from "../gameData"
import psconfig from "../psconfig"
var REWARD_COINS_NUM = psconfig.REWARD_COINS_NUM
cc.Class({
    extends: cc.Component,

    properties: {
        number: cc.Label,
        videoEnable: cc.Node,
        videoUnable: cc.Node,
        label_timeNumber: cc.Label,
        watchVideoTimes: cc.Sprite,
        numberViewList: [cc.SpriteFrame]
    },

    onLoad: function() {
        this.number.string = "" + REWARD_COINS_NUM
    },
    showView: function(e) {
        this.index = e, this.node.active = !0
        this.showPromptWithScale(this.node)
        // this.getCurrentDayVideoTimes()
    },
    showPromptWithScale: function(e) {
        e.scale = .2, e.runAction(cc.scaleTo(.3, .9).easing(cc.easeBackOut(3)))
    },
    hideView: function() {
        var e = cc.director.gameManager.screenName
        if("game" == e){
            cc.director.dialogScript.hideAllChildrenNode() 
        }else if("main" == e){
            cc.director.screenDialog.hideAllChild()
        }else{
            cc.director.farmDialog.hideFarmChild()
            cc.director.farmDialog.mask.active = false
        }
        this.node.active = !1, this.unschedule(this.countDown)
    },

    videoReward: function() {
        var _this = this    
        if(cc.director.FbManager.canShowVideo){
            cc.systemEvent.emit("LOADING_SHOW")
            cc.audioEngine.pauseAll();
            cc.director.FbManager.preloadedRewardedVideo.showAsync()
            .then(function() {
                cc.systemEvent.emit("LOADDING_HIDE")
                cc.log('Rewarded video watched successfully');
                var i = cc.director.gameManager.screenName;
                if( "main" == i ){
                    cc.director.screenDialog.hideCoinsPanel()
                    cc.systemEvent.emit("TOOLOBTAIN", {
                        type: 0,
                        number: REWARD_COINS_NUM
                    })
                    gameData.starCount += REWARD_COINS_NUM 
                    gameData.storeGameData()
                }else if("game" == i){
                    gameData.starCount += REWARD_COINS_NUM
                    gameData.storeGameData()
                    if(1 == this.index){
                        cc.director.dialogScript.showRetryPrompt()
                        cc.log("showRetryPrompt")   
                        cc.systemEvent.emit("GAMEVIEW_COINS_OBTAIN", REWARD_COINS_NUM)
                    }else{
                        cc.director.dialogScript.hideFreeCoinsPanel()
                        cc.systemEvent.emit("GAMEVIEW_COINS_OBTAIN", REWARD_COINS_NUM)
                    }
                    
                }else if("farm" == i){
                    console.log("farm scene!")
                }
                    
                utils.analytic("Rewarded video", "Rewarded video", "daily challenge success");
            })
            .catch(function(error) {   
                cc.systemEvent.emit("LOADDING_HIDE")   
                cc.log("showVideoReward catch: ", error)
                utils.analytic("Rewarded video", "Rewarded video", "daily challenge cancle");
            })
            .finally(function() {
                cc.systemEvent.emit("LOADDING_HIDE")
                cc.director.FbManager.resetReward()
                cc.log("showVideoReward finally")
                cc.audioEngine.resumeAll();
            });
        }else{
            var e = cc.director.gameManager.screenName;
            "main" == e ? cc.systemEvent.emit("TIPS_SUCCESS", {
                wordIndex: 0
            }) : "game" == e ? cc.systemEvent.emit("GAMEVIEW_TIPS", {
                wordIndex: 0
            }) : "farm" == e && console.log("farm scene11111!")
        }
    },
    getCurrentDayVideoTimes: function() {
        var e = cc.sys.localStorage.getItem("freeVideoTimes");
        if (e)
            if ((e = parseInt(e)) > 0) this.videoEnable.active = !0, this.videoUnable.active = !1, this.watchVideoTimes.spriteFrame = this.numberViewList[e - 1];
            else {
                this.videoEnable.active = !1, this.videoUnable.active = !0;
                var today = new Date();  
                var year = today.getFullYear();
                var month = today.getMonth();
                var day = today.getDate();
                var currentDayStart = new Date(year, month, day, 0, 0, 0, 0);
                var t = Math.floor(currentDayStart.getTime() / 1000);
                this.endTime = t + 86400;
                var s = utils.countDonwTime(this.endTime);
                this.label_timeNumber.string = s, this.schedule(this.countDown, 1)
            }
        else e = 3, cc.sys.localStorage.setItem("freeVideoTimes", 3), this.videoEnable.active = !0, this.videoUnable.active = !1, this.watchVideoTimes.spriteFrame = this.numberViewList[e - 1]
    },
    countDown: function() {
        var e = utils.countDonwTime(this.endTime);
        e ? this.label_timeNumber.string = e : (this.unschedule(this.countDown), this.videoEnable.active = !0, this.videoUnable.active = !1)
    }
});
