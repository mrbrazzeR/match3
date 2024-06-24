
import utils  from "../utils"
import gameData from "../gameData"
import soundManager from "../SoundManager"

cc.Class({
    extends: cc.Component,

    properties: {
        headers: require("./header"),
        hitFlower: cc.Prefab,
        coinNumber: cc.Label,
        pinkLevel: cc.Label,
        blueStarNum: cc.Label,
        starProgressBar: cc.ProgressBar,
        nextStage: cc.Label,
        levelNode: cc.Node,
        pinkNode: cc.Node,
        pink_open: cc.Node,
        starBar: cc.Node,
        blueNode: cc.Node,
        blue_open: cc.Node,
        boxArea: cc.Node,
       // squirrelsList: [cc.Node],
        blueBox: cc.Node,
        pinkBox: cc.Node,
        needMoveArea: cc.Node,
        screenMask: cc.Node,
        btn_lottery: cc.Node,
       // butterFly: cc.Prefab,
        btn_farmEnter: cc.Node,
        list_farmEnter: [cc.SpriteFrame],
        editBox: cc.EditBox,
        testNode: cc.Node
    },
    onLoad: function() {
        ////
        cc.director.SoundManager = soundManager
        window.NativeManager = require("../NativeManager"), 
        cc.director.NativeManager = require("../NativeManager"), 
        window.NativeManager.splashBegin()
        cc.director.ServerManager = require("../ServerManager")
        ////
        this.loadindex = 0
        this.sub = false
        //this.preloadScene()
        this.life = 5
        cc.systemEvent.on("FINISHEDCOLLECT", this.finishedCollectEffect, this)
        cc.systemEvent.on("STOP_TOUCH", this.stopTouchOperate, this)
        ///
        utils.resize()    
        ///
        //gameData.tournamentData = {ref:"User create",time:"2024-06-01T06:44:56.965Z",level:5}
        ///
    },
    start(){ 
        var _this = this;
        cc.systemEvent.on("LOADED_FB", function(event) {
            console.log("LOADED_FB"); 
            _this.loadGameData()  
        });
        this.onLoadBundle()
        if(!cc.director.FbManager.IS_FB_INSTANT){
            this.getDataLocal()
            this.loadGameData()   
            cc.log("!IS_FB_INSTANT")
        }else{
            this.loadFriends();
        }
    },
    loadFriends(){
        try {
            var _this = this
            FBInstant.player.getConnectedPlayersAsync()
            .then(function(players) {
                gameData.friends = players.map((player)=>{
                    return {
                        id: player.getID(),
                        name: player.getName(),
                        photo: player.getPhoto()
                    }
                })
                gameData.friendIds = players.map((player)=>{
                    return player.getID()
                })
                //_this.GetRank()
                //_this.getASIDAsync(gameData.friends)
            })
            .catch(function(error) {
               /*  _this.GetRank()
                _this.getASIDAsync([]) */
            })
        } catch (error) {
            cc.log("loadFriends",error)
        }   
    },
    getRank(){
        /* var _this = this
        Global.getRankGlobal({
            "id": Global.User.id,
            "friends": Global.friendIds,
            "scores": Global.User.highScore
        }).then(function(res){
            let uniqueHighScores = [];
            let uniqueObjects = res.filter((obj) => {
                if (uniqueHighScores.indexOf(obj.highScore) === -1) {
                    uniqueHighScores.push(obj.highScore);
                    return true;
                }
                return false;
            });
            Global.rankingFriends = uniqueObjects.map((e)=>{
                let index = Global.friends.findIndex(a=>a.id === e.idUser)
                if(index !== -1){
                    e.avatar = Global.friends[index].photo
                }
                return e;
            });
            Global.rankingGlobal = Global.rankingFriends

            if (Global.rankingFriends.length) {
                _this.rank.init();
            }

        }).catch(function(err) {
           
        }); */
    },
    subcribeBot() {
        var _this = this;
        var currentTime = new Date().getTime();
        var deltaTime =  currentTime - gameData.timeSub; 
        if (!this.sub &&  deltaTime > 7*24*60*60*1000) {    
            this.sub = true;          
            FBInstant.player.canSubscribeBotAsync()
            .then(function(can_subscribe) {
                if (can_subscribe) {
                    cc.director.FbManager.updateDataFB({timeSub: currentTime}) 
                    FBInstant.player.subscribeBotAsync()
                        .then(function() {
                           
                        }).catch(function(e) {
                            cc.log(e)
                        });
                } else {
                    _this.shortcut()
                }
            })
            .catch(function(error) {
                cc.log(error)
                _this.shortcut()
            })
        } else {
            _this.shortcut()
        }
    },
    shortcut() {
        cc.log("shortcut")
        FBInstant.canCreateShortcutAsync().then(function(canCreateShortcut) {
            cc.log(canCreateShortcut)
            if (canCreateShortcut) {
                FBInstant.createShortcutAsync()
                .then(function() {
                    cc.log("Shortcut created")
                })
                .catch(function() {
                    cc.log("Shortcut not created")
                });
            }
        });
    }, 
    onLoadBundle(){
        try {
            let _this = this;
            let bundleName = "bundle"; 
            let bundle = cc.assetManager.getBundle(bundleName);
            if(bundle){    
                cc.log("loaded bundle")              
                _this.initBundle()           
            }else{
                cc.assetManager.loadBundle(bundleName, (err, bund) => { 
                    cc.log("loading bundle")                  
                    _this.initBundle()                
                }); 
            } 
        } catch (error) {
            cc.log(error)
            utils.analytic("onLoadBundle error", "onLoadBundle error", error.message)
        }              
    },
    initBundle(){
        cc.director.screenDialog.preloadPrefab()
        cc.director.SoundManager.init()  
    },
    getDataLocal(){
        var currentZeroTime = cc.sys.localStorage.getItem("currentZeroTime")
        if(currentZeroTime){
            gameData.currentZeroTime = currentZeroTime
        }  
      
        var guide_step = cc.sys.localStorage.getItem("guide_step")
        if(guide_step){
            gameData.guide_step = JSON.parse(guide_step)
        }

        var boxGuide = cc.sys.localStorage.getItem("boxGuide")
        if(boxGuide){
            gameData.boxGuide = boxGuide
        }

        var bounsList = cc.sys.localStorage.getItem("bounsList")
        if(bounsList){
            gameData.bounsList = JSON.parse(bounsList)
        }

        var bounsSub = cc.sys.localStorage.getItem("bounsSub")
        if(bounsSub){
            gameData.bounsSub = JSON.parse(bounsSub)
        }

        var lotteryGuide01 = cc.sys.localStorage.getItem("lotteryGuide01")
        if(lotteryGuide01){
            gameData.lotteryGuide01 = lotteryGuide01
        }

        var lotteryEndTime = cc.sys.localStorage.getItem("lotteryEndTime")
        if(lotteryEndTime){
            gameData.lotteryEndTime = lotteryEndTime
        }
        var gameToolGuide = cc.sys.localStorage.getItem("gameToolGuide")
        if(gameToolGuide){
            gameData.gameToolGuide = gameToolGuide
        }

        var boxPanelData = cc.sys.localStorage.getItem("boxPanelData")
        if(boxPanelData){
            gameData.boxPanelData = JSON.parse(boxPanelData)
        }

        var pinkMarkData = cc.sys.localStorage.getItem("pinkMarkData")
        if(pinkMarkData){
            gameData.pinkMarkData = JSON.parse(pinkMarkData)
        }

        var toolList = cc.sys.localStorage.getItem("toolList")
        if(toolList){
            gameData.toolList = JSON.parse(toolList)
        }
        var isBegin = cc.sys.localStorage.getItem("isBegin")
        if(isBegin){
            gameData.isBegin = isBegin
        }
    },
    loadGameData: function() {
        try {
            var _this = this
            cc.systemEvent.emit("LOADING_SHOW");
        
            /* cc.director.ServerManager.requestData(
                'getUser',
                'POST',     
                {
                    "idUser": gameData.idUser,
                    "avatar": gameData.avatar,
                    "name": gameData.name,
                }
            ).then(function(res){
                cc.director.gameLoadingSuccess = true
                if(res){             */
                    //cc.log("getUser",res)
                    //gameData.bestLevel = res.bestLevel 
                    if(!cc.director.FbManager.IS_FB_INSTANT){
                        var e = cc.sys.localStorage.getItem("starGameData")
                        if(e){
                            gameData.overlapGameData(JSON.parse(e))  
                            cc.director.gameLoadingSuccess = true
                            _this.initMainScreen()
                        }else{
                            gameData.initAllGameData()
                            cc.director.gameLoadingSuccess = true
                            _this.initMainScreen()
                        }
                    }else{
                        if(gameData.starGameData){
                            gameData.overlapGameData(gameData.starGameData)
                        }else{
                            gameData.initAllGameData()
                        }
                        cc.director.gameLoadingSuccess = true
                        FBInstant.getTournamentAsync().then(function(tournament) {
                            if(tournament != null){
                                if(tournament.getPayload() != null){
                                    var type = cc.director.FbManager.getContextSizeType()
                                    cc.log("===========context Type: ", type)
                                    cc.log("tournament getPayload",tournament.getPayload())               
                                    var payload = JSON.parse(tournament.getPayload())
                                    if(payload == null){                
                                        //{"tournament":{"ref":"User create","time":"2024-06-01T06:44:56.965Z","level":1}}
                                        _this.initMainScreen()
                                        /* var a = i.getEndTime()
                                            , c = Date.now() / 1e3; */
                                    }else{
                                        gameData.tournamentData = payload.tournament
                                        //{"tournament":{"ref":"User create","time":"2024-06-01T06:44:56.965Z","level":1}}
                                        _this.initMainScreen()
                                    }                            
                                }else{
                                    _this.initMainScreen()
                                }                           
                            }else{
                                _this.initMainScreen()
                            }
                            
                        }).catch((err)=>{
                            cc.log(err)
                            _this.initMainScreen()
                        })
                        
                    }   
                    
            /*          }         
            }).catch(function(error){                              
                cc.log("err",error)   
                gameData.initAllGameData()
                cc.director.gameLoadingSuccess = true
                _this.initMainScreen()        
            });   */     
        } catch (error) {
            console.log(error)
        }
        
    },
  
    initMainScreen(){      
        try {
            cc.systemEvent.emit("LOADDING_HIDE");
            this.life = 5
            this.headers.init()
            //this.setFarmEnterBtn()
            this.updateNextOpenLevel()
            this.updateBlueBoxStarNumber()
            this.showBoxArea()
            this.nextStage.string = gameData.bestLevel + 1 + ""
            this.systemLoginTimes()
            this.judgeHasHair()
            this.isShowLotteryBtn()
            this.isShowCloud()
            if(gameData.tournamentData){
                cc.director.gameManager.setActive(2)       
                cc.director.jumpCode = 1
                cc.director.container.startNewGame()
                if (gameData.passRate >= 1) {         
                    gameData.currentStar += gameData.passRate
                    gameData.passRate = -1;
                    gameData.storeGameData();
                    cc.log("=====storeGameData===== passRate currentStar")
                }
            }else{
                if(cc.director.FbManager.IS_FB_INSTANT){
                    this.subcribeBot()
                }        
                if (gameData.passRate >= 1) {         
                    if (gameData.bestLevel >= 1) {
                        //cc.log("==========sadasdasdasd")
                        // Gửi sự kiện dừng chạm và bắt đầu hoạt ảnh ngôi sao
                        cc.systemEvent.emit("STOP_TOUCH", { number: 1 });
                        cc.systemEvent.emit("STARANIMA", { passRate: gameData.passRate });
                    }
                    // Đặt lại tỷ lệ hoàn thành và lưu dữ liệu trò chơi
                    gameData.currentStar += gameData.passRate
                    gameData.passRate = -1;
                    gameData.storeGameData();
                    cc.log("=====storeGameData===== passRate currentStar")
                }
            }
        } catch (error) {
            console.log(error)
        }
        
    },

    preloadScene(){
        window.loadview = this
        var e = ["interface", "gameView", ][this.loadindex];
        window.loadview = this
        cc.director.preloadScene(e, function() {
            cc.log('scene preloaded: '+e);
            if(1 == window.loadview.loadindex){  
               
            }else {
                window.loadview.loadindex++
                window.loadview.preloadScene()
            }
        })
    },
    debugSetLevel(){
        var level = this.editBox.string
        if(level == "" /* || Number(level)>300 */)return
        gameData.bestLevel = Number(level)
        this.nextStage.string = gameData.bestLevel + 1 + ""
        gameData.storeGameData()
        /* cc.director.ServerManager.requestData(
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
                
        });  */
        
    },
    stopTouchOperate: function(e) {
        var t = e.number;
        if (t == 1) {
            this.screenMask.active = true;
        } else if (t == 2) {
            this.screenMask.active = false;
            if (gameData.bestLevel == 4 && !gameData.lotteryGuide01) {
                cc.systemEvent.emit("LOTTERY_GUIDE");
            }
        }
    },
    excuteSquirrelsAnimation: function() {
       // for (var e = 0; e < this.squirrelsList.length; e++) this.squirrelsList[e].getComponent(cc.Animation).play("squirrels" + (e + 1))
    },

    showBoxArea: function() {
       gameData.bestLevel < 1 ? this.boxArea.active = false : this.boxArea.active = true
    },
    initMainScreenData: function(e) {
        this.updateCoinNumber(e.starCount)
    },
 
    updateCoinNumber: function(e) {
        this.coinNumber.string = e + ""
    },
    updateNextOpenLevel: function() {
        // Tính toán level tiếp theo
        var nextOpenLevel = 10 * Math.floor(gameData.bestLevel / 10) + 10;
        this.pinkLevel.string = nextOpenLevel + "";
        // Kiểm tra các điều kiện để thiết lập trạng thái của pinkNode
        if (gameData.bestLevel == 0 || gameData.bestLevel % 10 != 0 || gameData.pinkMarkData.isGet) {
            // Điều kiện không đủ để mở level mới
            this.controlChildNode(this.pinkNode, "levelNode", 1);
            this.controlChildNode(this.pinkNode, "open", 2);
            this.pinkNode.getComponent(cc.Button).interactable = false;
            this.boxResumeOrigin(this.pinkBox);
        } else {
            // Điều kiện đủ để mở level mới
            if(!gameData.pinkMarkData.pinkMark){
                gameData.pinkMarkData.pinkMark = 0
            }
            gameData.pinkMarkData.pinkMark++;

            // Lưu giá trị mới vào localStorage
            gameData.pinkMarkData.isGet = "yes"
        }

        if (gameData.pinkMarkData.pinkMark && gameData.pinkMarkData.pinkMark > 0) {
            // Nếu có giá trị "pinkMark" và lớn hơn 0, hiển thị hiệu ứng mở box
            this.BoxOpenEffect(this.pinkBox);
            this.controlChildNode(this.pinkNode, "levelNode", 2);
            this.controlChildNode(this.pinkNode, "open", 1);
            this.pinkNode.getComponent(cc.Button).interactable = true;
        }
    },
    updateBlueBoxStarNumber: function(starChange) {
        if (starChange) {   
            // Cập nhật hiển thị số sao và thanh tiến trình
            this.blueStarNum.string = Number(this.blueStarNum.string) + Math.abs(starChange) // gameData.currentStar + "";
            this.starProgressBar.progress = Number(this.blueStarNum.string) >= 20 ? 1 : Number(this.blueStarNum.string) / 20;
    
            if (Number(this.blueStarNum.string) >= 20) {
                // Đánh dấu mở khóa blueMark
                gameData.boxPanelData.blueMark = "yes";
                this.blueStarNum.node.parent.active = false;
            } else {
                // Nếu chưa đủ sao để mở khóa
                this.blueStarNum.node.parent.active = true;
                this.controlChildNode(this.blueNode, "starBar", 1);
                this.controlChildNode(this.blueNode, "open", 2);
                this.blueNode.getComponent(cc.Button).interactable = false;
            }
        
        } else {
            // Nếu không có thay đổi về số sao
            this.blueStarNum.node.parent.active = true;
            this.blueStarNum.string = gameData.currentStar + "";
            this.starProgressBar.progress = gameData.currentStar >= 20 ? 1 : gameData.currentStar / 20;
            this.controlChildNode(this.blueNode, "starBar", 1);
            this.controlChildNode(this.blueNode, "open", 2);
            this.blueNode.getComponent(cc.Button).interactable = false;
            this.boxResumeOrigin(this.blueBox);
    
            if (gameData.currentStar >= 20) {            
                gameData.boxPanelData.blueMark = "yes"            
                this.blueStarNum.node.parent.active = false;
            }
        }
    
        // Kiểm tra nếu blueMark đã được mở khóa
        if (gameData.boxPanelData.blueMark && gameData.boxPanelData.blueMark === "yes") {
            this.BoxOpenEffect(this.blueBox);
            this.controlChildNode(this.blueNode, "starBar", 2);
            this.controlChildNode(this.blueNode, "open", 1);
            this.blueNode.getComponent(cc.Button).interactable = true;
        }
    },
    controlChildNode: function(e, t, i) {
        var s = e.getChildByName(t);
        s && (s.active = 1 == i)
    },
    BoxOpenEffect: function(e) {
        const rotateAndJump1 = cc.tween()
        .parallel(
            cc.tween().to(1, { angle: -10 }),
            cc.tween().by(1, { position: cc.v2(0, 0) }, { jumpHeight: 10, jumps: 1 })
        );
        const rotateAndJump2 = cc.tween()
            .parallel(
                cc.tween().to(1, { angle: 10 }),
                cc.tween().by(1, { position: cc.v2(0, 0) }, { jumpHeight: 10, jumps: 1 })
            );
        cc.tween(e)
            .sequence(rotateAndJump1, rotateAndJump2)
            .repeatForever()
            .start();
    },
    boxLightEfect: function(e, t) {
        var boxLight = e.parent.getChildByName("boxLight");
        1 == t && (boxLight.active = true, boxLight.runAction(cc.rotateBy(2, 90).repeatForever())), 2 == t && (boxLight.stopAllActions(), boxLight.active = false)
    },
    boxResumeOrigin: function(e) {
        e.stopAllActions(), e.scale = 1, e.angle = -0
        e.position = cc.v2(0, 0)            
    },
    collectStar: function() {},

    finishedCollectEffect: function() {
        var e = this
        var t = cc.instantiate(this.hitFlower);
        t.parent = this.blueNode
        t.getComponent(cc.ParticleSystem).resetSystem()
        this.blueNode.runAction(
            cc.sequence(cc.scaleTo(.2, 1.05), cc.scaleTo(.2, 1), cc.callFunc(function() {
                e.updateBlueBoxStarNumber(1)
            })
        ))
    },
    
    systemLoginTimes: function() {
        var e = this.needMoveArea.getChildByName("dailyBouns");
        gameData.bestLevel > 1 ? e.active = true : e.active = false
        var isNewDay = utils.isNewDay()
        if (isNewDay[0]) {
            this.isContinueLogin()
            cc.sys.localStorage.removeItem("freeVideoTimes")
            if(gameData.bounsSub.getReward){
                gameData.bounsSub.getReward = null
                if(cc.director.FbManager.IS_FB_INSTANT){
                    var dataFB = {
                        bounsSub: JSON.stringify(gameData.bounsSub)
                    }
                    if(isNewDay[1]){
                        dataFB.currentZeroTime = gameData.currentZeroTime
                    }
                    cc.director.FbManager.updateDataFB(dataFB)
                }else{
                    cc.log("bounsSub getReward null",isNewDay[1] )
                    cc.sys.localStorage.setItem("bounsSub", JSON.stringify(gameData.bounsSub))
                    if(isNewDay[1]){
                        cc.sys.localStorage.setItem("currentZeroTime", gameData.currentZeroTime);
                    }
                }    
            }else{
                if(isNewDay[1]){
                    if(cc.director.FbManager.IS_FB_INSTANT){
                        cc.director.FbManager.updateDataFB({
                            currentZeroTime: gameData.currentZeroTime              
                        }) 
                    }else{
                        cc.log("currentZeroTime")
                        cc.sys.localStorage.setItem("currentZeroTime", gameData.currentZeroTime);
                    }
                }
            }
                 
            /* var t = cc.director.screenDialog.dailyBouns,
                n = t.judgeIsCurrentDay();
            t.updateBouns_coundGet(n) */
            this.playSignAnimation(e)
        } else {
            if (gameData.bounsSub.getReward) {
                return;
            }
            this.playSignAnimation(e)
        }
    },
    playSignAnimation: function(e) {
        e.getComponent(cc.Animation).play("dailyIconAnima")
    },
    isContinueLogin: function() {
        // Lấy thời gian bắt đầu của ngày hiện tại (theo giây)
        //
        var today = new Date();  
        var year = today.getFullYear();
        var month = today.getMonth();
        var day = today.getDate();
        var currentDayStart = new Date(year, month, day, 0, 0, 0, 0);
        var currentDayStartTime = Math.floor(currentDayStart.getTime() / 1000);

        //
        if (gameData.bounsSub.getBounsTime) {
            var continueTimes = gameData.bounsSub.continueTimes
            continueTimes = continueTimes ? continueTimes : 0;
            if (continueTimes >= 7) {
                // Nếu số lần đăng nhập liên tục >= 7, xóa dữ liệu liên quan
                gameData.bounsList = null
                gameData.bounsSub.continueTimes = null            
                gameData.bounsSub.sevenReward = null
                if(cc.director.FbManager.IS_FB_INSTANT){
                    cc.director.FbManager.updateDataFB({
                        bounsList: null,
                        bounsSub: JSON.stringify(gameData.bounsSub)              
                    })
                }else{
                    cc.sys.localStorage.removeItem("bounsList");
                    cc.sys.localStorage.setItem("bounsSub", JSON.stringify(gameData.bounsSub))
                }

            } else {
                // Kiểm tra thời gian nhận thưởng    
                if (gameData.bounsSub.getBounsTime < currentDayStartTime && currentDayStartTime - gameData.bounsSub.getBounsTime != 86400) {
                    // Nếu thời gian nhận thưởng nhỏ hơn thời gian bắt đầu ngày hiện tại
                    // và khoảng cách không phải là 86400 giây (1 ngày)
                    gameData.bounsList = null
                    gameData.bounsSub.continueTimes = null            
                    gameData.bounsSub.sevenReward = null
                    if(cc.director.FbManager.IS_FB_INSTANT){
                        cc.director.FbManager.updateDataFB({
                            bounsList: null,
                            bounsSub: JSON.stringify(gameData.bounsSub)              
                        })
                    }else{
                        cc.log("bounsList bounsSub")
                        cc.sys.localStorage.removeItem("bounsList");
                        cc.sys.localStorage.setItem("bounsSub", JSON.stringify(gameData.bounsSub))
                    }
                }
            }
        }
    },
    judgeHasHair: function() {
        window.NativeManager.hasPhoneHair() && this.moveNeedMoveArea()
    },
    moveNeedMoveArea: function() {
        this.needMoveArea.getComponent(cc.Widget).top = 80
    },
    isShowLotteryBtn: function() {
       gameData.bestLevel > 4 ? (this.btn_lottery.active = true, this.isLotteryEnable()) :gameData.bestLevel < 4 && (this.btn_lottery.active = false)
    },
    isLotteryEnable: function() {
        var endTime
        var lotteryEndTime = gameData.lotteryEndTime;
        if (lotteryEndTime) {
            endTime = parseInt(lotteryEndTime);
            this.endTime = endTime;
            // Kiểm tra nếu thời gian hiện tại lớn hơn hoặc bằng "endTime"
            if (Math.floor((new Date).getTime() / 1000) >= endTime) {
                this.scheduleOnce(function() {
                    this.playLotteryIconAnima(this.btn_lottery);
                }, 2.8);
            }
        } else {
            // Nếu không có giá trị "lotteryEndTime" trong localStorage
            this.scheduleOnce(function() {
                this.playLotteryIconAnima(this.btn_lottery);
            }, 2.8);
        }
    },
    playLotteryIconAnima: function(e) {
        e.getComponent(cc.Animation).play("lotteryIconAnima")
    },
    debugBtn: function() {
         for (var e = 0; e < 4; e++){
            gameData.changeGameTool("playerTool", 10, e, true);
            cc.log("storeGameData changeGameTool")     
        }
        gameData.starCount += 10000
        gameData.storeGameData() 
        cc.systemEvent.emit("UPDATE_COINS")
       
    },
    jumpToFarm: function() {
         cc.director.gameLoadingSuccess ? (
            cc.systemEvent.emit("IN_COULD_ANIMA"),
            this.scheduleOnce(function() {
                cc.director.loadScene("farm")
            }, 0.1)
        ) : console.log("sorry,please later!") 
    },
    isShowCloud: function() {
        cc.director.sceneMsg && "farm" == cc.director.sceneMsg && (cc.systemEvent.emit("OUT_COULD_ANIMA"), cc.director.sceneMsg = "mainScreen")
    },
    /* setFarmEnterBtn: function() {
        this.btn_farmEnter.getComponent(cc.Sprite).spriteFrame = this.list_farmEnter[0]
        this.btn_farmEnter.getComponent(cc.Button).interactable = true
    }, */
    
    
});
