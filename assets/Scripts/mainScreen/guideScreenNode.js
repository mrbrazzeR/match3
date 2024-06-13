
import gameData from "../gameData"

cc.Class({
    extends: cc.Component,

    properties: {
        blueBox: cc.Node,
        mask: cc.Node,
        container: cc.Node,
        pinkBox: cc.Node,
        wordList: [cc.SpriteFrame],
        word: cc.Sprite,
        explainNode: cc.Node,
        gameToolMask: cc.Node,
        circle_finger: cc.Node,
        circle: cc.Node,
        finger: cc.Node
    },

    onLoad: function() {
        cc.director.guideView = this
        cc.systemEvent.on("START_FINGER_GUIDE", this.startFingerGuide, this)
        cc.systemEvent.on("END_FINGER_GUIDE", this.endFingerGuide, this), this.guideTempList = []
    },
    tipsStarCollectBox: function() {
        this.boxType = 1, this.mask.active = true;
        var e = cc.instantiate(this.blueBox),
            t = this.blueBox.parent.convertToWorldSpaceAR(this.blueBox.position);
        e.removeComponent(cc.Widget), e.parent = this.container, e.position = this.container.convertToNodeSpaceAR(t), this.word.spriteFrame = this.wordList[this.boxType - 1];
        var i = this.container.getChildByName("arrow");
        i.active = true, i.angle = -210, this.arrowAnimation(i)
    },
    tipsLevelBox: function() {
        this.boxType = 2;
        var e = this.container.getChildByName("blueBox");
        e && e.removeFromParent(), this.mask.active = true;
        var t = cc.instantiate(this.pinkBox),
            i = this.pinkBox.parent.convertToWorldSpaceAR(this.pinkBox.position);
        t.removeComponent(cc.Widget), t.parent = this.container, t.position = this.container.convertToNodeSpaceAR(i), this.word.spriteFrame = this.wordList[this.boxType - 1];
        var s = this.container.getChildByName("arrow");
        s.active = true, s.angle = 210, this.arrowAnimation(s)
    },
    stepByType: function() {
        cc.director.SoundManager.playSound("btnEffect");
        if (this.boxType === 1) {
            this.tipsLevelBox();
        } else if (this.boxType === 2) {
            this.hideView();
            gameData.boxGuide = "yes"
            if(cc.director.FbManager.IS_FB_INSTANT){
                cc.director.FbManager.updateDataFB({
                    boxGuide: "yes"              
                })
            }else{
                cc.sys.localStorage.setItem("boxGuide", "yes");
                cc.log("boxGuide")
            }
            cc.systemEvent.emit("DAILYSIGN_GUIDE");
        } else if (this.boxType === 3) {
            this.hideView();
            
            gameData.gameToolGuide = "yes"
            if(cc.director.FbManager.IS_FB_INSTANT){
                cc.director.FbManager.updateDataFB({
                    gameToolGuide: gameData.gameToolGuide              
                }) 
            }else{
                cc.sys.localStorage.setItem("gameToolGuide", "yes");
                cc.log("gameToolGuide")
            }
        }
    },
    arrowAnimation: function(e) {
        e.scale = .5, e.runAction(cc.sequence(cc.scaleTo(1, .45), cc.scaleTo(1, .65)).repeatForever())
    },
    hideView: function() {
        this.container.getChildByName("arrow").active = false, this.explainNode.active = false, this.node.runAction(cc.sequence(cc.fadeOut(.5), cc.callFunc(function() {
            this.node.active = false
        }.bind(this))))
    },
    showScreenGuide: function() {
        this.mask.opacity = 180
        this.node.active = true
        this.container.active = true
        this.explainNode.active = true
        this.explainNode.position = cc.v2(0, 0)
        this.gameToolMask.active = false
        this.tipsStarCollectBox()
    },
    showGameToolGuide: function() {
        gameData.gameToolGuide || (this.boxType = 3, this.node.active = true, this.mask.active = false, this.gameToolMask.active = true, this.explainNode.active = true, this.explainNode.position = cc.v2(this.gameToolMask.position.x, this.gameToolMask.position.y + 350), this.gameToolGuide())
    },
    gameToolGuide: function() {
        this.word.spriteFrame = this.wordList[this.boxType - 1]
    },
    guideGestureShow: function() {
        var e = this.container.getChildByName("pinkBox");
        e && e.removeFromParent(), this.node.active = true, this.node.opacity = 255, this.circle_finger.active = true, this.circle_finger.zIndex = 3, this.fingerCircleAnimation()
    },
    fingerCircleAnimation: function() {
        var e = this,
            t = cc.sequence(cc.callFunc(function() {
                e.circle.scale = 3
            }), cc.scaleTo(2, .1)).repeatForever(),
            i = cc.sequence(cc.scaleTo(.5, 1.05), cc.scaleTo(1, .95), cc.scaleTo(.5, 1)).repeatForever();
        this.finger.runAction(i), this.circle.runAction(t)
    },
    guideGestureHide: function() {
        this.circle_finger.active = false, this.finger.stopAllActions(), this.circle.stopAllActions()
    },
    startFingerGuide: function(e) {
        this.mask.active = true;
        var t = cc.instantiate(e.targetNode);
        t.parent = this.node
        this.guideTempList.push(t);
        var i = this.node.convertToNodeSpaceAR(e.worldPos);
        this.circle_finger.position = i
        this.guideGestureShow()
    },
    endFingerGuide: function() {
        if (this.mask.active && (this.mask.active = false, this.guideTempList.length > 0)) {
            for (; this.guideTempList.length > 0;) this.guideTempList.pop().removeFromParent();
            this.guideGestureHide()
        }
    },
    
});
