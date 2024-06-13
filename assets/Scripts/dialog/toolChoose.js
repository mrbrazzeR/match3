
import gameData from "../gameData"
cc.Class({
    extends: cc.Component,

    properties: {
        //screenDialog: require("../mainScreen/screenDialog"),
        btnList: [cc.Node],
        btnView: [cc.SpriteFrame],
        btnChooseView: [cc.SpriteFrame],
        lockIcon: cc.SpriteFrame
    },
    onLoad: function() {
        this.toolList = [300, 35, 4], this.toolNum = [0, 0, 0]
    },
    start: function() {
        this.initBtnTag()
    },
    initBtnTag: function() {
        for (var e = 0; e < this.btnList.length; e++) {this.btnList[e].name = e.toString()}
   
    },
    updateGameToolNumber: function(e) {
   
        if (gameData.bestLevel < 8){ 
            this.lockTool();
        }else{
            for (var t = 0; t < e.length; t++) {
                var btn = this.btnList[t]
                var n = btn.getChildByName("count").getComponent(cc.Label)
                var a = btn.getChildByName("addIcon");
                btn.getChildByName("view").getComponent(cc.Sprite).spriteFrame = this.btnView[t]
                this.addEventListener(btn)
                e[t] > 0 ? (
                    n.string = "" + e[t], n.node.active = !0, a.active = !1
                ) : (
                    n.node.active = !1, a.active = !0
                )
            }
        }
    },
    lockTool: function() {
        for (var e = 0; e < this.btnList.length; e++) {
            var t = this.btnList[e],
                i = t.getChildByName("view"),
                s = t.getChildByName("addIcon"),
                n = t.getChildByName("count");
            s.active = n.active = !1, i.getComponent(cc.Sprite).spriteFrame = this.lockIcon
        }
    },
    addEventListener: function(e) {
        e.on(cc.Node.EventType.TOUCH_END, this.gameToolBtnTouchEvent, this)
    },
    gameToolBtnTouchEvent: function(e) {

        cc.director.SoundManager.playSound("btnEffect");
        var t = e.target,
            s = parseInt(t.name),
            n = t.getChildByName("count"),
            a = t.getChildByName("view");
        if (gameData.gameToolList[s] > 0) 
            t.hasBeenChoosed ? (
                a.getComponent(cc.Sprite).spriteFrame = this.btnView[s], t.  hasBeenChoosed = !1, this.toolNum[s] = 0, n.active = !0
            ) : (
                a.getComponent(cc.Sprite).spriteFrame = this.btnChooseView[s], t.hasBeenChoosed = !0, this.toolNum[s] = 1, n.active = !1
            ), gameData.choosedList = this.toolNum;
        else {
            var o = cc.director.gameManager.screenName;
            "game" == o && cc.director.dialogScript.showPlayerShop(s, 1)
            "main" == o && cc.director.screenDialog.showGameToolShop(s, 1)
        }
    },
    resumeData: function() {
        for (var e = 0; e < this.btnList.length; e++) {
            var t = this.btnList[e];
            t.getChildByName("view").getComponent(cc.Sprite).spriteFrame = this.btnView[e];
            var i = t.getChildByName("count");
            t.hasBeenChoosed ? (i.active = !1, t.hasBeenChoosed = !1) : i.active = !0
        }
    },
    getTooNumList: function() {
        return this.toolNum
    },
    
});
