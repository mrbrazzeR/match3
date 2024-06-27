import utils  from "../utils"

cc.Class({
    extends: cc.Component,

    properties: {
        nodeList: [cc.Node],
        viewList: [cc.SpriteFrame],
        subList:[cc.SpriteFrame],
        hinderListView: [cc.SpriteFrame]
    },

    hideTargetNode: function() {
        for (var e = 0; e < this.nodeList.length; e++) {
            this.nodeList[e].active = false
        }
    },
    updateNodeTag: function(e) {
        this.tContent = e
        this.hideTargetNode();
        var t = utils.computedNodeGap(e.length, this.node, this.nodeList[0])
        for (var s = 0; s < e.length; s++) {
            var n = this.nodeList[s];
            n.position = cc.v2(t * (s + 1) + n.width * s + n.width / 2, 0) 
            n.active = true;
            var a = n.getChildByName("icon")
            var o = e[s][0] < 20 ? e[s][0] : e[s][0] - 20;
            if(e[s][0] < 20){
                utils.changeLocalNodeTexture(a, this.viewList, o)
            }else if(38 == e[s][0]){
                utils.changeLocalNodeTexture(a, this.hinderListView, 10)
            }else if(39 == e[s][0]){
                utils.changeLocalNodeTexture(a, this.hinderListView, 11)
            }else if(37 == e[s][0]){
                utils.changeLocalNodeTexture(a, this.hinderListView, 12)
            }else if(40 == e[s][0]){
                utils.changeLocalNodeTexture(a, this.hinderListView, 13)    
            }else if(41 == e[s][0]){
                utils.changeLocalNodeTexture(a, this.hinderListView, 14)             
            }else if(42 == e[s][0]){
                utils.changeLocalNodeTexture(a, this.hinderListView, 16)             
            }else{
                utils.changeLocalNodeTexture(a, this.hinderListView, o)
            }
        }
        this.updateGoalNumber(e)
    },
    getTargetItemWorldPosition: function() {
        for (var e = [], t = 0; t < this.nodeList.length; t++) {
            var i = this.nodeList[t];
            if (i.active) {
                var s = i.parent.convertToWorldSpaceAR(i.position)
                var n = {};
                n.index = t
                n.worldPos = s
                n.type = this.tContent[t][0] 
                e.push(n)
            }
        }
        return e
    },
    updateGoalNumber: function(e) {
        for (var i = 0; i < e.length; i++) {
            var numLabel = this.nodeList[i].getChildByName("num").getComponent(cc.Label);
            if(e[i][1] > 0){
                numLabel.string = "" + e[i][1]
                numLabel.node.active = true
            }else{
                numLabel.node.active = false
            }
        }
    },

});
