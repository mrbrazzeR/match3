import utils  from "../utils"
import psconfig from "../psconfig"
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
    comfirmBearPosition: function(stone) {
        var pos;
        if (stone && stone.length > 0) {
            var s = (stone[1][0] + stone[0][0]) / 2
            var n = (stone[1][1] + stone[0][1]) / 2;
            pos = utils.grid2Pos(s, n)
        }
        if(!pos){
            return false
        }else{
            return pos
        }
    },
    comfirmBearWidthAndHeight: function(e) {
        var t = Math.abs(e[1][0] - e[0][0]) + 1
        var i = Math.abs(e[1][1] - e[0][1]) + 1;
        t - i > 0 ? (this.node.height = t * psconfig.cellSize, this.node.width = i * psconfig.cellSize, this.node.angle = -0) : (this.node.width = t * psconfig.cellSize, this.node.height = i * psconfig.cellSize, this.node.angle = -90)
    },
    judgeBearIsHide: function(e) {
        var t = this.list[0][0]
        var i = this.list[1][0]
        var s = this.list[0][1]
        var n = this.list[1][1] 
        var bool = false
        for (var o = t; o <= i; o++) {
            for (var c = s; c <= n; c++){
                if (e[o][c] >= 1) {
                    bool = true;
                    break;
                } 
                if (bool) break;
            }
        }
        return bool;
    },
    
});
