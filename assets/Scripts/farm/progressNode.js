var framUtils = require("./framUtils"),
FarmData = require("./FarmData"),
n = FarmData.costTime.ONE_MIN;
cc.Class({
    extends: cc.Component,

    properties: {
        number: cc.Label,
        unfinishedSpriteList: [cc.SpriteFrame],
        finishedSpriteList: [cc.SpriteFrame],
        speed: 0,
        accumulateExpNumber: 0,
        mask: cc.Node,
        expIcon: cc.Node
    },
    start: function() {
        this.iconWorldPos = this.node.convertToWorldSpaceAR(this.expIcon.position)
    },
    computedSpeedUpTimeExp: function(e, t) {
        var a, o, c = this.getSecondExp();
        if (e) {
            var r = framUtils.getLocalData("accumulateList");
            r && (o = r[this.info.index]);
            var d = FarmData.plantInfo[this.info.type].cycle * n;
            a = -1 != o && o ? Math.floor((this.info.plantTime + d - o) / c) : Math.floor(d / c)
        } else a = Math.floor(t / c);
        return a
    },
    addSpeedUpTimeExpToAccumulateExpNumber: function(e, t) {
        var i = this.computedSpeedUpTimeExp(e, t);
        this.accumulateExpNumber += i, this.changeAccumulateExpNumberDisplay(this.accumulateExpNumber), console.log(i, "\u52a0\u901f\u589e\u52a0\u7684\u7ecf\u9a8c")
    },
    getSecondExp: function() {
        console.log(this.speed, "Tốc độ không được tính?");
        var e = Math.floor(27 / this.speed);
        return console.log("Thời gian cần thiết để có được một chút kinh nghiệm", e), e
    },
    initProgressNode: function(e, t, i) {
        this.info = i, console.log(i, "progressNode ,37"), this.recordPlantStartTime(this.info.index, this.info.plantTime), this.computedProgressMoveSpeed(e), 1 == t ? this.growUpMoveAnimation() : 2 == t && this.finishedMoveAnimation();
        var s = this.computedAccumulateExp();
        s ? (this.accumulateExpNumber = s, this.changeAccumulateExpNumberDisplay(s)) : this.changeAccumulateExpNumberDisplay(0)
    },
    computedProgressMoveSpeed: function(e) {
        this.speed = 50 / e
    },
    recordAccumulateStartTime: function() {
        var e = framUtils.getServerTime(),
            t = framUtils.getLocalData("accumulateList");
        if (t) - 1 == t[this.info.index] && (t[this.info.index] = e);
        else {
            t = [];
            for (var s = 0; s < 9; s++) t.push(-1);
            t[this.info.index] = e
        }
        framUtils.setLocalData(t, "accumulateList")
    },
    resetAccumulateStartTime: function() {
        var e = framUtils.getLocalData("accumulateList");
        e && (e[this.info.index] = -1, this.accumulateExpNumber = 0, framUtils.setLocalData(e, "accumulateList"), this.changeAccumulateExpNumberDisplay(this.accumulateExpNumber))
    },
    computedAccumulateExp: function() {
        var e = framUtils.getLocalData("accumulateList"),
            t = this.getSecondExp();
            cc.log(e)
        if (e) {
            var a, o = e[this.info.index],
                c = framUtils.getServerTime(),
                r = this.getSinglePlantTime(this.info.index),
                d = FarmData.plantInfo[this.info.type].cycle * n;
            if (-1 == o) {
                console.log('Không có thời gian tích lũy cuối cùng')
                return  0
            };
            if (c >= r + d){ 
                a = Math.floor((r + d - o) / t);
            }else if (1 == this.info.healthStatue.reap) {
                a = Math.floor((r + d - o) / t);
            }else {
                var l = r - this.info.plantTime;
                a = Math.floor((c - o + l) / t)
            }
            console.log(r, d, o, a, "Có thời gian tích lũy cuối cùng")
            return a
        }
        return 0
    },
    finishedMoveAnimation: function() {
        this.node.active = !0, this.mask.width = 135, this.unschedule(this.changeMaskWidth), this.progressUnlimitedMove(this.finishedSpriteList)
    },
    growUpMoveAnimation: function() {
        this.node.active = !0, this.progressUnlimitedMove(this.unfinishedSpriteList), this.mask.width = 0, this.schedule(this.changeMaskWidth, .2)
    },
    changeMaskWidth: function() {
        this.mask.width += this.speed, this.mask.width >= 135 && (this.mask.width = 0, this.recordAccumulateStartTime(), this.accumulateExpNumber += 1, this.changeAccumulateExpNumberDisplay(this.accumulateExpNumber))
    },
    changeAccumulateExpNumberDisplay: function(e) {
        this.number.string = new String(e)
    },
    progressUnlimitedMove: function(e) {
        var t = this.mask.getChildByName("progress1"),
            i = this.mask.getChildByName("progress2");
        t.getComponent(cc.Sprite).spriteFrame = e[0], i.getComponent(cc.Sprite).spriteFrame = e[1], this.tempProgress = i, this.schedule(this.unlimitedMove, .2), this.progressCount = 0
    },
    unlimitedMove: function() {
        this.progressCount++, this.tempProgress && (this.progressCount >= 100 && (this.progressCount = 0), this.progressCount % 2 != 0 ? this.tempProgress.active = !1 : this.tempProgress.active = !0)
    },
    hideProgressNode: function() {
        this.unschedule(this.unlimitedMove), this.unschedule(this.changeMaskWidth), this.node.active = !1, this.accumulateExpNumber = 0
    },
    collectExp: function() {
        this.accumulateExpNumber > 0 && (console.log(this.accumulateExpNumber), cc.systemEvent.emit("UPDATE_FARM", {
            exp: this.accumulateExpNumber,
            coins: 0,
            worldPos: this.iconWorldPos
        }), this.resetAccumulateStartTime(), this.changeAccumulateExpNumberDisplay(this.accumulateExpNumber))
    },
    getAccumulateExpNumber: function() {
        return this.accumulateExpNumber
    },
    recordPlantStartTime: function(e, t) {
        var s = framUtils.getLocalData("plantStartTimeList");
        if (s) {
            if (-1 != s[e]) return;
            s[e] = t
        } else {
            s = [];
            for (var n = 0; n < 9; n++) s.push(-1);
            s[e] = t
        }
        framUtils.setLocalData(s, "plantStartTimeList")
    },
    resetPlantStartTime: function(e) {
        var t = framUtils.getLocalData("plantStartTimeList");
        t && (t[e] = -1), framUtils.setLocalData(t, "plantStartTimeList")
    },
    getSinglePlantTime: function(e) {
        var t = framUtils.getLocalData("plantStartTimeList");
        return t ? t[e] : -1
    },
    
});
