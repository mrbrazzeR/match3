var arrDataBouns = [{
    status: 3,
    type: 0,
    number: 30,
    index: 0
}, {
    status: 3,
    type: 1,
    number: 1,
    index: 1
}, {
    status: 3,
    type: 0,
    number: 60,
    index: 2
}, {
    status: 3,
    type: 2,
    number: 1,
    index: 3
}, {
    status: 3,
    type: 0,
    number: 90,
    index: 4
}, {
    status: 3,
    type: 3,
    number: 1,
    index: 5
}]
import utils  from "../utils"
import gameData from "../gameData"

cc.Class({
    extends: cc.Component,

    properties: {
        item_daliy: cc.Prefab,
        container: cc.Node,
        seven_Bg: cc.Sprite,
        seven_mark: cc.Node,
        seven_name: cc.Node,
        bgViewList: [cc.SpriteFrame],
        seven_light: cc.Node,
        sevenNode: cc.Node,
        daily_btn: cc.Node
    },

    onLoad: function() {
        this.node.on("get_reward", this.getReward, this)
        this.boolSave
    },
    showView: function() {
        this.node.active = !0
        utils.showPromptWithScale(this.node);
        var bounsList = gameData.bounsList;
        if (bounsList) {
             this.initDailyBouns(bounsList);
        }else {
            var t = this.judgeIsCurrentDay();
            this.updateBouns_coundGet(t);
            this.initDailyBouns(gameData.bounsList)
            gameData.bounsSub.getReward = null
        }
        this.setSevenDaysView()
        if(gameData.bounsSub.getReward)  {
            this.node.getChildByName("claim").getComponent(cc.Button).interactable = !1
        }
    },
    judgeIsCurrentDay: function() {
        if(!gameData.bounsSub.continueTimes){
            gameData.bounsSub.continueTimes = 0
        }
        return gameData.bounsSub.continueTimes
    },
    initDailyBouns: function(bounsList) {
        this.container.removeAllChildren();
        for (var t = 0; t < bounsList.length; t++) {
            var item = cc.instantiate(this.item_daliy);
            item.parent = this.container
            item.getComponent("item_daily").initItem(bounsList[t])
        }
    },
    updateBouns_coundGet: function(isCurrentDay) {
        if (isCurrentDay !== 7) { 
            if (gameData.bounsList) {
                gameData.bounsList[isCurrentDay].status = 2;
            } else {
                var newBounsList = JSON.parse(JSON.stringify(arrDataBouns));
                newBounsList[isCurrentDay].status = 2;
                gameData.bounsList = newBounsList
            }
        }
    },
   
    clickToGetReward: function() {
        cc.director.SoundManager.playSound("daily");
        // Kiểm tra nếu đủ 7 ngày liên tục
        var isSevenDays = this.judgeIsSeven();
        if (isSevenDays) {   
            // Nếu đủ 7 ngày liên tục, kiểm tra xem đã nhận thưởng 7 ngày chưa
            var continueTimes = gameData.bounsSub.continueTimes;
            if (continueTimes === 6 && !gameData.bounsSub.sevenReward) {
                // Nếu đang ở ngày thứ 7 và chưa nhận thưởng 7 ngày, thực hiện hàm nhận thưởng 7 ngày
                this.getSevenDaysReward();
            }
        } else {
            // Nếu không đủ 7 ngày liên tục, kiểm tra xem đã đến ngày hiện tại chưa và nhận thưởng của ngày đó
            var isCurrentDay = this.judgeIsCurrentDay(); 
            if (gameData.bounsList) {
                if (gameData.bounsList[isCurrentDay].status === 2) {      
                    cc.log(gameData.bounsList[isCurrentDay])        
                    this.updateBouns_got(gameData.bounsList[isCurrentDay]);
                    if (gameData.bounsList[isCurrentDay].type === 0) {
                        cc.systemEvent.emit("TOOLOBTAIN", gameData.bounsList[isCurrentDay]);   
                        gameData.starCount += gameData.bounsList[isCurrentDay].number    
                                   
                    } else {
                        cc.systemEvent.emit("DAILY_BOUNS_ANIMA", gameData.bounsList[isCurrentDay]);
                        gameData.changeGameTool("gameTool", gameData.bounsList[isCurrentDay].number, gameData.bounsList[isCurrentDay].type - 1, true);
                    }
                    cc.director.screenDialog.hideDailyBouns();
                    
                    gameData.setStarGameData() 
                    if(cc.director.FbManager.IS_FB_INSTANT){
                        cc.director.FbManager.updateDataFB({
                            bounsSub: JSON.stringify(gameData.bounsSub),
                            bounsList: JSON.stringify(gameData.bounsList),
                            starGameData: JSON.stringify(gameData.starGameData)
                        })
                    }else{
                        cc.log("bounsSub bounsList starGameData")
                        cc.sys.localStorage.setItem("bounsSub", JSON.stringify(gameData.bounsSub))
                        cc.sys.localStorage.setItem("bounsList", JSON.stringify(gameData.bounsList))
                        cc.sys.localStorage.setItem("starGameData", JSON.stringify(gameData.starGameData))
                    }     
                }
            }
        }
    },

    getReward: function(e) {
        var t = e.detail;
        cc.director.SoundManager.playSound("daily")
        0 == t.type ? cc.systemEvent.emit("TOOLOBTAIN", t) : cc.systemEvent.emit("DAILY_BOUNS_ANIMA", t)
        cc.director.screenDialog.hideDailyBouns()
        this.updateBouns_got(t)
    },
    updateBouns_got: function(e) {
        var bounsList = gameData.bounsList;
        var defaultBounsList = JSON.parse(JSON.stringify(arrDataBouns));   
        var bounsData = bounsList ? bounsList : defaultBounsList;
        var index = e.index;
        e.status = 1;
        // Thay thế thông tin thưởng được chọn trong danh sách
        bounsData.splice(index, 1, e);
        gameData.bounsList = bounsData        
        gameData.bounsSub.getReward = "yes"
        this.recordPlayerGetTimes();
        
    },
    recordPlayerGetTimes: function() {
        // Lấy số lần liên tục người chơi nhận thưởng từ localStorage
        if (gameData.bounsSub.continueTimes) {
            // Nếu có số lần liên tục người chơi nhận thưởng, tăng giá trị lên 1
            gameData.bounsSub.continueTimes += 1;
        } else {
            // Nếu không có số lần liên tục người chơi nhận thưởng, đặt giá trị là 1
            gameData.bounsSub.continueTimes = 1
        }      
        // Lấy thời gian bắt đầu của ngày hiện tại (theo giây)
        var today = new Date();  
        var year = today.getFullYear();
        var month = today.getMonth();
        var day = today.getDate();
        var currentDayStart = new Date(year, month, day, 0, 0, 0, 0);
        var currentDayStartTime = Math.floor(currentDayStart.getTime() / 1000);
        gameData.bounsSub.getBounsTime = currentDayStartTime 
    },
    
   
    judgeIsSeven: function() {
        if (gameData.bounsList) {
            var count = 0
            for (var i = 0; i < gameData.bounsList.length; i++){ 
                1 == gameData.bounsList[i].status && count++;
            }
            return 6 == count
        }
        return false
    },
    setSevenDaysView: function() {
        // Kiểm tra nếu đủ 7 ngày liên tục
        if (this.judgeIsSeven()) {
            // Lấy số lần liên tục người chơi nhận thưởng từ localStorage
            var continueTimes = gameData.bounsSub.continueTimes;
    
            // Nếu có số lần liên tục
            if (continueTimes) {  
                // Nếu đã đạt 7 ngày liên tục
                if (continueTimes === 7) {
                    // Nếu đã nhận thưởng 7 ngày
                    if (gameData.bounsSub.sevenReward) {
                        this.seven_Bg.spriteFrame = this.bgViewList[0];
                        this.seven_mark.active = true;
                        this.seven_name.active = true;
                        this.seven_light.active = false;
                        this.sevenNode.getComponent(cc.Button).interactable = false;
                    } else {
                        // Chưa nhận thưởng 7 ngày, hiển thị nút nhận thưởng
                        this.seven_Bg.spriteFrame = this.bgViewList[1];
                        this.seven_mark.active = false;
                        this.seven_light.active = true;
                        this.seven_name.active = false;
                        this.sevenNode.getComponent(cc.Button).interactable = true;
                        this.seven_light.runAction(cc.rotateBy(2, 90).repeatForever());
                    }
                } else if (continueTimes > 7) {
                    // Nếu lớn hơn 7 ngày, chỉ hiển thị thông báo
                    this.seven_Bg.spriteFrame = this.bgViewList[0];
                    this.seven_mark.active = true;
                    this.seven_name.active = true;
                    this.seven_light.active = false;
                    this.sevenNode.getComponent(cc.Button).interactable = false;
                } else {
                    // Nếu chưa đạt 7 ngày, hiển thị ngày tiếp theo
                    this.seven_Bg.spriteFrame = this.bgViewList[2];
                    this.seven_mark.active = false;
                    this.seven_name.active = true;
                }
            }
        } else {
            // Nếu không đủ 7 ngày liên tục, hiển thị ngày tiếp theo
            this.seven_Bg.spriteFrame = this.bgViewList[2];
            this.seven_mark.active = false;
            this.seven_name.active = true;
            this.sevenNode.getComponent(cc.Button).interactable = false;
        }
    },
    getSevenDaysReward: function() {
        // Mảng chứa thông tin về phần thưởng 7 ngày
        var rewards = [{
            type: 0,
            number: 300
        }, {
            type: 1,
            number: 1
        }, {
            type: 2,
            number: 1
        }, {
            type: 3,
            number: 1
        }];
        gameData.bounsSub.sevenReward = "yes"  
        gameData.bounsSub.getReward = "yes"

        this.recordPlayerGetTimes();
        
        var handleReward = function(index) {
            setTimeout(function() {
                if (rewards[index].type === 0) {
                    cc.systemEvent.emit("TOOLOBTAIN", rewards[index], "DAILY_7");   
                    gameData.starCount += rewards[index].number 
                } else { //bi bấm được khi nhận
                    cc.systemEvent.emit("DAILY_BOUNS_ANIMA", rewards[index], "DAILY_7");
                    gameData.changeGameTool("gameTool", rewards[index].number, rewards[index].type - 1, true);
                }
                
                 if(index == rewards.length-1){                             
                    gameData.setStarGameData() 
                    if(cc.director.FbManager.IS_FB_INSTANT){
                        cc.director.FbManager.updateDataFB({
                            bounsSub: JSON.stringify(gameData.bounsSub),
                            bounsList: JSON.stringify(gameData.bounsList),
                            starGameData: JSON.stringify(gameData.starGameData)
                        })
                    }else{
                        cc.log("bounsSub bounsList starGameData")
                        cc.sys.localStorage.setItem("bounsSub", JSON.stringify(gameData.bounsSub))
                        cc.sys.localStorage.setItem("bounsList", JSON.stringify(gameData.bounsList))
                        cc.sys.localStorage.setItem("starGameData", JSON.stringify(gameData.starGameData))
                    }  
                }  
            }, 2000 * index); 
        };
        for (var i = 0; i < rewards.length; i++) {
            handleReward(i);
        }
             
       
        cc.director.screenDialog.hideDailyBouns();
    },
        
    hideView: function() {
        cc.director.screenDialog.hideAllChild()
        this.node.active = false 
        //this.daily_btgameData.scale = 1
        //this.daily_btgameData.getComponent(cc.Animation).stop("dailyIconAnima")
    }
});
