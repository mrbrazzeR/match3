
import i  from "./utils"

cc.Class({
    extends: cc.Component,

    properties: {
        wordList: [cc.SpriteFrame],
        toolViewList: [cc.SpriteFrame],
        toolView: cc.Node
    },

    onLoad: function() {
        
    },
    start: function() {
        cc.log("start interface")
        this.showRandomTipsPhoto(), i.resize(), 1 == cc.director.jumpCode && this.jumpToGameView(), 2 == cc.director.jumpCode && this.jumpToMainScreen()
    },
    jumpToGameView: function() {
        //cc.director.preloadScene("gameView"), this.scheduleOnce(function() {
            this.node.runAction(cc.sequence(cc.fadeOut(.5), cc.callFunc(function() {
                //cc.director.NativeManager.showInterstitialAd(3), 
                cc.director.loadScene("gameView")
            })))
        //})
    },
    jumpToMainScreen: function() {
        //cc.director.preloadScene("mainScreen"), this.scheduleOnce(function() {
            this.node.runAction(cc.sequence(cc.fadeOut(.5), cc.callFunc(function() {
                //cc.director.NativeManager.showInterstitialAd(3), 
                cc.director.loadScene("mainScreen")
            })))
        //})
    },
    showRandomTipsPhoto: function() {
        var e;
        cc.sys.localStorage.getItem("isFresh") ? e = Math.floor(Math.random() * this.toolViewList.length) : (e = 9, cc.sys.localStorage.setItem("isFresh", "yes")), this.toolView.getComponent(cc.Sprite).spriteFrame = this.toolViewList[e]
    },
   
    onDestroy: function() {}
});
