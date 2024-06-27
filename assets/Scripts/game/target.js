
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
    updateNodeTag: function(list, step) {
        this.originStep = step
        this.stepCount = step
        this.tContent = list
        this.updateGameStep(this.stepCount),
        this.hideTargetNode();
        var s = this.computedNodeGap(list.length, this.node, this.nodeList[0])
        for (var i = 0; i < list.length; i++) {
            var a = this.nodeList[i];
            a.position = cc.v2(s * (i + 1) + a.width * i + a.width / 2, 0)
            a.active = true
            a.name = list[i][0] + "";
            var icon = a.getChildByName("icon")
            var sub = a.getChildByName("sub")
            var c = list[i][0] < 20 ? list[i][0] : list[i][0] - 20;
            //e.getComponent(cc.Sprite).spriteFrame
            sub.active = false  
            if(list[i][0] < 20){
                utils.changeLocalNodeTexture(icon, this.viewList, c)
                if(list[i][0] < 6){
                    sub.active = true
                    utils.changeLocalNodeTexture(sub, this.subView, c)
                }
            }else if(list[i][0] == 38){
                utils.changeLocalNodeTexture(icon, this.hinderListView, 10)
            }else if(list[i][0] == 39){
                utils.changeLocalNodeTexture(icon, this.hinderListView, 11)
            }else if(list[i][0] == 37){
                utils.changeLocalNodeTexture(icon, this.hinderListView, 12)
            }else if(list[i][0] == 40){
                utils.changeLocalNodeTexture(icon, this.hinderListView, 13)                            
            }else if(list[i][0] == 41){
                utils.changeLocalNodeTexture(icon, this.hinderListView, 14)                            
            }else if(list[i][0] == 42){
                utils.changeLocalNodeTexture(icon, this.hinderListView, 16)                            
            }else{
                utils.changeLocalNodeTexture(icon, this.hinderListView, c)
            }
            this.updateTargetNumber(list[i][0], list[i][1])
            this.targetList[list[i][0] + ""] = list[i][1]
        }
    },

    updateTargetNumber: function(type, target) {
        var nodeTarget = this.node.getChildByName(type + "")
        var numLabel = nodeTarget.getChildByName("num")
        if (target > 0) {
            if(cc.director.colorLimit){
                cc.systemEvent.emit("UPDATETARGET");
            }
            
            numLabel.getComponent(cc.Label).string = target + ""
            numLabel.active = true;
            var getAction = nodeTarget.getActionByTag(2);
            if (getAction && !getAction.isDone()){
                return;
            }
            var action = cc.sequence(cc.scaleTo(0.2, 0.9), cc.scaleTo(0.2, 1.1), cc.scaleTo(0.2, 1));
            action.tag = 2
            nodeTarget.runAction(action);
            var boom_star = cc.instantiate(this.boom_star);
            boom_star.parent = nodeTarget
            boom_star.getComponent(cc.ParticleSystem).resetSystem()
        } else{
            numLabel.active = false
            nodeTarget.getChildByName("finishIcon").active = true
        }
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
    countBlockNumber: function(obj) {        
        var t, tmp = obj;
        if(this.judgeType(tmp.type) || 100 == tmp.type){
            if(100 != tmp.type){
                if(tmp.type >= 23 && tmp.type <= 25){
                    tmp.type = 25
                }else if(tmp.type >= 29 && tmp.type <= 36){
                    tmp.type = 29
                }
                t = tmp.type + ""
                if(this.targetList[t] >= 0){
                    if(this.targetList[t] > 0){
                        if(obj.hit){
                            this.targetList[t]-= obj.hit
                        }else{
                            this.targetList[t]--
                        }                    
                    }
                    this.updateTargetNumber(tmp.type, this.targetList[t])
                }else{
                    this.targetList[t] = 0
                }
            }
            if(20 != obj.type){
                this.isFinishedTarget()
            }
        }
    },
    judgeType: function(e) {
        var bool = false
        for (var i = 0; i < this.tContent.length; i++){
            if (25 == this.tContent[i][0]) {
                if(e >= 23 && e <= 25) {
                    bool = true;
                    break
                }
            }else if (29 == this.tContent[i][0]) {
                if(e >= 29 && e <= 36) {
                    bool = true;
                    break
                }
            }else if (this.tContent[i][0] == e) {
                bool = true;
                break
            }
        }
        return bool
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
    
});
