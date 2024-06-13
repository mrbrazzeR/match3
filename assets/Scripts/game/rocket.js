
import s  from "../utils"
import i from "../psconfig"
cc.Class({
    extends: cc.Component,

    properties: {
    },

    setRocketPosition: function(e, t, i) {
        this.grid = e, this.birthPosition = s.grid2Pos(e.x, e.y), this.direction = t, this.tempLength = 0, this.tempList = i, this.updateIndex = 0, this.copyList = [], this.isFinish = !1
    },
    judgeNodePosition: function() {
        
        for (var e = this.tempList.length, t = this.updateIndex; t < e; t++) {
            var s = this.tempList[t];
            
            if (this.direction == i.direction.UP) {
                if (!(this.node.y >= s.position.y)) break;
                cc.director.container.handleSingleGrid(s.grid), this.updateIndex = t + 1
            } else if (this.direction == i.direction.DOWN) {
                if (!(this.node.y <= s.position.y)) break;
                cc.director.container.handleSingleGrid(s.grid), this.updateIndex = t + 1
            } else if (this.direction == i.direction.LEFT) {
                if (!(this.node.x <= s.position.x)) break;
                cc.director.container.handleSingleGrid(s.grid), this.updateIndex = t + 1
            } else if (this.direction == i.direction.RIGHT) {
                if (!(this.node.x >= s.position.x)) break;
                cc.director.container.handleSingleGrid(s.grid), this.updateIndex = t + 1
            }
        }
        this.updateIndex >= e && (this.isFinish = !0)
    },
    update: function() {
        this.isFinish || this.judgeNodePosition()
    }
});
