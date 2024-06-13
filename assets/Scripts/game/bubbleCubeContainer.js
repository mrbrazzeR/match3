
import utils  from "../utils"
import gameData from "../gameData"
import psconfig from "../psconfig"
cc.Class({
    extends: cc.Component,

    properties: {
        bubble: cc.Prefab
    },

    onLoad: function() {
        cc.systemEvent.on("REMOVE_SINGLE_BUBBLE", this.removeSingleBubble, this), this.bubblePool = new cc.NodePool
    },
    initBubbleView: function() {
        for (var e = new Array(psconfig.matrixRow), t = [], i = 0; i < psconfig.matrixRow; i++) {
            e[i] = new Array(psconfig.matrixCol);
            for (var a = 0; a < psconfig.matrixCol; a++) e[i][a] = 0, t[utils.indexValue(i, a)] = null
        }
        this.bubbleList = e, this.spriteList = t
    },
    loadMapRes: function(e, t) {
        for (var s = 0; s < e.length; s++)
            for (var n = e[s], a = n[0][0], o = n[1][0], c = n[0][1], r = n[1][1], d = n[2], l = a; l <= o; l++)
                for (var h = c; h <= r; h++) - 2 != gameData.starMatrix[l][h] && (t[l][h] = d)
    },
    loadBubbleRes: function(e) {
        this.node.children.length > 0 && this.recycleBubbleNode();
        for (var t = 0; t < e.length; t++)
            for (var i = 0; i < e.length; i++)
                if (e[t][i] >= 1) {
                    var s = cc.v2(t, i);
                    this.addBubbleChild(s, e[t][i])
                }
    },
    addBubbleChild: function(e) {
        var t, i = utils.indexValue(e.x, e.y);
        (t = this.bubblePool.size() > 0 ? this.bubblePool.get() : cc.instantiate(this.bubble)).parent = this.node, t.position = utils.grid2Pos(e.x, e.y), this.spriteList[i] = t
    },
    recycleBubbleNode: function() {
        for (var e = this.node.children, t = e.length - 1; t >= 0; t--) "bubbleCube" == e[t].name ? this.bubblePool.put(e[t]) : e[t].removeFromParent()
    },
    removeSingleBubble: function(e) {
        var t = e.pos,
            i = utils.indexValue(t.x, t.y);
        if (this.spriteList && null != this.spriteList[i]) {
            var n = this.spriteList[i],
                a = n.parent.convertToWorldSpaceAR(n.position);
            this.bubblePool.put(n), this.spriteList[i] = null, this.bubbleList[t.x][t.y] = 0, cc.director.SoundManager.playSound("cubeBubble"), cc.systemEvent.emit("HIT_BUBBLE_ANIMATION", {
                worldPos: a
            }), cc.systemEvent.emit("NUMBER_COUNT", {
                type: 38
            })
        }
    },
    reset: function() {
        this.recycleBubbleNode()
    },
    initFunc: function(e) {
        this.initBubbleView(), this.loadMapRes(e, this.bubbleList), this.loadBubbleRes(this.bubbleList)
    },
});
