
import utils from "../utils"
import gameData from "../gameData"
import psconfig from "../psconfig"
cc.Class({
    extends: cc.Component,

    properties: {
        grass: cc.Prefab,
        squirrel_container: cc.Node,
        squirrel: cc.Prefab
    },

    onLoad: function() {
        cc.systemEvent.on("REMOVE_SINGLE_GRASS", this.removeSingleGrass, this),
        this.grassPool = new cc.NodePool,
        this.squirrelNodeList = []
    },
    initGroundView: function() {
        for (var e = new Array(psconfig.matrixRow), t = [], n = 0; n < psconfig.matrixRow; n++) {
            e[n] = new Array(psconfig.matrixCol);
            for (var a = 0; a < psconfig.matrixCol; a++)
                e[n][a] = 0,
                t[utils.indexValue(n, a)] = null
        }
        this.groundList = e,
        this.spriteList = t
    },
    loadMapRes: function(e, t) {
        for (var i = 0; i < e.length; i++)
            for (var s = e[i], a = s[0][0], o = s[1][0], c = s[0][1], r = s[1][1], d = s[2], l = a; l <= o; l++)
                for (var h = c; h <= r; h++)
                    -2 != gameData.starMatrix[l][h] && (t[l][h] = d)
    },
    loadGrassRes: function(e) {
        this.node.children.length > 0 && this.recycleGrassNode();
        for (var t = 0; t < e.length; t++)
            for (var i = 0; i < e.length; i++)
                if (e[t][i] >= 1) {
                    var s = cc.v2(t, i);
                    this.addGrassChild(s, e[t][i])
                }
    },
    loadSquirrelStatue: function(e) {
        for (var t = 0; t < e.length; t++) {
            var i = e[t]
              , s = cc.instantiate(this.squirrel)
              , n = s.getComponent("squirrel");
            n.initBearData(i);
            var a = n.comfirmBearPosition(i);
            s.parent = this.squirrel_container,
            s.position = a,
            this.squirrelNodeList.push(s)
        }
    },
    addGrassChild: function(e, t) {
        var i, n = utils.indexValue(e.x, e.y);
        (i = this.grassPool.size() > 0 ? this.grassPool.get() : cc.instantiate(this.grass)).parent = this.node,
        i.position = utils.grid2Pos(e.x, e.y),
        i.getComponent("ground").initGroundData(t),
        this.spriteList[n] = i
    },
    recycleGrassNode: function() {
        for (var e = this.node.children, t = e.length - 1; t >= 0; t--)
            "ground" == e[t].name ? this.grassPool.put(e[t]) : e[t].removeFromParent()
    },
    removeSingleGrass: function(e) {
        var t = e.pos
          , i = utils.indexValue(t.x, t.y);
        if (this.spriteList && null != this.spriteList[i]) {
            var n = this.spriteList[i]
              , a = n.getComponent("ground")
              , o = n.parent.convertToWorldSpaceAR(n.position);
            a.bombCount > 1 ? (a.bombCount--,
            a.hitGround(),
            cc.systemEvent.emit("HIT_GRASS_ANIMATION", {
                worldPos: o,
                index: 1
            })) : (cc.systemEvent.emit("HIT_GRASS_ANIMATION", {
                worldPos: o,
                index: 2
            }),
            this.grassPool.put(n),
            this.spriteList[i] = null,
            this.groundList[t.x][t.y] = 0,
            this.judgeSquirrelIsHide())
        }
    },
    judgeSquirrelIsHide: function() {
        for (var e = 0; e < this.squirrelNodeList.length; e++) {
            var t = this.squirrelNodeList[e];
            if (!t.getComponent("squirrel").judgeBearIsHide(this.groundList)) {
                var i = this.squirrel_container.convertToWorldSpaceAR(t.position);
                this.squirrelNodeList.splice(e, 1),
                t.removeFromParent(),
                cc.systemEvent.emit("HINDER_SQUIRREL_ANIMATION", {
                    statue: t,
                    worldPos: i
                })
            }
        }
    },
    releaseSquirreStatue: function() {
        if (this.squirrelNodeList && this.squirrelNodeList.length > 0)
            for (; this.squirrelNodeList.length > 0; )
                this.squirrelNodeList.pop().removeFromParent()
    },
    reset: function() {
        this.releaseSquirreStatue(),
        this.recycleGrassNode()
    },
    initFunc: function(e, t) {
        this.releaseSquirreStatue(),
        this.initGroundView(),
        this.loadMapRes(e, this.groundList),
        this.loadGrassRes(this.groundList),
        this.loadSquirrelStatue(t)
    },
    
});
