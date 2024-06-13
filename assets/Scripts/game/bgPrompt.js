
import s  from "../utils"
import i from "../psconfig"
cc.Class({
    extends: cc.Component,

    properties: {
        prompt: cc.Prefab
    },

    initBgPrompt: function(mapList) {
        this.node.children.length > 0 && this.node.removeAllChildren();
        for (var t = 0; t < i.matrixRow; t++){
            for (var n = 0; n < i.matrixCol; n++){
                if (mapList[t][n] >= 0) {
                    var a = cc.v2(t, n),
                        o = s.judgeBounder(a, mapList),
                        c = s.judgeAngle(a, mapList),
                        r = cc.instantiate(this.prompt),
                        d = s.girdToPos(t, n, .5);
                    r.position = d
                    r.getComponent("prompt").bounderControl(o)
                    r.getComponent("prompt").angleControl(c)
                    this.node.addChild(r)
                }
            }
        }
    },
    
});
