
import utils  from "../utils"
import psconfig from "../psconfig"
import gameData from "../gameData"
cc.Class({
    extends: cc.Component,

    properties: {
    },

    setRocketPosition: function(e, t, i) {
        this.grid = e, 
        this.birthPosition = utils.grid2Pos(e.x, e.y), 
        this.direction = t, 
        this.tempLength = 0, 
        this.tempList = i, 
        this.updateIndex = 0, 
        this.copyList = [], 
        this.isFinish = false
        this.arrCustom = []
    },
    judgeNodePosition: function() {
        var length = this.tempList.length
        for (var i = this.updateIndex; i < length; i++) {
            var tempList = this.tempList[i]; 
            var grid = tempList.grid        
            if (this.direction == psconfig.direction.UP) {
                if (!(this.node.y >= tempList.position.y)) break;
                cc.director.container.handleSingleGrid(grid)
                this.updateIndex = i + 1;
                //
                var indexValue = utils.indexValue(grid.x, grid.y);
                if (null != gameData.starSprite[indexValue]) {
                    var block = this.getNodeBygGrid(grid);
                    if(block._stoneType == 40){             
                        //if(!arr.includes(grid)){
                            this.arrCustom.push(grid)
                        //}
                    }
                }
            } else if (this.direction == psconfig.direction.DOWN) {
                if (!(this.node.y <= tempList.position.y)) break;
                cc.director.container.handleSingleGrid(grid)
                this.updateIndex = i + 1;
                //
                var indexValue = utils.indexValue(grid.x, grid.y);
                if (null != gameData.starSprite[indexValue]) {
                    var block = this.getNodeBygGrid(grid);
                    if(block._stoneType == 40){
                        //if(!arr.includes(grid)){
                            this.arrCustom.push(grid)
                        //}
                    }
                }
            } else if (this.direction == psconfig.direction.LEFT) {
                if (!(this.node.x <= tempList.position.x)) break;
                cc.director.container.handleSingleGrid(grid)
                this.updateIndex = i + 1;
                //
                var indexValue = utils.indexValue(grid.x, grid.y);
                if (null != gameData.starSprite[indexValue]) {
                    var block = this.getNodeBygGrid(grid);
                    if(block._stoneType == 40){
                        //if(!arr.includes(grid)){
                            this.arrCustom.push(grid)
                        //}
                    }
                }
            } else if (this.direction == psconfig.direction.RIGHT) {
                if (!(this.node.x >= tempList.position.x)) break;
                cc.director.container.handleSingleGrid(grid)
                this.updateIndex = i + 1;
                //
                var indexValue = utils.indexValue(grid.x, grid.y);
                if (null != gameData.starSprite[indexValue]) {
                    var block = this.getNodeBygGrid(grid);
                    if(block._stoneType == 40){
                        //if(!arr.includes(grid)){
                            this.arrCustom.push(grid)
                        //}
                    }
                }
            }
        }
        
        if(this.updateIndex >= length){
            if(this.arrCustom.length > 0){
                var obj = cc.director.container.getCustomNodeList(this.arrCustom)
                cc.director.container.setRatioCustom(obj)
                this.arrCustom = []
            }
            this.isFinish = true
        }
    },
    getNodeBygGrid: function(e) {
        var t = utils.indexValue(e.x, e.y)
        var n = gameData.starSprite[t];
        return !!n && n.getComponent("block")
    },
    update: function() {
        if(!this.isFinish){
            this.judgeNodePosition()
        }
    }
});
