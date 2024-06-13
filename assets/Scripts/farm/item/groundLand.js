var i = require("../framUtils"),
FarmData = require("../FarmData"),
            n = FarmData.costTime.ONE_MIN;
cc.Class({
    extends: cc.Component,

    properties: {
        earth: cc.Sprite,
        growStatue: cc.Sprite,
        statueList: [cc.SpriteFrame],
        list_locked_view: [cc.SpriteFrame],
        node_animaArea: cc.Node,
        node_speedUp: cc.Node,
        node_woodNotice: cc.Node,
        label_unlockLevel: cc.Label,
        node_tips: cc.Node,
        node_progress_reap: cc.Node,
        node_progress_produce: cc.Node,
        node_progress_protect: cc.Node,
        label_reap_time: cc.Label,
        label_produce_pecent: cc.Label,
        label_time_protectTime: cc.Label,
        list_inner_bar: [cc.SpriteFrame],
        list_tips_bg: [cc.SpriteFrame],
        unmatureProgressSpriteList: [cc.SpriteFrame],
        matureProgressSpriteList: [cc.SpriteFrame],
        progressNode: require("../progressNode"),
        plantAnimationNode: require("../plantAnimaNode"),
        landStatueNodeList: [cc.Node],
        insecMachine: cc.Prefab,
        landUnlockCost: [cc.SpriteFrame]
    },

    onLoad: function() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchStart, this), this.node.on("growStatueClick", this.growStatueClick, this), this.node.on("colliderEvent", this.handleColliderEvent, this), this.growStatue.node.on(cc.Node.EventType.TOUCH_END, this.click, this)
    },
    click: function() {
        var e = new cc.Event.EventCustom;
        this.growStatue.node.dispatchEvent(e)
    },
    growStatueClick: function() {
        this.onTouchStart()
    },
    handleColliderEvent: function(e) {
        console.log("handleColliderEvent!!!", e.detail.index), this.progressNode.collectExp()
    },
    getCurrentLandExp: function() {
        return this.progressNode.getAccumulateExpNumber()
    },
    initGroundLand: function(e) {
        this.info = e, this.computedAutoWaterReduceTime(), this.updateServerData(), this.compareInsectAppearTime(), this.showShield(), this.isLandLock(this.info.isUse), this.showPlantGrowStatue(this.info.healthStatue), this.updatePlantGrowStatue(this.info.type, this.info.growthStatue), this.excuteTimeCount(), this.landNormal(), this.allLandPlantMove()
    },
    updateServerData: function() {
        var e = i.getServerTime(),
            t = this.getPlantReapRestTime(e, 0);
        if (t <= 0) {
            var a = FarmData.plantInfo[this.info.type].witheredTime * n;
            Math.abs(t) >= a ? (this.info.growthStatue = 3, this.info.restTime = -1, this.info.healthStatue.withered = 1) : (this.info.healthStatue.reap = 1, this.info.restTime = -1, this.info.growthStatue = 2)
        } else {
            this.info.restTime = t;
            var o = this.getRestTimeNextWater();
            o <= 0 ? this.restWaterTime = Math.abs(o) : this.info.type >= 3 && (this.info.healthStatue.water = 1, this.info.waterTime = -1), this.tempPart = Math.floor(FarmData.plantInfo[this.info.type].cycle * n / 3), this.judgePlantGrowStage(t, this.tempPart)
        }
    },
    computedAutoWaterReduceTime: function() {
        var e = i.getLocalData("autoProp"),
            t = i.getServerTime();
        if (e) {
            var a, o = FarmData.plantInfo[this.info.type].waterIntervel * n;
            if (e.autowater.endTime > t) a = Math.floor((t - this.info.waterTime) / o), console.log(t, this.info.waterTime, a, o, "2222222");
            else {
                var c = this.getPlantReapRestTime(t, 0);
                if (e.autowater.endTime < 0 || c < 0) return;
                a = Math.floor((e.autowater.endTime - this.info.waterTime) / o), console.log("3333", a)
            }
            if (0 == (a = a >= 0 ? a : 0)) return;
            this.updatePlantReapRestTime(a * FarmData.IndirectTime), this.info.waterTime += a * o, console.log(a, "11111111111111"), cc.systemEvent.emit("UPDATE_LAND", this.info)
        }
    },
    getPlantReapRestTime: function(e, t) {
        var i = -1;
        return this.info ? i = this.info.restTime < 0 ? FarmData.plantInfo[this.info.type].cycle * n : this.info.plantTime >= 0 ? (i = FarmData.plantInfo[this.info.type].cycle * n + this.info.plantTime - e - t) >= 0 ? i : 0 : FarmData.plantInfo[this.info.type].cycle * n : i
    },
    judgePlantGrowStage: function(e, t) {
        e <= t ? (this.info.growthStatue = 2, this.plantAnimationNode.changePlantTexture(this.info.type, 2, this.info.index)) : e <= 2 * t ? (this.info.growthStatue = 1, this.plantAnimationNode.changePlantTexture(this.info.type, 1, this.info.index)) : e <= 3 * t && (this.info.growthStatue = 0, this.plantAnimationNode.changePlantTexture(this.info.type, 0, this.info.index))
    },
    getRestTimeNextWater: function() {
        var e = i.getServerTime();
        return this.info.waterTime < 0 ? FarmData.plantInfo[this.info.type].waterIntervel * n : e - this.info.waterTime - FarmData.plantInfo[this.info.type].waterIntervel * n
    },
    excuteTimeCount: function() {
        this.info.isUse ? this.info.healthStatue.reap ? (console.log("jinlezheli2222"), this.progressNode.initProgressNode(10, 2, this.info)) : (this.startWaterIntervel(), this.startReapInterVel(), this.scheduleOnce(function() {
            this.progressNode.initProgressNode(10, 1, this.info)
        }, .2 * this.info.index), console.log("jinlezheli11111")) : this.progressNode.hideProgressNode()
    },
    startWaterIntervel: function() {
        this.restWaterTime = Math.abs(this.getRestTimeNextWater()), this.schedule(this.excuteWater, 1)
    },
    startReapInterVel: function() {
        var e = i.getServerTime();
        this.restTime = this.getPlantReapRestTime(e, 0), this.schedule(this.excuteReap, 1)
    },
    startInsectAppearIntervel: function() {
        this.schedule(this.excuteInsectAppear, 1)
    },
    startShieldIntervel: function() {
        this.schedule(this.excuteShield, 1)
    },
    excuteWater: function() {
        this.restWaterTime <= 0 ? (this.unschedule(this.excuteWater), cc.director.isAutoWater ? this.water() : (this.info.healthStatue || (this.info.healthStatue.water = 1, this.showPlantGrowStatue(this.info.healthStatue)), cc.systemEvent.emit("UPDATE_LAND", this.info))) : this.info.healthStatue.reap ? (this.info.healthStatue.water = 0, this.unschedule(this.excuteWater), this.restWaterTime = 0) : this.restWaterTime--
    },
    excuteReap: function() {
        this.restTime <= 0 ? (this.unschedule(this.excuteReap), this.info.healthStatue.reap = 1, this.info.healthStatue.water = 0, this.info.restTime = 0, this.info.waterTime = -1, this.info.growthStatue = 2, this.scheduleOnce(function() {
            this.showPlantGrowStatue(this.info.healthStatue)
        }, 2), cc.systemEvent.emit("UPDATE_LAND", this.info), this.progressNode.finishedMoveAnimation()) : (this.restTime--, this.judgePlantGrowStage(this.restTime, this.tempPart))
    },
    excuteInsectAppear: function() {
        if (this.insectTime <= 0) {
            this.unschedule(this.excuteInsectAppear);
            var e = i.getServerTime();
            if (this.info.protectEndTime > e) return;
            this.info.healthStatue.bug = 1, this.insectAnimation(), this.showPlantGrowStatue(this.info.healthStatue), cc.systemEvent.emit("UPDATE_LAND", this.info)
        } else this.insectTime--//, console.log(this.insectTime)
    },
    excuteShield: function() {
        this.shieldTime <= 0 ? (this.hideShield(), this.unschedule(this.excuteShield), cc.systemEvent.emit("UPDATE_LAND", this.info)) : this.shieldTime--
    },
    updatePlantHealthStatue: function(e) {
        var t = this.growStatue.node;
        if ("number" == typeof e) {
            !t.active && this.info.isUse && (this.growStatue.node.active = !0), t.angle = -0, t.position = cc.v2(0, 20), t.stopAllActions(), this.growStatue.spriteFrame = this.statueList[e], t.scale = .1;
            var i = cc.sequence(cc.spawn(cc.moveTo(.5, cc.v2(0, 120)), cc.scaleTo(.5, 1)), cc.callFunc(function() {
                var e = cc.sequence(cc.spawn(cc.scaleTo(1, .9), cc.rotateBy(1, 10)), cc.spawn(cc.scaleTo(1, 1), cc.rotateBy(1, -10))).repeatForever();
                t.runAction(e)
            }));
            this.growStatue.node.runAction(i)
        }
    },
    updatePlantGrowStatue: function(e, t) {
        if ("number" == typeof e && "number" == typeof t) {
            if (!(t >= 0)) return;
            this.plantAnimationNode.changePlantTexture(e, t, this.info.index)
        }
    },
    isLandUsed: function(e) {
        this.growStatue.node.active = !!e
    },
    isLandLock: function(e) {

        var t = i.getLocalData("localFarmInfo");
        t && t.level, this.displayLandStatue(this.info.isLock, e)
    },
    hideAllChildren: function(e) {
        for (var t = 0; t < e.length; t++) e[t].active = !1
    },
    isEnoughBuy: function(e) {
        var t = cc.game.FarmUtils.getLocalData("localFarmInfo").coin;
        return t || (t = 0), t >= e
    },
    displayLandStatue: function(e, t) {
        switch (e) {
           
            case 0:
                this.earth.spriteFrame = this.list_locked_view[0], this.hideAllChildren(this.landStatueNodeList), this.landStatueNodeList[2].active = !0, this.landStatueNodeList[2].getChildByName("level").getComponent(cc.Label).string = "lv " + this.info.unlockLevel, 0 != this.info.isLock && (this.info.isLock = 0, cc.systemEvent.emit("UPDATE_LAND", this.info));
                break;
            case 1:
                this.earth.spriteFrame = this.list_locked_view[0], this.hideAllChildren(this.landStatueNodeList), this.landStatueNodeList[1].active = !0, 1 != this.info.isLock && (this.info.isLock = 1, cc.systemEvent.emit("UPDATE_LAND", this.info));
                break;
            case 2:
                this.earth.spriteFrame = this.list_locked_view[0], this.hideAllChildren(this.landStatueNodeList);
                var i = FarmData.landUnlockAndLevelUpCost[this.info.index].cost;
                this.landStatueNodeList[3].getComponent(cc.Sprite).spriteFrame = this.landUnlockCost[8 - this.info.index], this.isEnoughBuy(i) ? this.landStatueNodeList[3].active = !0 : (this.landStatueNodeList[3].active = !0, this.landStatueNodeList[0].active = !0), 2 != this.info.isLock && (this.info.isLock = 2, cc.systemEvent.emit("UPDATE_LAND", this.info));
                break;
            case 3:
                this.earth.spriteFrame = this.list_locked_view[1], this.hideAllChildren(this.landStatueNodeList), this.isLandUsed(t), 3 != this.info.isLock && (this.info.isLock = 3, cc.systemEvent.emit("UPDATE_LAND", this.info)), console.log("\u50bb\u72cd\u5b50\uff0c\u8fdb\u6765\u4e86\u4e48\uff1f")
        }
    },
    landLocked: function(e) {
        this.earth.spriteFrame = this.list_locked_view[0], 0 == e ? this.node_woodNotice.active = !0 : 1 == e ? this.node_icon_lock.active = !0 : 2 == e && (this.node_land_mask = !0), this.label_unlockLevel.string = "lv " + this.info.unlockLevel
    },
    landNormal: function() {
        this.info.isLock < 3 || (this.earth.spriteFrame = this.list_locked_view[1], this.node_tips.active = !1, this.hideTipsNode())
    },
    managerLand: function(e) {
        if (1 == e) this.landLocked();
        else if (2 == e) {
            if (this.info.isLock < 3) return;
            this.landNormal()
        } else 3 == e && this.landChoosed()
    },
    onTouchStart: function() {
        if (this.info.isLock < 3) {
            if (2 == this.info.isLock) {
                var e = this.node.parent.convertToWorldSpaceAR(this.node.position),
                    t = {};
                t.worldPos = e, t.index = this.info.index, cc.director.farmDialog.showLandUnlockPormpt(t)
            }
        } else {
            if (-1 == cc.director.currentPropsIndex && -1 == cc.director.currentPlantIndex) this.info.isUse ? this.operateByPlantStatue(this.info.healthStatue) : this.landChoosed("a");
            else {
                if (cc.director.currentPlantIndex >= 0 && -1 == cc.director.currentPropsIndex) {
                    if (this.info.isUse) return;
                    this.cultivate()
                }
                if (cc.director.currentPropsIndex >= 0 && -1 == cc.director.currentPlantIndex) {
                    if (!this.info.isUse) return;
                    this.fertilization()
                }
            }
            cc.systemEvent.emit("UPDATE_LAND", this.info)
        }
    },
    landChoosed: function(e) {
        console.log("landchoosed!!", e);
        var t = new cc.Event.EventCustom("manager_land", !0);
        t.detail = {
            index: this.info.index
        }, this.node.dispatchEvent(t), this.info.isUse && !this.node_tips.active ? (this.earth.spriteFrame = this.list_locked_view[2], this.node_tips.active = !0, this.showTipsNode()) : this.landNormal()
    },
    showTipsNode: function() {
        console.log("nimabizenmebuxianshi le?"), this.shieldTime && this.shieldTime > 0 ? (this.node_tips.getComponent(cc.Sprite).spriteFrame = this.list_tips_bg[0], this.node_progress_reap.position = cc.v2(0, 60), this.node_progress_produce.position = cc.v2(0, 10), this.node_progress_protect.position = cc.v2(0, -40), this.settingReaptTime(), this.settingProducePercent(), this.settingProtectTime(), this.node_progress_protect.active = !0) : (this.node_tips.getComponent(cc.Sprite).spriteFrame = this.list_tips_bg[1], this.node_progress_reap.position = cc.v2(0, 30), this.node_progress_produce.position = cc.v2(0, -10), this.settingReaptTime(), this.settingProducePercent(), this.node_progress_protect.active = !1)
    },
    settingProducePercent: function() {
        var e = this.node_progress_produce.getChildByName("percent").getComponent(cc.Label),
            t = this.node_progress_produce.getChildByName("outer").getComponent(cc.ProgressBar);
        1 == this.info.isReduceProduce ? (t.progress = .5, t.barSprite.spriteFrame = this.list_inner_bar[0], e.string = "50%") : -1 == this.info.isReduceProduce && (t.progress = 1, t.barSprite.spriteFrame = this.list_inner_bar[1], e.string = "100%")
    },
    settingReaptTime: function() {
        var e = FarmData.plantInfo[this.info.type].cycle * n,
            t = Math.floor(this.restTime / e * 100) / 100;
        this.node_progress_reap.getChildByName("outer").getComponent(cc.ProgressBar).progress = 1 - t >= 0 ? 1 - t : 1, this.showReapTimeCount(), this.schedule(this.showReapTimeCount, 1)
    },
    settingProtectTime: function() {
        if (this.shieldTime && this.shieldTime > 0) {
            var e = FarmData.propShopList[this.info.protectType].effectTime * n,
                t = Math.floor(this.shieldTime / e * 100) / 100;
            this.node_progress_protect.getChildByName("outer").getComponent(cc.ProgressBar).progress = t, this.showProtectTimeCount(), this.schedule(this.showProtectTimeCount, 1)
        }
    },
    showReapTimeCount: function() {
        var e = i.countdown(this.restTime, 2);
        this.label_reap_time.string = new String(e)
    },
    showProtectTimeCount: function() {
        var e = i.countdown(this.shieldTime, 2);
        this.label_time_protectTime.string = new String(e)
    },
    hideTipsNode: function() {
        this.unschedule(this.showNextWaterTime), this.unschedule(this.showReapTimeCount), this.unschedule(this.showProtectTimeCount)
    },
    showNextWaterTime: function() {
        var e = i.countdown(this.restWaterTime, 2);
        this.label_tips_water_time.string = new String(e)
    },
    changePlantStatue: function(e) {
        1 == e ? this.hideHealthStatue() : 2 == e && this.showPlantGrowStatue(this.info.healthStatue)
    },
    showPlantGrowStatue: function(e) {
        if (!(cc.director.currentPlantIndex >= 0 || cc.director.currentPropsIndex >= 0) && "object" == typeof e) {
            for (var t = Object.keys(e), i = t.length, s = -1, n = 0; n < i; n++)
                if (e[t[n]]) {
                    s = n;
                    break
                } s >= 0 ? (console.log(s, "698!!"), this.updatePlantHealthStatue(s)) : this.growStatue.node.active = !1
        }
    },
    operateByPlantStatue: function(e) {
        if ("object" == typeof e) {
            for (var t = Object.keys(e), i = t.length, s = -1, n = 0; n < i; n++)
                if (e[t[n]]) {
                    this.updatePlantHealthStatue(n), s = n;
                    break
                } s >= 0 ? 0 == s ? this.pestControl() : 1 == s ? this.reap() : 2 == s ? this.water() : 3 == s && this.rootOut() : this.landChoosed("b")
        }
    },
    hideHealthStatue: function() {
        this.growStatue.node.active = !1
    },
    resetLandProp: function() {
        var e = {};
        e.index = this.info.index, e.type = 0, e.growthStatue = -1, e.healthStatue = {
            bug: 0,
            reap: 0,
            water: 0,
            withered: 0
        }, e.isUse = !1, e.isLock = this.info.isLock, e.waterTime = -1, e.restTime = -1, e.plantTime = -1, e.unlockLevel = this.info.unlockLevel, e.protectEndTime = this.info.protectEndTime, e.insectAppearTime = -1, e.isReduceProduce = -1, e.protectType = this.info.protectType, this.info = e
    },
    reap: function() {
        this.hideHealthStatue(), this.info.isUse = !1, this.isLandUsed(!1);
        var e = this.getCurrentLevelReapNumber(this.info.type);
        console.log(this.info.type, e, "425"), 1 == this.info.isReduceProduce && (e = Math.floor(.5 * e), console.log("ssssssssssssssssss"));
        var t = {
                type: this.info.type,
                number: e
            },
            i = FarmData.getReapExp(this.info.type, e);
        i += this.progressNode.getAccumulateExpNumber();
        var n = this.node.parent.convertToWorldSpaceAR(this.node.position);
        cc.systemEvent.emit("UPDATE_WAREHOUSE", {
            data: t,
            mode: 1,
            worldPos: n
        }), cc.systemEvent.emit("UPDATE_FARM", {
            exp: i,
            coins: 0,
            worldPos: n
        }), this.addSeedPlantAmount(this.info.type), this.resetLandProp(), this.plantAnimationNode.fadeOut(), this.progressNode.resetAccumulateStartTime(), this.progressNode.resetPlantStartTime(this.info.index), this.progressNode.hideProgressNode(), cc.director.SoundManager.playSound("farm_reap"), this.progressNode.active = !1
    },
    getCurrentLevelReapNumber: function(e) {
        var t = i.getLocalData("seedData");
        t || (t = FarmData.seedData);
        for (var n, a = -1, o = 0; o < t.length; o++)
            if (t[o].type == e) {
                a = o;
                break
            } return a >= 0 && (n = FarmData.getPlantProduce(t[a].level, e)), n
    },
    addSeedPlantAmount: function(e) {
        var t = i.getLocalData("seedData"),
            n = -1;
        t || (t = FarmData.seedData);
        for (var a = 0; a < t.length; a++)
            if (t[a].type == e) {
                t[a].plantCount += 1, n = a;
                break
            } if (n >= 0) {
            var o = FarmData.plantInfo[n].levelUplimite;
            t[n].plantCount >= o && (t[n].plantCount -= o, t[n].level < 5 ? (t[n].level += 1, n = -10) : t[n].level = 5)
        }
        i.setLocalData(t, "seedData"), -10 == n && cc.systemEvent.emit("SHOW_LEVELUP", {
            type: this.info.type
        })
    },
    water: function() {
        var e;
        this.hideHealthStatue(), e = FarmData.IndirectTime;
        var t = i.getServerTime();
        this.info.healthStatue.water = 0, this.info.waterTime = t, this.restWaterTime = FarmData.plantInfo[this.info.type].waterIntervel * n, this.updatePlantReapRestTime(e), this.schedule(this.excuteWater, 1), this.waterAnimation(5);
        var a = FarmData.OperationReward[0],
            o = a.exp,
            c = a.coins,
            r = this.node.parent.convertToWorldSpaceAR(this.node.position);
        cc.systemEvent.emit("UPDATE_FARM", {
            exp: o,
            coins: c,
            worldPos: r
        }), cc.director.SoundManager.playSound("farm_water")
    },
    updatePlantReapRestTime: function(e) {
        this.info.isUse && (this.restTime && (this.restTime > e ? (this.restTime = this.restTime - e, this.progressNode.addSpeedUpTimeExpToAccumulateExpNumber(!1, e)) : (this.restTime = 1, this.progressNode.addSpeedUpTimeExpToAccumulateExpNumber(!0, 0))), this.info.plantTime && this.info.plantTime > 0 && (this.info.plantTime -= e), cc.systemEvent.emit("UPDATE_LAND", this.info))
    },
    fertilization: function() {
        if (1 != this.info.healthStatue.reap) {
            var e = cc.director.currentPropsIndex;
            if (this.getPropsNumber(e) > 0) {
                if (e < 4) {
                    var t = FarmData.propShopList[e].effectTime * n;
                    this.updatePlantReapRestTime(t), this.fertAnimation(e)
                } else e >= 12 && e < 15 && this.addShield(e);
                cc.systemEvent.emit("UPDATE_PROPS", {
                    data: {
                        mode: 2,
                        type: e
                    }
                });
                var i = FarmData.OperationReward[6],
                    a = i.exp,
                    o = i.coins,
                    c = this.node.parent.convertToWorldSpaceAR(this.node.position);
                cc.systemEvent.emit("UPDATE_FARM", {
                    exp: a,
                    coins: o,
                    worldPos: c
                })
            } else cc.systemEvent.emit("SHOW_WORD_NOTICE", {
                code: 1008
            });
            console.log("\u65bd\u80a5"), cc.director.SoundManager.playSound("farm_fert_1")
        } else cc.systemEvent.emit("SHOW_WORD_NOTICE", {
            code: 1003
        })
    },
    getPropsNumber: function(e) {
        var t = i.getLocalData("propsData");
        if (t) {
            for (var s = -1, n = 0; n < t.length; n++)
                if (t[n].type == e) {
                    s = n;
                    break
                } return s >= 0 ? t[s].number : 0
        }
        return 0
    },
    fertAnimation: function(e) {
        if (this.info.isUse && !(this.info.isLock < 3)) {
            var t = this.node_animaArea.getChildByName("fert");
            t.active = !0, t.getComponent(cc.ParticleSystem).resetSystem();
            var i = FarmData.propShopList[e].effectTime;
            this.scheduleOnce(function() {
                this.speedUpAnimation(i, "MINUTES"), t.active = !1
                , cc.director.SoundManager.playSound("farm_fert_2")
            }, 1)
        }
    },
    pestControl: function() {
        this.hideHealthStatue(), console.log("bug"), this.info.healthStatue.bug = 0, this.info.insectAppearTime = -1, this.insecAnimation(), this.removeInsectAnimation(), this.scheduleOnce(function() {
            this.showPlantGrowStatue(this.info.healthStatue)
        }, 2);
        var e = FarmData.OperationReward[4],
            t = e.exp,
            i = e.coins,
            n = this.node.parent.convertToWorldSpaceAR(this.node.position);
        this.scheduleOnce(function() {
            cc.systemEvent.emit("UPDATE_FARM", {
                exp: t,
                coins: i,
                worldPos: n
            })
        }, 1), cc.director.SoundManager.playSound("farm_insec")
    },
    rootOut: function() {
        this.resetLandProp();
        var e = FarmData.OperationReward[2],
            t = e.exp,
            i = e.coins,
            n = this.node.parent.convertToWorldSpaceAR(this.node.position);
        cc.systemEvent.emit("UPDATE_FARM", {
            exp: t,
            coins: i,
            worldPos: n
        })
    },
    cultivate: function() {
        if (this.info.type = cc.director.currentPlantIndex, i.getDataProperty(this.info.type, "seedData", "number") > 0) {
            this.tempPart = Math.floor(FarmData.plantInfo[this.info.type].cycle * n / 3), this.info.plantTime = i.getServerTime(), this.info.isUse = !0, this.info.healthStatue = {
                bug: 0,
                reap: 0,
                water: 0,
                withered: 0
            }, this.info.type > 1 && (this.info.healthStatue.water = 1), this.info.growthStatue = 0, this.computedInsectAppearTime(this.info.plantTime, this.info.type), cc.systemEvent.emit("UPDATE_SEED", {
                data: {
                    mode: 2,
                    type: this.info.type,
                    number: 1
                }
            }), this.plantAnimationNode.changePlantTexture(this.info.type, this.info.growStatue, this.info.index), cc.director.isAutoWater && this.type > 1 && this.scheduleOnce(function() {
                this.water()
            }, 2), this.startReapInterVel(), this.progressNode.initProgressNode(10, 1, this.info);
            var e = FarmData.OperationReward[1],
                t = e.exp,
                a = e.coins,
                o = this.node.parent.convertToWorldSpaceAR(this.node.position);
            cc.systemEvent.emit("UPDATE_FARM", {
                exp: t,
                coins: a,
                worldPos: o
            })
        } else cc.systemEvent.emit("SHOW_WORD_NOTICE", {
            code: 1009
        });
        cc.director.SoundManager.playSound("farm_plant")
    },
    computedInsectAppearTime: function(e, t) {
        if (!(t < 3)) {
            var i = FarmData.insectAppearTimeList[t],
                a = i[0],
                o = i[1],
                c = Math.floor(Math.random(o - a) + a) * n;
            this.info.insectAppearTime = c > 0 ? c + e : -1, this.insectTime = c, this.startInsectAppearIntervel()
        }
    },
    compareInsectAppearTime: function() {
        var e = i.getServerTime(),
            t = this.info.insectAppearTime;
        if (e < t || -1 == t) return this.insectTime = t - e, void(this.insectTime > 0 && (this.startInsectAppearIntervel(), console.log("insect is not appear! start insect countdown !")));
        if (console.log("insect is appear"), console.log(t, this.info.protectEndTime, "848"), !(t < this.info.protectEndTime)) {
            console.log("shenmegui ?");
            var a = FarmData.insectAppearTimeList[this.info.type][3] * n;
            this.info.healthStatue.bug = 1, this.insectAnimation(), e < t + a || (this.info.isReduceProduce = 1)
        }
    },
    insectAnimation: function() {
        if (this.info.isUse && !(this.info.isLock < 3))
            for (var e = this.node.getChildByName("insectNode"), t = FarmData.insectAppearPositionList[this.info.type][this.info.growthStatue], i = 0; i < 4; i++) {
                var n = void 0;
                (n = cc.director.insectPool.size() > 0 ? cc.director.insectPool.get() : cc.instantiate(cc.director.FarmManager.insect)).opacity = 0, n.parent = e, n.position = t[i], n.runAction(cc.fadeIn(2)), n.getComponent(cc.Animation).play("insect")
            }
    },
    removeInsectAnimation: function() {
        var e = this,
            t = this.node.getChildByName("insectNode").children;
        if (!(t.length <= 0))
            for (var i = function(i) {
                    e.scheduleOnce(function() {
                        t[i].getComponent(cc.Animation).stop("insect");
                        var e = cc.sequence(cc.fadeOut(1), cc.callFunc(function() {
                            cc.director.insectPool.put(t[i])
                        }));
                        t[i].runAction(e)
                    }, 1)
                }, s = t.length - 1; s >= 0; s--) i(s)
    },
    addShield: function(e) {
        var t = this.node.getChildByName("protect");
        t.active = !0;
        var a = t.getChildByName("protect");
        a.active = !0, a.getComponent(cc.ParticleSystem).resetSystem();
        var o = i.getServerTime(),
            c = FarmData.propShopList[e].effectTime * n;
        if (this.info.protectType = e, this.info.protectEndTime > o) {
            if (this.info.protectEndTime += c, this.shieldTime += c, cc.director.getScheduler().isScheduled(this.excuteShield, this)) return;
            this.startShieldIntervel()
        } else this.info.protectEndTime = o + c, this.shieldTime = c, this.startShieldIntervel();
        console.log(c, FarmData.propShopList[e].effectTime, "878")
        , cc.director.SoundManager.playSound("farm_protect")
        , cc.systemEvent.emit("UPDATE_LAND", this.info)
    },
    showShield: function() {
        if (this.info.protectEndTime || !(this.info.protectEndTime <= 0)) {
            var e = i.getServerTime();
            if (this.info.protectEndTime > e) {
                var t = this.node.getChildByName("protect");
                t.active = !0, this.shieldTime = this.info.protectEndTime - e;
                var s = t.getChildByName("protect");
                s.active = !0, s.getComponent(cc.ParticleSystem).resetSystem(), this.startShieldIntervel()
            }
        }
    },
    hideShield: function() {
        var e = this.node.getChildByName("protect");
        e.active = !1, e.getChildByName("protect").active = !1, this.info.protectEndTime = -1
    },
    getSeedNumberByType: function(e) {
        var t = i.getLocalData("seedData");
        if (t) {
            for (var s = -1, n = 0; n < t.length; n++)
                if (t[n].type == e) {
                    s = n;
                    break
                } return s >= 0 ? t[s].number : 0
        }
    },
    getLandInfo: function() {
        return !!this.info && this.info
    },
    waterAnimation: function(e) {
        if (this.info.isUse && !(this.info.isLock < 3)) {
            for (var t, i = FarmData.waterStartPos, n = FarmData.waterEndPos, a = 0; a < i.length; a++)(t = cc.director.nodePool.size() > 0 ? cc.director.nodePool.get() : cc.instantiate(cc.director.FarmManager.waterFall)).parent = this.node_animaArea, t.position = i[a], t.getComponent("item_fallWater").fallDown(n[a]);
            this.scheduleOnce(function() {
                this.speedUpAnimation(e, "MINUTES")
            }, .5)
        }
    },
    speedUpAnimation: function(e, t) {
        this.node_speedUp.active = !0;
        var i = this.node_speedUp.getComponent(cc.Animation);
        i.play("speedUp");
        var s = i.getClips()[0].duration;
        this.scheduleOnce(function() {
            this.node_speedUp.active = !1, this.reduceTimeAnimation(e, t)
        }, s)
    },
    reduceTimeAnimation: function(e, t) {
        var i = this.node_animaArea.getChildByName("reduceTime"),
            s = i.getChildByName("number").getComponent(cc.Label);
        i.getComponent(cc.Label).string = t, s.string = "." + e, i.position = cc.v2(50, -50), i.active = !0;
        var n = cc.sequence(cc.fadeIn(.1), cc.moveTo(.5, cc.v2(50, 0)), cc.fadeOut(.1), cc.callFunc(function() {
            i.active = !1
        }));
        i.runAction(n)
    },
    onDestroy: function() {
        this.unschedule(this.excuteReap), this.unschedule(this.excuteWater)
    },
    insecAnimation: function() {
        var e = cc.instantiate(this.insecMachine);
        e.parent = this.node, e.position = cc.v2(60, 120);
        var t = e.getComponent(cc.ParticleSystem);
        t.resetSystem();
        var i = t.duration;
        this.scheduleOnce(function() {
            e.removeFromParent()
        }, i)
    },
    allLandPlantMove: function() {
        this.info.isLock < 3 || !this.info.isUse ? this.plantAnimationNode.hideView() : this.plantAnimationNode.changePlantTexture(this.info.type, this.info.growthStatue, this.info.index)
    }
});
