var s = require("./LeaderBoardManager.js");

import psconfig from "./psconfig"
module.exports = {
    idUser: "id123",
    name: "Minh",
    avatar: "",
    isBegin: true,
    starCount: 0,
    bestLevel: 0,
    currScore: 0,
    bestScore: 0,
    starMatrix: null,
    starSprite: [],
    game_prop: [{
        type: 0,
        name: "battle",
        number: 1
    }, {
        type: 1,
        name: "fork",
        number: 1
    }, {
        type: 2,
        name: "hammer",
        number: 1
    }, {
        type: 3,
        name: "dice",
        number: 1
    }],
    ///FB
    listRank: null,
    friendIds: [],
    friends: [],
    isTournament: false,
    isPlayWithFriend: false,
    challengeFriend: null,
    isSendSingle: false,
    contextType: null,
    isPlayerMatch: false,
    tournamentData: null,
    timeSub: null,
    ////
    isContinu: 1,
    currentStar: 0,
    choosedList: [],
    passRate: -1,
    gameToolList: [0, 0, 0],
    continueTimesViewReward: null,
    totalStar: 0,
    /////
    loadedDialogMain: false,
    loadedDialogGame: false,
    loadedDialogFarm: false,
    starGameData: null,
    currentZeroTime: null, //isNewDay()
    boxGuide: null,
    ///

    ////Bouns   
    bounsList: null,
    bounsSub: {
        getReward: null, // Đánh dấu rằng người chơi đã nhận thưởng trong ngày
        continueTimes: null, //  số ngày nhận thưởng liên tục
        getBounsTime: null, // thời gian nhận thưởng  
        sevenReward: null, //Đánh dấu rằng người chơi đã nhận thưởng 7 ngày
    },
    ////guide
    guide_step: {
        one_step: null,
        two_step: null,
        three_step: null,
        four_step: null,
        five_step: null,
        six_step: null,
        seven_step: null,
        eight_step: null,
        nine_step: null,
        ten_step: null,
        eleven_step: null,
        twelve_step: null,
        thirteen_step: null,
        fourteen_step: null,
        fifteen_step: null,
        sixteen_step: null,
        seventeen_step: null,
    },
    ///lotery
    lotteryGuide01: null,
    lotteryEndTime: null,
    ///
    gameToolGuide: null,
    ///boxPanel
    boxPanelData: {
        blueMark: "no",
        //isFirstUnlock: null,
        isFirstTime: null
    },
    ///pinkMark
    pinkMarkData: {
        pinkMark: null,
        isGet: null,
    },
    //toolList
    toolList: {
        btn1: null,
        btn2: null,
        btn3: null,
        btn4: null
    },
    changeGameTool: function (name, value, type, boolAdd) {
        if ("gameTool" == name) {
            if (boolAdd) {
                this.gameToolList[type] += value
            } else {
                this.gameToolList[type] -= value
            }

        } else if ("playerTool" == name) {
            if (boolAdd) {
                this.game_prop[type].number += value
            } else {
                this.game_prop[type].number -= value
            }
        }
    },
    cleanStarData: function (e) {
        e.forEach(function (e) {
            this.starMatrix[e.x][e.y] = -1
        }, this)
    },
    tampStarData: function () {
        for (var e = 0; e < psconfig.matrixCol; e++) {
            for (var t = e, s = -1, n = 0; n < psconfig.matrixRow; n++)
                if (-1 == this.starMatrix[n][t]) {
                    s = n;
                    break
                }
            if (s >= 0)
                for (var a = s; a < psconfig.matrixCol; a++)
                    if (-2 != this.starMatrix[a][t]) {
                        for (var o = -1, c = a + 1; c < psconfig.matrixRow; c++)
                            if (this.starMatrix[c][t] >= 0) {
                                o = c;
                                break
                            }
                        if (!(o >= 0))
                            break;
                        this.starMatrix[a][t] = this.starMatrix[o][t],
                            this.starMatrix[o][t] = -1
                    }
        }
    },
    checkEmptyCol: function () {
        for (var e = -1, t = 0; t < psconfig.matrixCol; t++)
            if (this.starMatrix[0][t] < 0) {
                e = t;
                break
            }
        if (e >= 0)
            for (var s = e; s < psconfig.matrixCol - 1; s++) {
                for (var n = -1, a = s + 1; a < psconfig.matrixCol; a++)
                    if (this.starMatrix[0][a] >= 0) {
                        n = a;
                        break
                    }
                if (n >= 0)
                    for (var o = 0; o < psconfig.matrixRow; o++)
                        this.starMatrix[o][s] = this.starMatrix[o][n],
                            this.starMatrix[o][n] = -1
            }
    },
    remainStarData: function () {
        for (var e, t = [], s = 0; s < psconfig.matrixRow; s++)
            for (var n = 0; n < psconfig.matrixCol; n++)
                this.starMatrix[s][n] >= 0 && (e = cc.v2(s, n),
                    t.push(e));
        return t
    },
    initAllGameData: function () {
        var e = {}
        ///
        e.bestLevel = this.bestLevel
        ///
        e.currScore = this.currScore
        e.bestScore = this.bestScore
        e.starCount = this.starCount
        e.game_prop = this.game_prop
        e.bestScore = this.bestScore
        e.gameToolList = this.gameToolList
        e.currentStar = this.currentStar
        e.passRate = this.passRate
        e.totalStar = this.totalStar
        this.starGameData = e
        if (!cc.director.FbManager.IS_FB_INSTANT) {
            cc.sys.localStorage.setItem("starGameData", JSON.stringify(e))
        } else {
            let dataFb = {
                starGameData: JSON.stringify(this.starGameData)
            }
            cc.director.FbManager.updateDataFB(dataFb)
        }
    },
    storeGameData: function () {
        this.setStarGameData()
        if (cc.director.FbManager.IS_FB_INSTANT) {
            let dataFb = {
                starGameData: JSON.stringify(this.starGameData)
            }
            cc.director.FbManager.updateDataFB(dataFb)
        } else {
            cc.sys.localStorage.setItem("starGameData", JSON.stringify(this.starGameData))
        }

    },
    setStarGameData() {
        var e = {}
        //
        e.bestLevel = this.bestLevel
        //
        e.starCount = this.starCount
        e.currScore = this.currScore
        e.bestScore = this.bestScore
        e.game_prop = this.game_prop
        e.gameToolList = this.gameToolList
        e.currentStar = this.currentStar
        e.passRate = this.passRate
        e.totalStar = this.totalStar
        this.starGameData = e
    },
    getGameData: function () {
        /* cc.log("=====getGameData")
        var e = cc.sys.localStorage.getItem("starGameData");
        return !!e && JSON.parse(e) */
        return this.starGameData
    },
    overlapGameData: function (e) {
        if (e) {
            //
            if (e.hasOwnProperty('bestLevel')) {
                this.bestLevel = e.bestLevel
            } else {
                this.bestLevel = 0
            }

            //
            this.starCount = e.starCount
            this.currScore = e.currScore
            this.bestScore = e.bestScore
            this.game_prop = e.game_prop
            this.gameToolList = e.gameToolList
            this.currentStar = e.currentStar
            this.passRate = e.passRate
            this.totalStar = e.totalStar
        }
        //cc.sys.localStorage.setItem("starGameData", JSON.stringify(e))
        this.starGameData = e
        cc.log("=========overlapGameData===========")
    },

    getNativeGameData: function () {
        var e = cc.sys.localStorage.getItem("userNameInfo");
        e && (e = JSON.parse(e),
            s.getListData(e.uid, function (e) {
                cc.director.myGameData = e.mine
            }))
    },
    updateSingleData: function (e, t) {
        // this.starMatrix[e.x][e.y] = this.starMatrix[e.x][e.y] + t >= psconfig.dType ? psconfig.dType : this.starMatrix[e.x][e.y] + t
        this.starMatrix[e.x][e.y] = t;
    },
    getDataBygrid: function (e) {
        return !!e && this.starMatrix[e.x][e.y]
    },

}