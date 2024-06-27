
import utils  from "../utils"
import psconfig from "../psconfig"
cc.Class({
    extends: cc.Component,

    properties: {
        lbBombRatio: cc.Label,
        bombRatio: -1,
        canTypeNode: cc.Node,
        bottleTypeNode: cc.Node,
        box: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },
    initData(data){ 
        this.data = data
        this.arrCan = []
        this.arrBottle = []
        this.bombRatio = data[2];
        this.lbBombRatio.string = this.bombRatio
        this.typeCustom = data[3]
        if(this.typeCustom == "custom_avarta"){
            
        }else{
            this.box.children.forEach(e => {
                e.active = false
            });
            if(this.typeCustom == "custom_bottle"){
                this.bottleTypeNode.active = true
                this.bottleTypeNode.getChildByName("layout2").children.forEach(e => {
                    this.arrBottle.push(e)
                });
                this.bottleTypeNode.getChildByName("layout1").children.forEach(e => {
                    this.arrBottle.push(e)
                });
                
            }else if(this.typeCustom == "custom_can"){
                this.canTypeNode.active = true         
                this.canTypeNode.getChildByName("layout3").children.forEach(e => {
                    this.arrCan.push(e)
                });
                this.canTypeNode.getChildByName("layout2").children.forEach(e => {
                    this.arrCan.push(e)
                });
                this.canTypeNode.getChildByName("layout1").children.forEach(e => {
                    this.arrCan.push(e)
                });
            }
        } 
        this.comfirmCustomWidthAndHeight(data)
    },
    comfirmCustomWidthAndHeight: function(e) {
        [4, 1], [5, 2]
        var row = Math.abs(e[1][0] - e[0][0]) + 1
        var col = Math.abs(e[1][1] - e[0][1]) + 1;
        if(row == 2 || col == 2){
            this.box.scale = 1
        }else{
            this.box.scale = 0.5
        }
        
    }, 
    comfirmCustomPosition(data){
        //[[[5, 6], [6, 5], 10 ,"type40"]]
        var pos;
        if (data && data.length > 0) {
            var s = (data[1][0] + data[0][0]) / 2
            var n = (data[1][1] + data[0][1]) / 2;
            pos = utils.grid2Pos(s, n)
        }
        if(!pos){
            return false
        }else{
            return pos
        }
    },
    customHit(hit) {
        cc.log("hihihihihihi", hit)
        this.lbBombRatio.string = this.bombRatio
        if(this.bombRatio > 0){      
            this.actionRotation(this.node)
            if(this.typeCustom == "custom_can"){
                this.effectCan(hit)
                
            } 
        }
    },
    effectCan(hit){//2
        var count = 0
        var length = this.arrCan.length
        var index = length
        while(length > 0){         
            count+= 1
            index -= 1
            if(count <= hit){
                var e = this.arrCan.pop()
                e.destroy()
            }else{
                if(index < 0){
                    return
                }else{
                    this.actionEff(this.arrCan[index])
                }
            }
        }
    },
    actionEff(item){
        var _this = this
        var action = cc.sequence(
            cc.sequence(
                cc.rotateBy(0.05, 10), 
                cc.rotateBy(0.05, -10)
            ).repeat(3), cc.callFunc(function() {
                item.angle = 0
            })
        );
        item.runAction(action)    
    },
    actionRotation: function() {
        var _this = this
        var action = cc.sequence(
            cc.sequence(
                cc.rotateBy(0.05, 10), 
                cc.rotateBy(0.05, -10)
            ).repeat(1), cc.callFunc(function() {
                _this.node.angle = 0
            })
        );
        this.node.runAction(action)
    },
});
