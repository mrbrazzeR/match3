
cc.Class({
    extends: cc.Component,

    properties: {
        bound: [cc.Node],
        angle: [cc.Node],
        lb: cc.Label
    },
    onLoad(){
      
    },
    bounderControl: function(arr) {   
        for (var i = 0; i < arr.length; i++){ 
            if(1 == arr[i]){
                this.bound[i].active = true              
            }else{
                this.bound[i].active = false
            }
        }
        this.isAngleShow(this.bound)
    },
    isAngleShow: function(bound) {
         //angle => left_top, right_top, right_bottom, left_bottom
         //Boder => arr[top,bottom,left,right
        if(bound[0].active && bound[2].active){
            this.angle[0].active = true
        }
        if(bound[0].active && bound[3].active){
            this.angle[1].active = true
        }
        if(bound[1].active && bound[3].active){
            this.angle[2].active = true
        }
        if(bound[1].active && bound[2].active){
            this.angle[3].active = true
        }
    },
    angleControl: function(arr) {
        //cc.log(arr)
        for (var i = 0; i < arr.length; i++) {
            if(this.angle[i].active && arr[i]){
                this.angle[i].active = false
            }
        }
    },
    
});
