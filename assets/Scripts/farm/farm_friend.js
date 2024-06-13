var framUtils = require("./framUtils"),
FarmData = require("./FarmData");
        require("../NativeManager")
cc.Class({
    extends: cc.Component,

    properties: {
        item_friend: cc.Prefab,
        itemContainer: cc.Node,
        label_aciton_number: cc.Label,
        btn_askHelp: cc.Button,
        scrollView: cc.ScrollView,
        mask: cc.Node,
        helpPrompt: cc.Node,
        node_btn_claim: cc.Node,
        node_tips: cc.Node
    },
    onLoad: function() {
        this.node.on("helpFriendWater", this.helpFriendWater, this)
    },
    initFriendContainer: function() {
        var e = this.friendList;
        if (console.log(this.friendList), !e || e.length <= 0) cc.log("no data, please try later!");
        else {
            for (var t = e.length, i = -1, s = 0; s < t; s++) {
                var n = cc.instantiate(this.item_friend);
                n.parent = this.itemContainer, e[s].index = s, 1 == e[s].self ? (n.getComponent("item_friend").initItem_Friend(e[s], !0), i = s) : n.getComponent("item_friend").initItem_Friend(e[s])
            }
            if (i >= 0) {
                var a = e[i];
                this.onList(a)
            } else this.btn_askHelp.node.active = !0, this.btn_askHelp.interactable = !0, this.node_btn_claim.active = !1, this.node_tips.active = !0
        }
    },
    helpFriendWater: function(e) {
        var t = e.detail.index,
            n = e.detail.count,
            a = e.detail.id,
            o = this.getHelpTime();
        if (console.log(n, "54"), o > 0 && n < 5) {
            o--, cc.sys.localStorage.setItem("helpLimited", o), this.itemContainer.children[t].getComponent("item_friend").updateHelpCount(n + 1), this.updateActionMoves(o);
            var c = framUtils.getServerTime();
            cc.sys.localStorage.setItem("actionMovesCostTime", c);
            var r = FarmData.OperationReward[5],
                d = r.exp,
                l = r.coins;
            cc.systemEvent.emit("UPDATE_FARM", {
                exp: d,
                coins: l,
                worldPos: cc.v2(0, 0)
            });
            var h = {};
            h.id = a, h.time = c, console.log(h), this.saveUserOperate(h)
        } else cc.log("error:sorry,you have no action moves or had finished help!")
    },
    getWaterFriendList: function() {
        var e = framUtils.getLocalData("localData");
        e ? "" == e.uid ? window.NativeManager.getUid() : e.uid : window.NativeManager.getUid()
    },
    saveUserOperate: function(e) {
        this.needSubmitData.push(e)
    },
    submitWaterDataToServer: function() {
        this.needSubmitData.length <= 0 || (console.log(JSON.stringify(this.needSubmitData)), framUtils.updateFarmData(2, JSON.stringify(this.needSubmitData), 0), this.needSubmitData = [])
    },
    getHelpTime: function() {
        var e = cc.sys.localStorage.getItem("helpLimited");
        return e ? parseInt(e) >= 0 ? parseInt(e) : 0 : 3
    },
    updateActionMoves: function(e) {
        this.label_aciton_number.string = e ? new String(e) : new String(this.getHelpTime())
    },
    getActionsMovesByVideo: function() {
        var e = this.getVideoWatchTimes();
        if (e > 0) {
            var t = this.getHelpTime();
            (t += 2) >= 5 && (t = 5), this.updateActionMoves(t), cc.sys.localStorage.setItem("helpLimited", t), e--, cc.sys.localStorage.setItem("farmFriendVideWatchTimes", e)
        } else console.log("tips:no enough times")
    },
    askWaterHelp: function() {
        var e = cc.instantiate(this.item_friend),
            t = this.composeMyInfo();
        e.getComponent("item_friend").initItem_Friend(t, !0), e.parent = this.itemContainer, this.scrollView.scrollToBottom(1)
    },
    onList: function(e) {
        e.helpcount > 0 ? (this.btn_askHelp.node.active = !0, this.btn_askHelp.interactable = !1, this.node_btn_claim.active = !1, this.node_tips.active = !0) : (this.node_btn_claim.active = !0, this.btn_askHelp.node.active = !1, this.node_tips.active = !1)
    },
    composeMyInfo: function() {
        var e = cc.game.FarmUtils.getLocalData("localFarmInfo"),
            t = cc.game.FarmUtils.getLocalData("localData"),
            i = {};
        return i.fmlevel = e.level, i.helpCount = 0, i.name = t.name, i.self = 1, i
    },
    judgeIsSameDay: function() {
        var e = cc.sys.localStorage.getItem("ServerTime");
        e = parseInt(e);
        var t, i = cc.sys.localStorage.getItem("actionMovesCostTime");
        if (i ? (i = parseInt(i), t = cc.game.FarmUtils.campareTwoStamp(e, i)) : t = !1, t) console.log("heiheihei");
        else {
            console.log("gee~~~~~~");
            var s = cc.game.FarmUtils.getServerTime();
            cc.sys.localStorage.setItem("actionMovesCostTime", s), cc.sys.localStorage.setItem("farmFriendVideWatchTimes", 1), cc.sys.localStorage.setItem("helpLimited", 3)
        }
    },
    getVideoWatchTimes: function() {
        var e = cc.sys.localStorage.getItem("farmFriendVideWatchTimes");
        return e ? parseInt(e) : 1
    },
    showView: function() {
        this.restartView(), this.judgeIsSameDay(), this.node.active = !0, this.fromTopToCenter(this.node), this.getWaterFriendList(), this.scheduleOnce(function() {
            this.initFriendContainer(), cc.systemEvent.emit("HIDE_CACHE_ANIMA")
        }, 1.5), this.updateActionMoves(), this.needSubmitData = []
    },
    hideView: function() {
        this.fromCenterToTop(this.node), this.submitWaterDataToServer(), cc.systemEvent.emit("HIDE_CACHE_ANIMA")
    },
    showGetHelpRewardPrompt: function() {
        this.mask.active = !0, this.helpPrompt.active = !0
    },
    hideGetHelpRewardPrompt: function() {
        this.mask.active = !1, this.helpPrompt.active = !1
    },
    getDoubleReward: function() {
        this.hideGetHelpRewardPrompt(), cc.director.farmDialog.hideFarmFriend(), cc.systemEvent.emit("WATER_ALLLAND_TIME", {
            number: 10
        })
    },
    getReward: function() {
        this.hideGetHelpRewardPrompt(), cc.director.farmDialog.hideFarmFriend(), cc.systemEvent.emit("WATER_ALLLAND_TIME", {
            number: 5
        })
    },
    restartView: function() {
        this.btn_askHelp.node.active = !1, this.node_btn_claim.active = !1, this.node_tips.active = !1, this.itemContainer.removeAllChildren()
    },
    fromTopToCenter: function(e) {
        var t = cc.view.getDesignResolutionSize();
        e.position = cc.v2(0, (t.height + e.height) / 2);
        var i = cc.sequence(cc.moveTo(.5, cc.v2(0, 0)).easing(cc.easeBackOut(3)), cc.callFunc(function() {
            cc.systemEvent.emit("SHOW_CACHE_ANIMA")
        }));
        e.runAction(i)
    },
    fromCenterToTop: function(e) {
        var t = cc.view.getDesignResolutionSize(),
            i = cc.sequence(cc.moveTo(.5, cc.v2(0, (t.height + e.height) / 2)).easing(cc.easeBackIn(3)), cc.callFunc(function() {
                e.active = !1, cc.director.farmDialog.mask.active = !1
            }));
        e.runAction(i)
    },
    
});
