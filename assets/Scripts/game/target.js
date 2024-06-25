
import utils  from "../utils"
import gameData from "../gameData"

cc.Class({
    extends: cc.Component,

    properties: {
        viewList: [cc.SpriteFrame],
        subView: [cc.SpriteFrame],
        nodeList: [cc.Node],
        step: cc.Label,
        hinderListView: [cc.SpriteFrame],
        gameMask: cc.Node,
        //resultTips: require("../dialog/resultTips"),
        boom_star: cc.Prefab,    
        
    },

    onLoad: function() {

        cc.systemEvent.on("NUMBER_COUNT", this.countBlockNumber, this),
        cc.systemEvent.on("STEP_COUNT", this.countGameStep, this),
        cc.systemEvent.on("GAMEMASK_CONTROL", this.controlGameMask, this)
    },
    resumeGameStatues: function() {
        this.isPass = false,
        this.isGameEnd = false,
        this.initTargetNumber()
    },
    hideTargetNode: function() {
        for (var e = 0; e < this.nodeList.length; e++){
            this.nodeList[e].active = false
            this.nodeList[e].getChildByName("finishIcon").active = false
        }
    },
    controlGameMask: function(e) {
        1 == e.order ? this.gameMask.active = true : this.gameMask.active = false
    },
    initTargetNumber: function() {
        this.targetList = {}
    },
    updateNodeTag: function(e, t) {
        this.originStep = t
        this.stepCount = t
        this.tContent = e
        this.updateGameStep(this.stepCount),
        this.hideTargetNode();
        var s = this.computedNodeGap(e.length, this.node, this.nodeList[0])
        for (var n = 0; n < e.length; n++) {
            var a = this.nodeList[n];
            a.position = cc.v2(s * (n + 1) + a.width * n + a.width / 2, 0)
            a.active = true
            a.name = e[n][0] + "";
            var icon = a.getChildByName("icon")
            var sub = a.getChildByName("sub")
            var c = e[n][0] < 20 ? e[n][0] : e[n][0] - 20;
            //e.getComponent(cc.Sprite).spriteFrame
            sub.active = false  
            if(e[n][0] < 20){
                utils.changeLocalNodeTexture(icon, this.viewList, c)
                if(e[n][0] < 6){
                    sub.active = true
                    utils.changeLocalNodeTexture(sub, this.subView, c)
                }
            }else if(e[n][0] == 38){
                utils.changeLocalNodeTexture(icon, this.hinderListView, 10)
            }else if(e[n][0] == 39){
                utils.changeLocalNodeTexture(icon, this.hinderListView, 11)
            }else if(e[n][0] == 37){
                utils.changeLocalNodeTexture(icon, this.hinderListView, 12)
            }else{
                utils.changeLocalNodeTexture(icon, this.hinderListView, c)
            }
            this.updateTargetNumber(e[n][0], e[n][1])
            this.targetList[e[n][0] + ""] = e[n][1]
        }
    },
    updateTargetNumber: function(e, t) {
        var i = this.node.getChildByName(e + "")
        var s = i.getChildByName("num")
        var n = s.getComponent(cc.Label);
        cc.systemEvent.emit("UPDATETARGET",{});  
        if (t > 0) {
            n.string = t + "",
            s.active = true;
            var a = i.getActionByTag(2);
            if (a && !a.isDone()){
                return;
            }
            var o = cc.sequence(cc.scaleTo(.2, .9), cc.scaleTo(.2, 1.1), cc.scaleTo(.2, 1));
            o.tag = 2,
            i.runAction(o);
            var c = cc.instantiate(this.boom_star);
            c.parent = i,
            c.getComponent(cc.ParticleSystem).resetSystem()
        } else
            s.active = false,
            i.getChildByName("finishIcon").active = true
              
    },
    updateGameStep: function(e) {
        this.step.string = e + ""
    },
    computedNodeGap: function(e, t, i) {
        return (t.width - e * i.width) / (e + 1)
    },
    countGameStep: function() {
        this.stepCount--,
        this.stepCount > 0 ? (
            this.updateGameStep(this.stepCount),
            this.isPass || 5 != this.stepCount || cc.systemEvent.emit("FIVE_STEP_TIPS")
        ) : (
            this.isGameEnd = true,
            this.updateGameStep("0"),
            cc.director.container.canclePlayerNotice(),
            cc.systemEvent.emit("GAMEMASK_CONTROL", {
                order: 1
            }),
            this.checkDeath()
        )
    },
    checkDeath: function() {
        this.scheduleOnce(function() {
            // Kiểm tra nếu không phải trạng thái "Pine" và các điều kiện khác
            if (cc.director.isPine === 0) {
                if (cc.director.isrunning || cc.director.isSuperTool === 1 || cc.director.needWait === 1) {
                    this.checkDeath(); // Gọi lại checkDeath nếu điều kiện không thỏa mãn
                } else {
                    this.scheduleOnce(function() {
                        // Kiểm tra nếu không phải trạng thái "Pine" và các điều kiện khác
                        if (cc.director.isPine !== 0 || cc.director.isrunning || cc.director.isMoving) {
                            return;
                        }
                        this.scheduleOnce(function() {
                            if (!this.isPass) {
                                cc.log("sadsad===============")
                                cc.director.dialogScript.showResultTipsView(2); // Hiển thị kết quả nếu điều kiện không thỏa mãn
                            }
                        }, 0.2); // Đợi 2 giây trước khi kiểm tra điều kiện
                    }.bind(this), 0.2); // Đợi 0.3 giây trước khi kiểm tra điều kiện
                }
            }
        }.bind(this), 0.5);
    },
    showSuccess: function() {
        1 == cc.director.isSuperTool ? this.scheduleOnce(function() {
            this.showSuccess()
        }.bind(this), .5) : this.scheduleOnce(function() {
            cc.director.dialogScript.showResultTipsView(1)
        }, 1)
    },
    isFinishedTarget: function() {
        if (!this.isPass) {
            var e = true;
            for (var t in this.targetList)
                if (this.targetList[t + ""] > 0) {
                    e = false;
                    break
                }
            e && this.stepCount >= 0 ? (this.isPass = true,
            this.isGameEnd = true,
            cc.systemEvent.emit("GAMEMASK_CONTROL", {
                order: 1
            }),
            cc.director.container.canclePlayerNotice(),
            this.showSuccess()) : cc.director.checkLastPine > 0 && (this.stepCount > 0 ? cc.director.isPine = 0 : this.scheduleOnce(function() {
                cc.director.checkLastPine--,
                cc.director.checkLastPine <= 0 && cc.director.dialogScript.showResultTipsView(2)
            }, 1.1))
        }
    },
    changeStepToRocket: function(e, t) {
        var i = e.pop();
        this.updateGameStep(e.length),
        this.countGameStep(),
        cc.systemEvent.emit("FIREINTHEHOLE", {
            startPos: t,
            endGrid: i,
            step: this.stepCount
        }),
        e.length > 0 && this.scheduleOnce(function() {
            this.changeStepToRocket(e, t)
        }, .1)
    },
    submitPlayerUsedStep: function() {
        var e = this.originStep - this.stepCount
          , t = cc.director.isPlayerUsedTool ? 1 : 0;
        window.NativeManager.tjReport(gameData.bestLevel + 1, e, t)
    },
    countBlockNumber: function(e) {
        var t, i = e;
        (this.judgeType(i.type) || 100 == i.type) && (100 != i.type && (i.type >= 23 && i.type <= 25 ? i.type = 25 : i.type >= 29 && i.type <= 36 && (i.type = 29),
        t = i.type + "",
        this.targetList[t] >= 0 ? (this.targetList[t] > 0 && this.targetList[t]--,
        this.updateTargetNumber(i.type, this.targetList[t])) : this.targetList[t] = 0),
        20 != e.type && this.isFinishedTarget())
    },
    judgeType: function(e) {
        for (var t = false, i = 0; i < this.tContent.length; i++)
            if (25 == this.tContent[i][0]) {
                if (e >= 23 && e <= 25) {
                    t = true;
                    break
                }
            } else if (29 == this.tContent[i][0]) {
                if (e >= 29 && e <= 36) {
                    t = true;
                    break
                }
            } else if (this.tContent[i][0] == e) {
                t = true;
                break
            }
        return t
    },
    getTargetIconWolrdPosition: function(e) {
        var t = this.node.getChildByName("" + e);
        return !!t && t.parent.convertToWorldSpaceAR(t.position)
    },
    checkTargetAgain: function() {
        var e = true;
        for (var t in this.targetList)
            if (this.targetList[t + ""] > 0) {
                e = false;
                break
            }
        return e
    },
    getCurrentTarget:function(){
        return this.targetList
    }
    
});
