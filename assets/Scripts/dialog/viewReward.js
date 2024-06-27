import utils  from "../utils"
import gameData from "../gameData"
import psconfig from "../psconfig"
cc.Class({
    extends: cc.Component,

    properties: {
        coinsNumber: cc.Label,
        icon_fiveStep: cc.Node,
        icon_plus: cc.Node,
        icon_rocket: cc.Node,
        icon_bomb: cc.Node,
        icon_disco: cc.Node,
        view_txt_step: cc.Node,
        view_txt_stepAndTool: cc.Node
    },
    hideAllIcon: function() {
        this.icon_fiveStep.active = false, this.icon_plus.active = false, this.icon_rocket.active = false, this.icon_bomb.active = false, this.icon_disco.active = false, this.view_txt_step.active = false, this.view_txt_stepAndTool.active = false
    },
    showView: function() {
        this.node.active = true
        utils.showPromptWithScale(this.node)
        this.hideAllIcon()
        if (gameData.continueTimesViewReward) {
            if (gameData.continueTimesViewReward < psconfig.continueCostList.length - 1) {
                gameData.continueTimesViewReward += 1;
            } else {
                gameData.continueTimesViewReward = psconfig.continueCostList.length - 1;
            }
        } else {
            gameData.continueTimesViewReward = 1;
        }
        this.changeViewByTimes(gameData.continueTimesViewReward);
    },
    hideViewClose(){
        cc.director.dialogScript.hideAllChildrenNode()
        this.hideView(0)
    },
    hideView: function(e) {
        this.node.active = false
        if(!e){   
            this.showTournament()
            cc.log("showRetryPrompt")        
            this.unschedule(this.downTimeCount)
        }
    },
    showTournament() {
        try {        
            var _this = this;
            if (cc.director.FbManager.IS_FB_INSTANT) {     
                cc.systemEvent.emit("LOADING_SHOW")
                if(gameData.tournamentData){
                    FBInstant.getTournamentAsync()
                    .then(function(tournament) {
                        FBInstant.tournament.shareAsync({
                            score: gameData.currScore,
                            data: {
                                tournament: {
                                    ref: "User create",
                                    time: new Date(),
                                    level: cc.director.container.currentLevel
                                }
                            }
                        }).then(function() {          
                            cc.systemEvent.emit("LOADDING_HIDE");
                            _this.checkAndShowAds()
                            cc.director.dialogScript.showRetryPrompt()                                            
                            cc.log("share ok!")
                        }).catch((err) => {
                            cc.systemEvent.emit("LOADDING_HIDE");
                            _this.checkAndShowAds()
                            cc.director.dialogScript.showRetryPrompt()  
                            cc.log(err)
                        })
                    }).catch((err)=>{                  
                        cc.systemEvent.emit("LOADDING_HIDE");
                        _this.checkAndShowAds()
                        cc.director.dialogScript.showRetryPrompt()         
                    })
                }else{
                    FBInstant.tournament.createAsync({
                        initialScore: gameData.currScore,
                        config: {
                            title: "Blast"
                        },
                        data: {
                            tournament: {
                                ref: "User create",
                                time: new Date(),
                                level: cc.director.container.currentLevel
                            }
                        },
                    }).then(function(tournament) {
                        cc.systemEvent.emit("LOADDING_HIDE");
                        _this.checkAndShowAds()
                        cc.director.dialogScript.showRetryPrompt()  
                    }).catch(function(error) {
                        cc.systemEvent.emit("LOADDING_HIDE");
                        _this.checkAndShowAds()
                        cc.director.dialogScript.showRetryPrompt() 
                        cc.log(error)
                    })
                }
            } else {
                cc.director.dialogScript.showRetryPrompt()
            }    
        } catch (error) {
            cc.log(error)
            cc.systemEvent.emit("LOADDING_HIDE");
            cc.director.dialogScript.showRetryPrompt()
        }   
    },
    checkAndShowAds(){  
        if(gameData.isBegin){
            gameData.isBegin = false
            if(cc.director.FbManager.IS_FB_INSTANT){
                cc.director.FbManager.updateDataFB({ isBegin: gameData.isBegin }) 
            }else{
                cc.log("isbegin false")
                cc.sys.localStorage.setItem("isBegin", gameData.isBegin);
            }
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
                    cc.director.FbManager.resetAds()
                })
            }
        }
    },
    buttonControl: function() {
        var e = window.NativeManager.hasRewardVideo();
        this.btn_continue_video.active = !!e, this.btn_continue_coins.active = !this.btn_continue_video.active
    },
    addGameStepByCoins: function() {
        var e, t;
        gameData.continueTimesViewReward ? (
            cc.systemEvent.emit("GAMEMASK_CONTROL", {
                order: 1
            }), 
            e = psconfig.continueCostList[gameData.continueTimesViewReward - 1], 2 == gameData.continueTimesViewReward ? t = [1, 0, 0] : 3 == gameData.continueTimesViewReward ? t = [1, 1, 0] : 4 == gameData.continueTimesViewReward ? t = [1, 1, 1] : 1 == gameData.continueTimesViewReward && (t = [0, 0, 0])
        ) : e = psconfig.continueCostList[0],
        gameData.starCount >= e ? (
                this.unschedule(this.downTimeCount), 
                cc.director.dialogScript.hideAllChildrenNode(), 
                this.hideView(1), this.addMovesEffect(), 
                cc.director.container.addGameToolToContainer(t, true), 
                cc.director.container.target.isGameEnd && (cc.director.container.target.isGameEnd = false), 
                cc.systemEvent.emit("REDUCE_COINS_ANIMATION", {
                cost: e
            })
        ) : cc.systemEvent.emit("GAMEVIEW_TIPS", {
            wordIndex: 2
        })
    },
    addGameStepByVideo: function() {
        var e = this;
        window.NativeManager.hasRewardVideo() ? window.NativeManager.showRewardVideo(function(t) {
            t && (e.unschedule(e.downTimeCount), cc.director.dialogScript.hideAllChildrenNode(), e.hideView(1), e.addMovesEffect(), cc.director.container.target.isGameEnd && (cc.director.container.target.isGameEnd = false))
        }) : cc.systemEvent.emit("GAMEVIEW_TIPS", {
            wordIndex: 0
        })
    },
    downTimeCount: function() {
        this.timeNum > 1 ? (this.timeNum--, this.timeCount.string = this.timeNum + "", cc.director.SoundManager.playSound("timeCount")) : (this.unschedule(this.downTimeCount), cc.director.dialogScript.hideAllChildrenNode(), this.hideView(0))
    },
    addMovesEffect: function() {
        var e = cc.director.container.target.step.node,
            t = e.parent.convertToWorldSpaceAR(e.position);
        cc.systemEvent.emit("MOVE_ADD", {
            pos: t
        })
    },
    changeViewByTimes: function(e) {
        switch (this.coinsNumber.string = psconfig.continueCostList[e - 1] + "", e) {
            case 1:
                this.icon_fiveStep.active = true, this.icon_fiveStep.position = cc.v2(0, 0), this.view_txt_step.active = true;
                break;
            case 2:
                this.icon_fiveStep.active = true, this.icon_fiveStep.position = cc.v2(-150, 0), this.icon_plus.active = true, this.view_txt_stepAndTool.active = true, this.icon_rocket.active = true, this.icon_rocket.scale = 1.5, this.icon_rocket.position = cc.v2(0, 0);
                break;
            case 3:
                this.icon_fiveStep.active = true, this.icon_fiveStep.position = cc.v2(-150, 0), this.icon_plus.active = true, this.view_txt_stepAndTool.active = true, this.icon_rocket.active = true, this.icon_rocket.scale = 1, this.icon_rocket.position = cc.v2(-54.5, -10), this.icon_bomb.active = true, this.icon_bomb.position = cc.v2(54.5, -10);
                break;
            case 4:
                this.icon_fiveStep.active = true, this.icon_plus.active = true, this.icon_fiveStep.position = cc.v2(-150, 0), this.view_txt_stepAndTool.active = true, this.icon_rocket.active = true, this.icon_rocket.scale = 1, this.icon_rocket.position = cc.v2(-54.5, -52.5), this.icon_bomb.active = true, this.icon_bomb.position = cc.v2(54.5, -52.5), this.icon_disco.active = true, this.icon_disco.position = cc.v2(0, 42)
        }
    },
    
});
