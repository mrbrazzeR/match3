
import utils from "../utils"
import psconfig from "../psconfig"
import gameData from "../gameData"
cc.Class({
    extends: cc.Component,

    properties: {
        prompt: cc.Prefab
    },
    onLoad(){
        this.arrPrompt = new Array
        for (var i = 0; i < psconfig.matrixRow; i++) {
            this.arrPrompt[i] = new Array;
            for (var j = 0; j < psconfig.matrixCol; j++){
                this.arrPrompt[i].push(0)
            }
        }
       
     
    },
    initBgPrompt: function(mapList) {
        if(this.node.children.length > 0){
            this.node.removeAllChildren()         
        }
        for (var i = 0; i < psconfig.matrixRow; i++) {
            for (var j = 0; j < psconfig.matrixCol; j++){
                this.arrPrompt[i][j] = 0
            }
        }
        for (var i = 0; i < psconfig.matrixRow; i++){
            for (var j = 0; j < psconfig.matrixCol; j++){
                if (mapList[i][j] >= 0) {                 
                    var pos = cc.v2(i, j)
                    var judgeBounder = utils.judgeBounder(pos, mapList)
                    var judgeAngle = utils.judgeAngle(pos, mapList)
                    
                    var prompt = cc.instantiate(this.prompt)
                    var posPrompt = utils.girdToPos(i, j, 0.5);
                    prompt.position = posPrompt
                    var component = prompt.getComponent("prompt")
                    component.angle.forEach(e => {
                        e.active = false
                    });
                    component.bounderControl(judgeBounder)
                    component.angleControl(judgeAngle)
                    var c = utils.indexValue(i, j)
                    var r = gameData.starSprite[c].getComponent("block").bombRatio;
                    component.lb.string =  gameData.starMatrix[i][j]   +"-"+ i+":"+j 
                    this.node.addChild(prompt)
                    this.arrPrompt[i][j] = component
                }
            }
        }
        //top bottom left right

        for (var i = 0; i < psconfig.matrixRow; i++){
            for (var j = 0; j < psconfig.matrixCol; j++){
                var promp = this.arrPrompt[i][j]                   
                if(promp != 0){
                    if(promp.bound[0].active){//top
                        //top-left//top-right
                        if(i+1 < psconfig.matrixRow && j-1 >= 0 && j+1 < psconfig.matrixCol){
                            if(this.arrPrompt[i+1][j-1] != 0 && this.arrPrompt[i+1][j+1] != 0){
                                if(this.arrPrompt[i+1][j-1].bound[3].active && this.arrPrompt[i+1][j+1].bound[2].active){
                                    promp.bound[0].width = 70
                                }
                            }
                        }
                    }  
                    if(promp.bound[1].active){//bottom
                        //bottom-left //bottom-right                 
                        if(i-1 >=0 && j-1 >= 0 && j+1 < psconfig.matrixCol){
                            if(this.arrPrompt[i-1][j-1] != 0 && this.arrPrompt[i-1][j+1] != 0){
                                if(this.arrPrompt[i-1][j-1].bound[3].active && this.arrPrompt[i-1][j+1].bound[2].active){
                                    promp.bound[1].width = 70
                                }
                            }
                        }
                    }
                    ///
                    if(promp.bound[2].active){//left
                        //left-up
                        if(i+1 < psconfig.matrixRow && j-1 >= 0){ 
                            if(this.arrPrompt[i+1][j-1] != 0){
                                if(this.arrPrompt[i+1][j-1].bound[1].active){
                                    promp.bound[2].width = 70
                                }
                            }
                        }
                        //left-down
                        if(i-1 >=0 && j-1 >= 0){ 
                            if(this.arrPrompt[i-1][j-1] != 0){
                                if(this.arrPrompt[i-1][j-1].bound[0].active){
                                    promp.bound[2].width = 70
                                }
                            }
                        }
                    }
                    if(promp.bound[3].active){//right
                        //right-down
                        if(i-1 >= 0 && j+1 < psconfig.matrixCol){
                            if(this.arrPrompt[i-1][j+1] != 0){
                                if(this.arrPrompt[i-1][j+1].bound[0].active){
                                    promp.bound[3].width = 70
                                }
                            }
                        }
                        //right-up
                        if(i+1 < psconfig.matrixRow && j+1 < psconfig.matrixCol){
                            if(this.arrPrompt[i+1][j+1] != 0){
                                if(this.arrPrompt[i+1][j+1].bound[1].active){
                                    promp.bound[3].width = 70
                                }
                            }
                        }
                    }
                } 
            }
        }  
    },
    
});
