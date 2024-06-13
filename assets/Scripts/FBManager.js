import gameData from "./gameData"
import utils from "./utils"
cc.Class({
    extends: cc.Component,
    properties: {
    },
    onLoad () {
        cc.log("onLoad ui: fbManager")
        try {  
            var _this = this;
            cc.director.FbManager = this
            this.IS_FB_INSTANT = typeof FBInstant != "undefined" ? true : false,
            this.entryPointData = null
            this.contextID = "233846722158979"
            this.sub = false
            this.FBmyInterstitials = ["949903759984603_975400874101558"]
            this.FBVideoReward = ["949903759984603_968971044744541"]     
            this.FBBanner = ["949903759984603_968970871411225"]   
            this.FBwaitTillShow = 0
            this.FBinterval = 40000
            this.interval = 2
            this.FBintervalStep = 10000
            this.adsTimeout = true
            this.stag = 'await' 
            this.pageview = 0
            this.countError = 1
            this.played = 0
            this.FBpreloadedInterstitial = null
            this.preloadedRewardedVideo = null
            this.showAds = false
            this.canShowVideo = false
            this.isShowBanner = false
            this.currentContextType = null
            //banner
            
            this.timeBanner = 0
            //end banner
            this.FT = null
            this._revive_times = 0;
            if (!this.IS_FB_INSTANT) return;
            var playerID = FBInstant.player.getID();
           
            gameData.idUser = playerID;
            gameData.avatar = FBInstant.player.getPhoto();
            gameData.name = FBInstant.player.getName();
     
            if (gameData.avatar == null) {
                gameData.avatar = "https://i.imgur.com/T6XLZ7C.jpg"
            }      
            //this.paymentOnReady();
                   
            //this.preLoadAds(1);          
            //this.loadVideoReward();         
                /* this.loadBannerAds();
                 this.schedule(function() {
                    !0 === _this.isShowBanner && _this.loadBannerAds()
                }, 45) */ 
            
            this.getDataAsync()
            this.sessionAsync();        
            this.entryPointData = FBInstant.getEntryPointData();
            cc.log("entryPointData",this.entryPointData)
            FBInstant.onPause(function() {
                _this.onPause()
            })
        } catch (error) {
            cc.log(error)
            //utils.analytic("onLoad fb", "onLoad fb", JSON.stringify(error))
        }
    },
    getContextType() {
        return FBInstant.context ? FBInstant.context.getType() : ""
    },
    switchToContextSolo(){
        var contextType = this.getContextType()
        cc.log(contextType, contextType)
        FBInstant.context
        .switchAsync('SOLO', !0)
        .then(function(e) {
            console.log("Fbi >> siwtchToSolo : ", e);
        }); 
    },
    isSizeBetween(e, t) {
        var n = FBInstant.context.isSizeBetween(e, t);
        cc.log("isSizeBetween", n)
        return !!n && n.answer
    },
    getContextSizeType() {
        var e = "SOLO";
        if(this.isSizeBetween(3)){
            e = "GROUP"   
        }else{
            this.isSizeBetween(2, 2) && (e = "PAIR")
        }
        return e
    },
    onPause(){
        cc.log("on fb pause")
    },
    saveAsid(data){
        try{
            let url = "https://bot-dog.ahaquiz.me/notifi"
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if(xhr.status == 200){
                        cc.log("ok")
                    }
                }
            };
            xhr.onerror = function () {
                cc.log("error")
            };
            xhr.open('POST', url);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(data));
        }catch(err){
            cc.log(err)
        }
    },

    setRevive_times(value) {
        cc.log("value",value)
        value = value < 0 ? 0 : value;
        this._revive_times = value;
    },
    updateDataFB(data){
        if(!this.IS_FB_INSTANT) return;
        FBInstant.player
        .setDataAsync(data)
        .then(function() {
            cc.log('data is set',data);
        });
    },
    sessionAsync() {
        try {
            var data = {
                playName: gameData.name,
                locale: FBInstant.getLocale(),
                lang: FBInstant.getLocale().split("_")[0],
                device: FBInstant.getPlatform(),
                photo: gameData.avatar,
                friends: gameData.friendIds
            };
            FBInstant.setSessionData(data);
        } catch (err) {
            cc.log(err)
            //utils.analytic("sessionAsync err", "sessionAsync err", err.message)
        }

    },
    getDataAsync() {
        var _this = this
        if (!this.IS_FB_INSTANT) return;
        FBInstant.player
        .getDataAsync(["isBegin","starGameData", "currentZeroTime","guide_step","boxGuide","bounsList","bounsSub",
        "lotteryGuide01","lotteryEndTime","gameToolGuide","boxPanelData","pinkMarkData","toolList","timeSub"])
        .then(function(data) {
            cc.log("getDataAsync",data)
            if(data.hasOwnProperty('isBegin')){ 
                gameData.isBegin = data.isBegin
            }
            if(data.hasOwnProperty('starGameData')){ 
                gameData.starGameData = data.starGameData
            }
            if(data.hasOwnProperty('currentZeroTime')){ 
                gameData.currentZeroTime = data.currentZeroTime
            }
            if(data.hasOwnProperty('guide_step')){ 
                gameData.guide_step = data.guide_step
            }
            if(data.hasOwnProperty('boxGuide')){ 
                gameData.boxGuide = data.boxGuide
            }
            if(data.hasOwnProperty('bounsList')){ 
                gameData.bounsList = data.bounsList
            }
            if(data.hasOwnProperty('bounsSub')){ 
                gameData.bounsSub = data.bounsSub
            }
            if(data.hasOwnProperty('lotteryGuide01')){ 
                gameData.lotteryGuide01 = data.lotteryGuide01
            }
            if(data.hasOwnProperty('lotteryEndTime')){ 
                gameData.lotteryEndTime = data.lotteryEndTime
            }
            if(data.hasOwnProperty('gameToolGuide')){ 
                gameData.gameToolGuide = data.gameToolGuide
            }
            if(data.hasOwnProperty('boxPanelData')){ 
                gameData.boxPanelData = data.boxPanelData
            }
            if(data.hasOwnProperty('pinkMarkData')){ 
                gameData.pinkMarkData = data.pinkMarkData
            }
            if(data.hasOwnProperty('toolList')){ 
                gameData.toolList = data.toolList
            }
            if(data.hasOwnProperty('timeSub')){ 
                gameData.timeSub = data.timeSub
            }
            cc.systemEvent.emit('LOADED_FB');   
            cc.log("LOADED_FB")      
            _this.renderEnpoint()          
        }).catch(function(error){
            cc.log(error);
            _this.renderEnpoint()
            cc.systemEvent.emit('LOAD_FB_FAIL'); 
            cc.log("dispatchEvent loadedFBFail facebook")
        })       
    },
    renderEnpoint(){
        try{
            var _this = this            
            FBInstant.getEntryPointAsync().then((entry) => {
                if (_this.entryPointData != null) {
                    if (_this.entryPointData.hasOwnProperty("challenge")) {                                                     
                        gameData.isPlayWithFriend = true; 
                        if(_this.entryPointData.challenge.id != gameData.idUser){
                            gameData.challengeFriend = _this.entryPointData.challenge;
                            gameData.isSendSingle = false 
                        }else{
                            gameData.isSendSingle = true
                        }
                                                                                                    
                        //utils.analytic("Game send ref", "Game send ref", "Success")
                    }/* else if (_this.entryPointData.hasOwnProperty("match")) {
                       // utils.analytic("Match game entry", "Match game entry", "Success")
                        gameData.isPlayerMatch = true; 
                        if(_this.entryPointData.match.id != gameData.idUser){
                            gameData.challengeMatch = _this.entryPointData.match;
                            gameData.isSendSingle = false 
                        }else{
                            gameData.isSendSingle = true
                        }                                                       
                        //utils.analytic("Game send ref", "Game send ref", "Success")
                    } */else if (_this.entryPointData.hasOwnProperty("ads")) {
                        cc.log("ads")
                        //utils.analytic("Game ads ref", "Game ads ref", _this.entryPointData.ads.id ? _this.entryPointData.ads.id : "none")
                    }else if (_this.entryPointData.hasOwnProperty("share")) {
                        //utils.analytic("Game share ref", "Game share ref", "Success")
                    }else if (_this.entryPointData.hasOwnProperty("notif")) {
                        if(_this.entryPointData.notif.hasOwnProperty("contextID")){
                            FBInstant.context
                            .switchAsync(_this.entryPointData.notif.contextID)
                            .then(function() {
                                cc.log('Join Tournament')
                                //utils.analytic("Join Tournament", "Join Tournament", "Success")
                            })
                            .catch((error)=>{
                                cc.log(error)
                                //utils.analytic("Join Tournament", "Join Tournament", error.message)
                            })
                        }
                        //utils.analytic("Game notif ref", "Game notif ref", _this.entryPointData.notif ? _this.entryPointData.notif.name : "Success")
                    }else if(_this.entryPointData.hasOwnProperty("referrer")){
                        //utils.analytic("Game referrer ref", "Game referrer ref", _this.entryPointData.referrer)
                    }else if(_this.entryPointData.hasOwnProperty("bot")){
                        //utils.analytic("Game bot ref", "Game bot ref", JSON.stringify(_this.entryPointData.bot))
                        if(_this.entryPointData.isFriend){
                            gameData.isPlayWithFriend = true;
                        }
                    }else if(_this.entryPointData.hasOwnProperty("invite")){
                        //utils.analytic("Game invite ref", "Game invite ref", "ok")
                    }
                    else{
                        //utils.analytic("Game Other ref", "Game Other ref", entry)
                    }
                }else{
                    if(gameData.contextType == "THREAD"){
                        gameData.isPlayWithFriend = true;
                        //utils.analytic("Game invite ref", "Game invite ref", entry)
                    }else{
                        //utils.analytic("Game Other ref", "Game Other ref", entry)
                    }
                }
            });         

        }catch(error){
            cc.log("renderEnpoint",error.message)
            //utils.analytic("renderEnpoint error", "renderEnpoint error", error)
        }
    },
    canShowBanner(){
        var now = (new Date()).getTime()
        return (FBInstant.getSupportedAPIs().includes("loadBannerAdAsync") && (now - this.timeBanner) > 45000)
    },
    loadBannerAds(){
        var _this = this
        if(this.IS_FB_INSTANT && this.canShowBanner()){
            FBInstant.loadBannerAdAsync(this.FBBanner[0])
            .then(function () {
                cc.log('loadBannerAdAsync resolved.');
                _this.timeBanner = (new Date()).getTime()
                _this.isShowBanner = true
                utils.analytic("loadBannerAds", "loadBannerAds", "ok");
            }).catch(function(err) {
                cc.error('Banner failed to load: ' + err.message);
                _this.timeBanner = (new Date()).getTime()
                _this.isShowBanner = false
                _this.hideBannerAds()
                utils.analytic("loadBannerAds", "loadBannerAds", err.message);
            });
        }
        
    },
    hideBannerAds(){
        if(!this.IS_FB_INSTANT) return;
        FBInstant.hideBannerAdAsync().then(function () {
            cc.log('hideBannerAdAsync resolved.');
          }).catch(function (err) {
            cc.error('hideBannerAdAsync rejected: ' + err.message);
          }
        );
    },
    loadVideoReward() {
        if (this.FBsupportsVideoReward()) {
            var _this = this
            FBInstant.getRewardedVideoAsync(this.FBVideoReward[0])
                .then(function(rewarded) {
                    _this.preloadedRewardedVideo = rewarded;
                    return _this.preloadedRewardedVideo.loadAsync();
                }).then(function() {
                    _this.canShowVideo = true
                    cc.log(_this.preloadedRewardedVideo)
                    cc.log('Rewarded video preloaded')    
                }).catch(function(error) {
                    _this.canShowVideo = false
                    cc.log('Rewarded failed video preloaded: ', error)
                })
        } else {
            cc.log("not support getRewardedVideoAsync")
        }
    },
    resetReward() {
        this.preloadedRewardedVideo = null
        this.canShowVideo = false
        this.loadVideoReward()
    },
    showVideoReward() {
        var _this = this
        this.preloadedRewardedVideo.showAsync()
            .then(function() {
                console.log('Rewarded video watched successfully');
            })
            .catch(function(error) {
                cc.log("showVideoReward catch: ", error)
            })
            .finally(function() {
                cc.log("showVideoReward finally")
                _this.resetReward()
            })
    },
    FBcanLoadAd() {
        return this.FBsupportsInterstitialAds() && this.stag == "await"
    },

    FBcanShow() {
        //  cc.log("played: "+this.played," - pageview: "+ this.pageview, " - interval: "+ this.interval," - adsTimeout: "+ this.adsTimeout, " - stag: "+ this.stag)
        // cc.log("===",this.played, "===", Math.ceil(this.pageview / this.interval))
        // return ((this.played < Math.ceil(this.pageview / this.interval)) && this.adsTimeout && this.stag == "show")
        return (this.adsTimeout && this.stag == "show" && this.IS_FB_INSTANT)
    },

    resetAds() {
        var _this = this
        this.played += 1;
        this.FBpreloadedInterstitial = null
        this.adsTimeout = false;
        clearTimeout(this.FT);
        this.FT = setTimeout(function() {
            _this.adsTimeout = true;
            _this.FBinterval += _this.FBintervalStep
        }, _this.FBinterval)
        setTimeout(function() {
            _this.stag = "await";
            _this.preLoadAds(1)
        }, 1000)
    },
    FbshowAds() {
        var _this = this
        this.FBpreloadedInterstitial.showAsync()
            .then(function() {
                cc.log('Interstitial ad 1 finished successfully');
            })
            .catch(function(error) {
                cc.log(error)
            })
            .finally(function() {
                _this.resetAds()
            })
    },
    preLoadAds(times) {
        try {
            if (this.FBcanLoadAd()) {
                var _this = this
                FBInstant.getInterstitialAdAsync(this.FBmyInterstitials[0])
                    .then(function(interstitial) {
                        _this.stag = "pendding";
                        _this.FBpreloadedInterstitial = interstitial;
                        return _this.FBpreloadedInterstitial.loadAsync();
                    }).then(function() {
                        _this.stag = "show";
                        cc.log('Interstitial 1 preloaded')
                    }).catch(function(err) {
                        _this.stag = "pendding"
                        cc.log('Interstitial 1 failed to preload: ' + err.message);
                        setTimeout(function() { _this.handleAdsNoFill(_this.FBpreloadedInterstitial, times + 1); }, 30 * 1000);
                    });
            } else {
                cc.log(13)
            }
        } catch (err) {
            cc.log(err)
        }

    },
    handleAdsNoFill(adInstance, attemptNumber) {
        var _this = this
        if (attemptNumber > 3) {
            return;
        } else {
            adInstance.loadAsync().then(function() {
                _this.stag = "show";
                cc.log('Interstitial preloaded')
            }).catch(function(err) {
                _this.stag = "pendding";
                cc.log('Interstitial failed to preload: ' + err.message);
                setTimeout(function() {
                    _this.handleAdsNoFill(adInstance, attemptNumber + 1);
                }, 30 * 1000);
            });
        }
    },
    FBsupportsInterstitialAds() {
        return FBInstant.getSupportedAPIs().includes("getInterstitialAdAsync")
    },

    FBsupportsVideoReward() {
        return FBInstant.getSupportedAPIs().includes("getRewardedVideoAsync")
    },

    
    postScore(score) {
        if (!this.IS_FB_INSTANT) return;
        FBInstant.postSessionScore(score);
        cc.log("sent postSessionScore")
    },

    updateAsync(data, buttonName, img64, type) {
        FBInstant.updateAsync({
                action: 'CUSTOM',
                cta: buttonName,
                image: img64,
                text: {
                    default: 'Can you pass me?'
                },
                template: 'MEOWSTERY MATCH',
                data: data,
                strategy: 'IMMEDIATE',
                notification: 'PUSH',
            }).then(function() {          
                
            }).catch(function(error) {
                cc.log(error)             
            })
    },


    sendChallenge(score, img64) {
        if (!this.IS_FB_INSTANT) return;
        let msg = Global.mess1[Math.floor(Math.random() * Global.mess1.length)]
        let data = {};
        let text = {};
        data.challenge = true;
        data.playername = Global.User.Name;
        data.playerid = Global.User.Id;
        data.score = score;
        data.avatar = Global.User.Avatar;
        // text: {
        //     default: msg,
        //     localizations: {
        //         ar_AR: msg,
        //         en_US: msg,
        //         es_LA: msg,
        //     }
        // },

        text.default = msg.en;
        text.localizations = {
            en_US: msg.en,
            in_ID: msg.in,
            en_IN: msg.in,
            ar_AE: msg.ar,
            ar_AR: msg.ar,
            ar_EG: msg.ar,
            es_ES: msg.es,
            es_US: msg.es,
            es_MX: msg.es,
            es_LA: msg.es
        }
        this.updateAsync(msg, data, text, "CHALLENGE", img64);
    },
  
    shareToFb(img64) {
        if (!this.IS_FB_INSTANT) return;
        FBInstant.shareAsync({
            intent: 'REQUEST',
            image: img64,
            text: 'Play this awsome Game!!',
            data: { share: true },
        }).then(function() {
            utils.analytic("shareToFb", "shareToFb", "Success")
        }).catch(function(error) {
            utils.analytic("shareToFb", "shareToFb", JSON.stringify(error))
        })
    },
});