
import i  from "../utils"

import s from "../psconfig"
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function() {
   
    },
    initBearData: function(e) {
        this.list = e
        this.comfirmBearWidthAndHeight(e)
    },
    comfirmBearPosition: function(e) {
        var t;
        if (e && e.length > 0) {
            var s = (e[1][0] + e[0][0]) / 2,
                n = (e[1][1] + e[0][1]) / 2;
            t = i.grid2Pos(s, n)
        }
        return t || !1
    },
    comfirmBearWidthAndHeight: function(e) {
        var t = Math.abs(e[1][0] - e[0][0]) + 1,
            i = Math.abs(e[1][1] - e[0][1]) + 1;
        t - i > 0 ? (this.node.height = t * s.cellSize, this.node.width = i * s.cellSize, this.node.angle = -0) : (this.node.width = t * s.cellSize, this.node.height = i * s.cellSize, this.node.angle = -90)
    },
    judgeBearIsHide: function(e) {
        for (var t = this.list[0][0], i = this.list[1][0], s = this.list[0][1], n = this.list[1][1], a = !1, o = t; o <= i; o++) {
            for (var c = s; c <= n; c++)
                if (e[o][c] >= 1) {
                    a = !0;
                    break
                } if (a) break
        }
        return a
    },
    
});
