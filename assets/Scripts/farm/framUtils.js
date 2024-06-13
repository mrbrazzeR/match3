var FarmData = require("./FarmData"),
ServerManager = require("../ServerManager");

import gameData from "../gameData"
module.exports = {
    resize: function() {
        var e = cc.find("Canvas").getComponent(cc.Canvas);
        this.curDR || (this.curDR = e.designResolution);
        var t = this.curDR,
            i = cc.view.getFrameSize(),
            s = i.width,
            n = i.height,
            a = s,
            o = n;
        s / n > t.width / t.height ? a = (o = t.height) * s / n : o = n / s * (a = t.width), e.designResolution = cc.size(a, o), e.node.width = a, e.node.height = o, e.node.emit("resize")
    },
    getUTCtime: function() {
        var e = new Date,
            t = e.getTimezoneOffset();
        return Math.floor(e.getTime() / 1e3) + 60 * t
    },
    saveServerTime: function(e) {
        cc.sys.localStorage.setItem("ServerTime", e)
    },
    saveSyncServerTime: function() {
        var e = this.getUTCtime();
        cc.sys.localStorage.setItem("SyncTime", e)
    },
    getServerTime: function() {
        var e, t, i = this.getUTCtime();
        return e = cc.sys.localStorage.getItem("SyncTime"), t = cc.sys.localStorage.getItem("ServerTime"), e && t ? i - (e = parseInt(e)) + (t = parseInt(t)) : 0
    },
    checkLocalAndServerTime: function(e) {
        var t, i, s = this.getUTCtime();
        if (t = cc.sys.localStorage.getItem("SyncTime"), i = cc.sys.localStorage.getItem("ServerTime"), t && i) {
            var n = s - (t = parseInt(t)),
                a = e - (i = parseInt(i));
            return !(Math.abs(n - a) >= 10 && (cc.log("error:Time anomaly!!"), 1))
        }
        return cc.log("error: No record time!"), !1
    },
    showPromptWithScale: function(e) {
        e.scale = .2, e.runAction(cc.scaleTo(.3, 1).easing(cc.easeBackOut(3)))
    },
    getLevel: function() {
        var e = gameData.getGameData();
        return e || (gameData.initAllGameData(), gameData.storeGameData(), e = gameData.getGameData()), e.bestLevel + 1
    },
    getCoins: function() {
        var e = gameData.getGameData();
        return e || (gameData.initAllGameData(), gameData.storeGameData(), e = gameData.getGameData()), e.starCount
    },
    saveCoins: function(e) {
        console.log(e, "save coin");
        var t = gameData.getGameData();
        t.starCount = e, gameData.overlapGameData(t)
    },
    getWarehouseData: function(e) {
        var t = cc.sys.localStorage.getItem(e);
        return !!t && JSON.parse(t)
    },
    getObjectProperty: function(e, t) {
        var i = this.getLocalData(e);
        return !!i && i[t]
    },
    saveWarehouseData: function(e, t) {
        e && "object" == typeof e && cc.sys.localStorage.setItem(t, JSON.stringify(e))
    },
    getLocalData: function(e) {
        if (e && "string" == typeof e) {
            var t = cc.sys.localStorage.getItem(e);
            return t ? t = JSON.parse(t) : (cc.log("error:data is not exist!", e), !1)
        }
        return cc.log("error:params error on get", e), !1
    },
    setLocalData: function(e, t) {
        e && "object" == typeof e ? cc.sys.localStorage.setItem(t, JSON.stringify(e)) : cc.log("error:params error on set", t)
    },
    removeLocalData: function(e) {
        e && "string" == typeof e ? cc.sys.localStorage.removeItem(e) : cc.log("error:params error on remove")
    },
    checkLocalData: function(e) {
        return e && "string" == typeof e ? !!cc.sys.localStorage.getItem(e) : (cc.log("error:params error on remove"), !1)
    },
    campareTwoStamp: function(e, t) {
        return console.log(new Date(1e3 * e).toDateString()), console.log(new Date(1e3 * t).toDateString()), new Date(1e3 * e).toDateString() === new Date(1e3 * t).toDateString()
    },
    countdown: function(e, t) {
        var i, s, n, a, o, c, r, d;
        return 1 == t ? i = e - this.getServerTime() : 2 == t ? i = e : (i = 0, cc.log("counttime,type is unexpected")), i >= 0 && (s = Math.floor(i / 60 / 60 / 24), n = Math.floor(i / 60 / 60 % 24), s > 0 && (n += 24 * s), c = n < 10 ? "0" + n : "" + n, r = (a = Math.floor(i / 60 % 60)) < 10 ? "0" + a : "" + a, d = (o = Math.floor(i % 60)) < 10 ? "0" + o : "" + o, n > 0 ? c + ":" + r + ":" + d : r + ":" + d)
    },
    getDataProperty: function(e, t, i) {
        var s = this.getLocalData(t);
        if (s) {
            for (var n = -1, a = 0; a < s.length; a++)
                if (s[a].type === e) {
                    n = a;
                    break
                } return n >= 0 ? s[n][i] : 0
        }
        cc.log(t, "error:Cound not find data with this name!----getDataProperty")
    },
    computedCurrentProduce: function(e, t) {
        return Math.floor(e * Math.pow(1 + FarmData.PRODUCE_RATE, t - 1))
    },
    composeFarmData: function() {
        var e = this.getLocalData("seedData"),
            t = this.getLocalData("landData"),
            i = this.getLocalData("warehouseData"),
            s = this.getLocalData("localFarmInfo"),
            n = this.getLocalData("propsData"),
            a = {},
            o = this.composeList(e, ["type", "number", "level"]);
        a.seedData = o;
        var c = this.composeList(n, ["type", "number"]);
        a.propsData = c, a.warehouseData = i, a.landData = t;
        var r = {};
        return r.fmexp = s.exp, r.fmlevel = s.level, r.coin = this.getCoins(), r.fmlasttime = this.getServerTime(), r.fmdata = JSON.stringify(a), r
    },
    composeList: function(e, t) {
        for (var i = [], s = 0; s < e.length; s++) {
            for (var n = {}, a = 0; a < t.length; a++) n[t[a]] = e[s][t[a]];
            i.push(n)
        }
        return i.length > 0 && i
    },
    updateFarmData: function(e, t, i) {
        var s = cc.sys.localStorage.getItem("localData");
        s ? "" == (s = JSON.parse(s)).uid ? window.NativeManager.getUid() : s.uid : (window.NativeManager.getUid(), console.log("localData is not exist"));
        var n = this.composeFarmData();
        1 == e || 2 == e && (n.help = i, n.helplist = t)
    },
    login: function() {
        var e, t = this,
            i = cc.sys.localStorage.getItem("localData");
        i ? e = "" == (i = JSON.parse(i)).uid ? window.NativeManager.getUid() : i.uid : (e = window.NativeManager.getUid(), console.log("localData is not exist")), ServerManager.login(3, e, "", function(e) {
            t.saveServerTime(e.data.curtime), t.saveSyncServerTime()
        })
    },
    numberRoll: function(e, t, i) {
        var s = this;
        if (0 !== t) {
            var n, a, o = e.getComponent(cc.Label),
                c = parseInt(o.string),
                r = Math.floor(t / 20),
                d = 0,
                l = !1;
            r > 1 ? (a = 20, d = t - 20 * (n = r), l = !0) : (n = 1, a = t);
            for (var h = function(e) {
                   /*  s.scheduleOnce(function() {
                        c += n, e == a - 1 && d > 0 && l && (c += d), o.string = new String(c), e == a - 1 && i && i()
                    }, .05 * e) */

                    setTimeout(function() {
                        c += n, e == a - 1 && d > 0 && l && (c += d), o.string = new String(c), e == a - 1 && i && i()
                    }, .05 * e)
                }, p = 0; p < a; p++) h(p)
        }
    }
}
