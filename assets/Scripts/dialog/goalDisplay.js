import gameData from "../gameData"

cc.Class({
    extends: cc.Component,

    properties: {
        goal: require("./goal"),
        bg: cc.Node,
        toolList: require("../game/toolList"),
        squirrelNode: cc.Node
    },

    initGoalPosition: function() {
        var e = cc.view.getFrameSize();
        this.constNum = this.node.width + e.width / 2, this.node.position = cc.v2(this.constNum, 0), this.squirrelNode.position = cc.v2(e.width / 2 + this.squirrelNode.width / 2, 0)
    },
    squirrelAnimation: function() {
        var e = cc.view.getVisibleSize();
        this.scaleRate = e.width / cc.view.getDesignResolutionSize().width, this.squirrelNode.active = true, this.squirrelNode.getComponent(cc.Animation).play("squirrelsRun");
        var t = cc.sequence(cc.fadeIn(.1), cc.moveTo(2 * this.scaleRate, cc.v2(-(e.width + 2 * this.squirrelNode.width) / 2, 0)), cc.fadeOut(.1));
        this.squirrelNode.runAction(t)
    },
    fadeInAndOut: function() {
        cc.director.SoundManager.playSound("mission_show")
        this.node.parent.active = true, this.node.active = true;
        var e = this;
        this.initGoalPosition(), this.squirrelAnimation();
        var t = cc.sequence(cc.spawn(cc.fadeIn(.79), cc.moveTo(1.58 * this.scaleRate, cc.v2(0, 0))), cc.callFunc(function() {
            for (var t = e.goal.getTargetItemWorldPosition(), i = 0; i < t.length; i++) cc.systemEvent.emit("NOTICE_TARGET", t[i]);
            e.goal.node.active = false
        }), cc.fadeOut(.79), cc.callFunc(function() {
  
            cc.director.container.addGameToolToContainer(gameData.choosedList), e.toolList.judgeLevel(), e.bg.runAction(cc.fadeOut(.5)), setTimeout(function() {
                cc.systemEvent.emit("EXCUTE_GUIDE_STEP")
            }, 500)
        }));
        this.node.runAction(t)
    },
    initGoalNumber: function(e) {
        this.bg.active = true, this.bg.opacity = 120, this.goal.node.active = true, this.goal.updateNodeTag(e), this.fadeInAndOut()
    },
    
});
