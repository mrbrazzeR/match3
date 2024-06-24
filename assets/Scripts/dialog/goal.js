import i  from "../utils"

cc.Class({
    extends: cc.Component,

    properties: {
        nodeList: [cc.Node],
        viewList: [cc.SpriteFrame],
        subList:[cc.SpriteFrame],
        hinderListView: [cc.SpriteFrame]
    },

    hideTargetNode: function() {
        for (var e = 0; e < this.nodeList.length; e++) this.nodeList[e].active = false
    },
    updateNodeTag: function(e) {
        this.tContent = e, this.hideTargetNode();
        for (var t = i.computedNodeGap(e.length, this.node, this.nodeList[0]), s = 0; s < e.length; s++) {
            var n = this.nodeList[s];
            n.position = cc.v2(t * (s + 1) + n.width * s + n.width / 2, 0), n.active = true;
            var a = n.getChildByName("icon"),
                o = e[s][0] < 20 ? e[s][0] : e[s][0] - 20;
            e[s][0] < 20 ? i.changeLocalNodeTexture(a, this.viewList, o) : 38 == e[s][0] ? i.changeLocalNodeTexture(a, this.hinderListView, 10) : 39 == e[s][0] ? i.changeLocalNodeTexture(a, this.hinderListView, 11) : 37 == e[s][0] ? i.changeLocalNodeTexture(a, this.hinderListView, 12) : i.changeLocalNodeTexture(a, this.hinderListView, o)
        }
        this.updateGoalNumber(e)
    },
    getTargetItemWorldPosition: function() {
        for (var e = [], t = 0; t < this.nodeList.length; t++) {
            var i = this.nodeList[t];
            if (i.active) {
                var s = i.parent.convertToWorldSpaceAR(i.position),
                    n = {};
                n.index = t, n.worldPos = s, n.type = this.tContent[t][0], e.push(n)
            }
        }
        return e
    },
    updateGoalNumber: function(e) {
        for (var t = 0; t < e.length; t++) {
            var i = this.nodeList[t].getChildByName("num").getComponent(cc.Label);
            e[t][1] > 0 ? (i.string = "" + e[t][1], i.node.active = true) : i.node.active = false
        }
    },

});
