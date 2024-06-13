var FarmData = require("./FarmData");
cc.Class({
    extends: cc.Component,

    properties: {
        netCacheNode: cc.Node,
        node_cloud: cc.Node,
        node_mask: cc.Node,
        node_guide: cc.Node,
        node_wordNotice: cc.Node,
        //voice_bgm: cc.AudioSource
    },

    onLoad: function() {
        cc.systemEvent.on("SHOW_CACHE_ANIMA", this.showNetCacheAnimation, this), cc.systemEvent.on("HIDE_CACHE_ANIMA", this.hideNetCacheAnimation, this), cc.systemEvent.on("FADEIN_COULD_ANIMA", this.cloudFadeIn, this), cc.systemEvent.on("FADEOUT_COULD_ANIMA", this.cloudFadeOut, this), cc.systemEvent.on("SHOW_FARM_GUIDE", this.showFarmGuide, this), cc.systemEvent.on("HIDE_FARM_GUIDE", this.hidefarmGuide, this), cc.systemEvent.on("SHOW_WORD_NOTICE", this.showWordNotice, this), this.node_mask.on(cc.Node.EventType.TOUCH_END, this.onTouchMask, this)
    },
    onTouchMask: function() {
        cc.systemEvent.emit("HIDE_FARM_GUIDE")
    },
    showNetCacheAnimation: function() {
        console.log("helloworld"), this.netCacheNode.active = !0, this.anima = this.netCacheNode.getComponent(cc.Animation), this.anima.play("cache")
    },
    hideNetCacheAnimation: function() {
        this.anima || (this.anima = this.netCacheNode.getComponent(cc.Animation)), this.anima.stop("cache"), this.netCacheNode.active = !1
    },
    cloudFadeOut: function() {
        var e = this;
        this.node_cloud.active = !0;
        var t = this.node_cloud.getChildByName("cloudLeft"),
            i = this.node_cloud.getChildByName("cloudRight");
        t.position = cc.v2(-400, 0), i.position = cc.v2(400, 0);
        var s = cc.sequence(cc.fadeIn(.1), cc.spawn(cc.fadeOut(1), cc.moveTo(1, cc.v2(-1200, 0)))).easing(cc.easeInOut(3)),
            n = cc.sequence(cc.fadeIn(.1), cc.spawn(cc.fadeOut(1), cc.moveTo(1, cc.v2(1200, 0))), cc.callFunc(function() {
                e.startFarmBgm()
            })).easing(cc.easeInOut(3));
        t.runAction(s), i.runAction(n), cc.director.SoundManager.playSound("farm_cloud")
    },
    cloudFadeIn: function() {
        var e = this;
        this.node_cloud.active = !0;
        var t = this.node_cloud.getChildByName("cloudLeft"),
            i = this.node_cloud.getChildByName("cloudRight");
        t.position = cc.v2(-1200, 0), i.position = cc.v2(1200, 0);
        var s = cc.sequence(cc.fadeOut(.1), cc.spawn(cc.fadeIn(1), cc.moveTo(1, cc.v2(-400, 0)))).easing(cc.easeInOut(3)),
            n = cc.sequence(cc.fadeOut(.1), cc.spawn(cc.fadeIn(1), cc.moveTo(1, cc.v2(400, 0))), cc.callFunc(function() {
                e.endFarmBgm()
            })).easing(cc.easeInOut(3));
        t.runAction(s), i.runAction(n), cc.director.SoundManager.playSound("farm_cloud")
    },
    showFarmGuide: function() {
        this.node_mask.active = !0, this.node_guide.active = !0
    },
    hidefarmGuide: function() {
        this.node_mask.active = !1, this.node_guide.active = !1
    },
    startFarmBgm: function() {
        /* var e = cc.sys.localStorage.getItem("bgm");
        console.log(e, "farm_tips"), e ? this.voice_bgm.play() : console.log("fuck music!") */
    },
    endFarmBgm: function() {
        //this.voice_bgm.stop()
    },
    showWordNotice: function(e) {
        var t = this.node_wordNotice.getChildByName("word").getComponent(cc.Label),
            s = e.code + "";
        t.string = FarmData.wordTips[s], this.node_wordNotice.stopAllActions(), this.node_wordNotice.scale = 0, this.node_wordNotice.active = !0;
        var n = cc.sequence(cc.spawn(cc.scaleTo(.2, 1), cc.fadeIn(.2)), cc.delayTime(1), cc.spawn(cc.scaleTo(.2, 0), cc.fadeOut(.2)));
        this.node_wordNotice.runAction(n)
    },
    
});
