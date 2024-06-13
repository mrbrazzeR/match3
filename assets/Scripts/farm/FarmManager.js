var FarmData = require("./FarmData")
, framUtils = require("./framUtils");
cc.Class({
    extends: cc.Component,

    properties: {
        carema: cc.Node,
        landContainer: cc.Node,
        ground: cc.Prefab,
        farm: cc.Node,
        waterFall: cc.Prefab,
        insect: cc.Prefab,
        fingerFire: cc.Prefab
    },

    onLoad: function() {
        this.nodePos = this.carema.getPosition(),
        this.farm.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this),
        this.farm.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this),
        this.farm.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this),
        this.farm.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this),
        cc.systemEvent.on("UPDATE_FARM", this.updateFarmInfo, this),
        cc.systemEvent.on("UPDATE_LAND", this.updateLandData, this),
        cc.systemEvent.on("UPDATE_WAREHOUSE", this.updateWarehouseData, this),
        cc.systemEvent.on("UPDATE_SEED", this.updateSeedData, this),
        cc.systemEvent.on("UPDATE_PROPS", this.updatePropsData, this),
        cc.systemEvent.on("SAVE_LAND_DATA", this.saveLandInfo, this),
        cc.systemEvent.on("ADD_COINS", this.addCoins, this),
        cc.systemEvent.on("HIDE_LAND_STATUE", this.hideAllPlantStatue, this),
        cc.systemEvent.on("SHOW_LAND_STATUE", this.showAllPlantStatue, this),
        cc.systemEvent.on("FERT_ALLLAND_TIME", this.fertAllLandSpeed, this),
        cc.systemEvent.on("WATER_ALLLAND_TIME", this.waterAllLandSpeed, this),
        cc.systemEvent.on("UPDATE_LAND_STATUE", this.checkLandStatue, this),
        this.farm.on("manager_land", this.managerLandStatues, this),
        cc.game.FarmUtils = framUtils,
        cc.game.FarmData = FarmData,
        this.init(),
        this.initNodePool(),
        cc.director.FarmManager = this,
        cc.director.getCollisionManager().enabled = !0
    },
    init: function() {
        cc.director.currentPlantIndex = -1,
        cc.director.currentPropsIndex = -1;
        var t = framUtils.getLocalData("localFarmInfo");
        t || (t = {
            level: 1,
            exp: 0,
            coin: 0
        },
        framUtils.setLocalData(t, "localFarmInfo")),
        cc.director.ServerManager || (cc.director.ServerManager = require("../ServerManager"))
    },
    initNodePool: function() {
        for (var e = new cc.NodePool, t = 0; t < 30; t++) {
            var i = cc.instantiate(this.waterFall);
            e.put(i)
        }
        cc.director.nodePool = e;
        for (var s, n = new cc.NodePool, a = 0; a < 36; a++)
            s = cc.instantiate(this.insect),
            n.put(s);
        cc.director.insectPool = n
    },
    testTime: function() {
        if (!framUtils.getServerTime()) {
            var e = Math.floor((new Date).getTime() / 1e3);
            framUtils.saveServerTime(e),
            framUtils.saveSyncServerTime()
        }
    },
    onTouchStart: function(e) {
        var t = cc.instantiate(this.fingerFire)
          , i = e.getLocation()
          , s = this.farm.convertToNodeSpaceAR(i);
        t.parent = this.farm,
        t.position = s,
        this.fFire = t,
        this.fFire.active = !1
    },
    onTouchMove: function(e) {
        (Math.abs(e.touch._prevPoint.x - e.touch._startPoint.x) >= 10 || Math.abs(e.touch._prevPoint.x - e.touch._startPoint.x) >= 10) && (this.fFire.active = !0);
        var t = e.getDelta();
        this.fFire.x += t.x,
        this.fFire.y += t.y
    },
    onTouchEnd: function() {
        cc.systemEvent.emit("MANAGER_LAND", {
            index: 20
        }),
        this.fFire.removeFromParent()
    },
    onTouchCancel: function() {
        this.fFire.removeFromParent()
    },
    initFarmContainer: function() {
        var e, t = FarmData.landPositionList;
        e = framUtils.checkLocalData("landData") ? framUtils.getLocalData("landData") : FarmData.landDetail;
        for (var n = 0; n < e.length; n++) {
            var a = cc.instantiate(this.ground);
            a.position = t[e[n].index],
            a.parent = this.landContainer,
            a.getComponent("groundLand").initGroundLand(e[n])
        }
        this.saveLandInfo()
    },
    getNextUnlockLand: function() {
        var e, t, n = FarmData.landUnlockLevelList;
        e = (t = framUtils.getLocalData("localFarmInfo")) ? t.level : 1,
        console.log(n, e, "179");
        for (var a = -1, o = 0; o < n.length - 1; o++)
            if (n[o] > e && n[o + 1] <= e) {
                a = o;
                break
            }
        if (a >= 0)
            return a
    },
    isLandUnlockBylevelUp: function() {
        var e = this.getNextUnlockLand();
   
        var t = this.landContainer.children[e]
          , i = this.landContainer.children[e + 1];
    
        var s = t.getComponent("groundLand")
          , n = i.getComponent("groundLand");
     
        0 != s.info.isLock && (s.displayLandStatue(0, !1),
        3 == n.info.isLock && 2 == n.info.isLock || n.displayLandStatue(2, !1))
    },
    updateLandData: function(e) {
        var t = e
          , i = framUtils.getLocalData("landData")
          , n = -1;
        if (i)
            for (var a = 0; a < i.length; a++)
                t.index == i[a].index && (n = a);
        n >= 0 && i.splice(n, 1, t),
        framUtils.setLocalData(i, "landData")
    },
    updateWarehouseData: function(e) {
        var t = e.data
          , i = framUtils.getLocalData("warehouseData");
        if (i) {
            var n = i.length;
            if (1 == e.mode) {
                for (var a = -1, o = 0; o < n; o++)
                    if (t.type == i[o].type) {
                        i[o].number += t.number,
                        a = o;
                        break
                    }
                a < 0 && i.push(t),
                cc.systemEvent.emit("OBTAIN_CROPS", {
                    data: t,
                    worldPos: e.worldPos
                })
            } else {
                for (var c = -1, r = 0; r < n; r++)
                    if (t.type == i[r].type) {
                        t.number >= i[r].number ? i.splice(r, 1) : i[r].number -= t.number,
                        c = r;
                        break
                    }
                c < 0 && cc.log("error:something wroing when you sell from you warehouse!")
            }
        } else {
            if (1 != e.mode)
                return;
            (i = []).push(t),
            cc.systemEvent.emit("OBTAIN_CROPS", {
                data: t,
                worldPos: e.worldPos
            })
        }
        framUtils.setLocalData(i, "warehouseData")
    },
    updateFarmInfo: function(e) {
        var t, n = e.exp, a = e.coins, o = e.worldPos, c = !1;
        cc.systemEvent.emit("ADD_COINS", a);
        var r = framUtils.getLocalData("localFarmInfo");
        r || (r = {
            level: 1,
            exp: 0,
            coin: 0
        });
        var d = r.level;
        r.exp += n,
        this.computedExpLevelUpCount(r),
        d < r.level && (c = !0),
        t = r.exp / FarmData.getLevelUpExp(r.level + 1),
        framUtils.setLocalData(r, "localFarmInfo"),
        cc.systemEvent.emit("START_TO_END", {
            worldPos: o,
            num: t,
            exp: n,
            islevelUp: c
        })
    },
    computedExpLevelUpCount: function(e) {
        var t = FarmData.getLevelUpExp(e.level + 1);
        t > e.exp || (e.exp -= t,
        e.level += 1,
        this.computedExpLevelUpCount(e))
    },
    checkLandStatue: function() {
        var e = framUtils.getLocalData("landData");
        if (e)
            for (var t = 0; t < e.length; t++)
                if (2 == e[t].isLock) {
                    var i = this.landContainer.children[t];
                    "ground" == i.name && i.getComponent("groundLand").displayLandStatue(2, !1)
                }
    },
    isLandUnlockedAfterLevelUp: function(e) {
        for (var t = FarmData.landUnlockLevelList, n = [], a = 0; a < t.length; a++)
            e >= t[a] && n.push(a);
        if (n.length > 0) {
            var o = framUtils.getLocalData("landData");
            if (o)
                for (var c = 0; c < n.length; c++) {
                    var r = n[c];
                    if (o[r].isLock) {
                        var d = this.landContainer.children[r]
                          , l = d.parent.convertToWorldSpaceAR(d.position)
                          , h = {};
                        h.worldPos = l,
                        h.index = r,
                        cc.director.farmDialog.showLandUnlockPormpt(h)
                    }
                }
        }
        var p = FarmData.plantLimitedList.indexOf(e);
        p >= 0 && cc.systemEvent.emit("SHOW_PLANT_UNLOCK", {
            type: p
        })
    },
    updateSeedData: function(e) {
        var t = e.data
          , n = framUtils.getLocalData("seedData");
        n || (n = FarmData.seedData);
        for (var a = n.length, o = -1, c = 0; c < a; c++)
            if (t.type == n[c].type) {
                o = c;
                break
            }
        if (o >= 0) {
            var r = n[o];
            1 == t.mode ? (r.number += t.number,
            cc.systemEvent.emit("UPDATE_FARM_COINS")) : 2 == t.mode ? (r.number -= t.number,
            cc.systemEvent.emit("UPDATE_OPERATE_NUMBER", {
                number: r.number
            })) : 3 == mode ? r.level++ : 4 == mode && (r.isUnlock = !0)
        }
        framUtils.setLocalData(n, "seedData")
    },
    updatePropsData: function(e) {
        var t = e.data;
        console.log(t);
        var n = framUtils.getLocalData("propsData");
        n || (n = FarmData.propsData);
        for (var a = n.length, o = -1, c = 0; c < a; c++)
            if (t.type == n[c].type) {
                o = c;
                break
            }
        if (o >= 0) {
            var r = n[o];
            1 == t.mode ? (r.number++,
            cc.systemEvent.emit("UPDATE_FARM_COINS")) : 2 == t.mode ? (r.number--,
            cc.systemEvent.emit("UPDATE_OPERATE_NUMBER", {
                number: r.number
            }),
            r.number <= 0 && n.splice(o, 1)) : 3 == mode && (r.isUnlock = !0)
        } else {
            var d = {
                type: t.type,
                number: 1
            };
            n.push(d)
        }
        framUtils.setLocalData(n, "propsData")
    },
    addCoins: function(e) {
        if ("number" == typeof e) {
            var t = framUtils.getLocalData("localFarmInfo");
            t.coin += e,
            framUtils.setLocalData(t, "localFarmInfo"),
            cc.systemEvent.emit("UPDATE_FARM_COINS", {
                number: e
            })
        } else
            cc.log("params is not a number,please check!---------------addCoins")
    },
    saveLandInfo: function() {
        if (!framUtils.checkLocalData("landData")) {
            var e = FarmData.landDetail;
            framUtils.setLocalData(e, "landData")
        }
    },
    getCurrentAllLandExp: function() {
        for (var e = this.landContainer.children, t = 0, i = 0; i < e.length; i++)
            if ("ground" == e[i].name) {
                var s = e[i].getComponent("groundLand");
                if (!framUtils.info.isUse)
                    continue;
                t += s.getCurrentLandExp()
            }
        return t
    },
    collectAllLandExp: function() {
        for (var e = this.landContainer.children, t = 0; t < e.length; t++)
            if ("ground" == e[t].name) {
                var i = e[t].getComponent("groundLand");
                if (!i.info.isUse)
                    continue;
                sum += i.progressNode.collectExp()
            }
    },
    resetAllLandExp: function() {
        for (var e = this.landContainer.children, t = 0; t < e.length; t++)
            if ("ground" == e[t].name) {
                var i = e[t].getComponent("groundLand");
                if (!i.info.isUse)
                    continue;
                i.progressNode.resetAccumulateStartTime()
            }
    },
    waterAllLand: function(e) {
        for (var t = framUtils.getLocalData("landData"), i = t.length, n = 0; n < i; n++)
            t[n].waterTime += e;
        framUtils.setLocalData(t, "landData")
    },
    jumpToMainScreen: function() {
        cc.systemEvent.emit("FADEIN_COULD_ANIMA"),
        this.scheduleOnce(function() {
            cc.director.loadScene("mainScreen"),
            cc.director.sceneMsg = "farm"
        }, 1)
    },
    hideAllPlantStatue: function() {
        for (var e = this.landContainer.children, t = 0; t < e.length; t++)
            e[t].getComponent("groundLand").changePlantStatue(1)
    },
    showAllPlantStatue: function() {
        for (var e = this.landContainer.children, t = 0; t < e.length; t++)
            "ground" == e[t].name && e[t].getComponent("groundLand").changePlantStatue(2)
    },
    fertAllLandSpeed: function(e) {
        var t, s;
        t = e.type,
        s = FarmData.propShopList[t].effectTime * FarmData.costTime.ONE_HOUR;
        for (var n = this.landContainer.children, a = 0; a < n.length; a++) {
            var o = n[a].getComponent("groundLand");
            o.updatePlantReapRestTime(s),
            o.fertAnimation(t)
        }
    },
    waterAllLandSpeed: function(e) {
        var t, s, n;
        t = e.number,
        n = this.landContainer.children,
        s = t * FarmData.costTime.ONE_MIN;
        for (var a = 0; a < n.length; a++) {
            var o = n[a].getComponent("groundLand");
            o.updatePlantReapRestTime(s),
            o.waterAnimation(t)
        }
    },
    managerLandStatues: function(e) {
        for (var t = e.detail.index, i = this.landContainer.children, s = 0; s < i.length; s++)
            s != t && "ground" == i[s].name && i[s].getComponent("groundLand").managerLand(2);
        this.cacheTime = 6,
        cc.director.getScheduler().isScheduled(this.renormalLand, this) || this.schedule(this.renormalLand, 1)
    },
    renormalLand: function() {
        if (this.cacheTime && this.cacheTime > 0)
            this.cacheTime--;
        else {
            this.unschedule(this.renormalLand);
            for (var e = this.landContainer.children, t = 0; t < e.length; t++)
                "ground" == e[t].name && e[t].getComponent("groundLand").managerLand(2)
        }
    },
    onEnable: function() {
        framUtils.login(),
        this.testTime(),
        this.initFarmContainer(),
        framUtils.resize()
    },
    start: function() {
        cc.systemEvent.emit("FADEOUT_COULD_ANIMA"),
        this.scheduleOnce(function() {
            this.isNeedEjectOfflinePrompt()
        }, 2)
    },
    isNeedEjectOfflinePrompt: function() {
        this.getCurrentAllLandExp() >= FarmData.expThreshold && cc.director.farmDialog.showOfflineExpPrompt()
    },
    onDestroy: function() {},
    jump: function() {}
});
 