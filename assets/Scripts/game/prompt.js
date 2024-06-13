
cc.Class({
    extends: cc.Component,

    properties: {
        bound: [cc.Node],
        angle: [cc.Node]
    },

    bounderControl: function(e) {
        for (var t = 0; t < e.length; t++){ 
            1 == e[t] ? this.bound[t].active = true : this.bound[t].active = false;
        }
        this.isAngleShow(this.bound)
    },
    isAngleShow: function(e) {
        e[0].active && e[2].active && (this.angle[0].active = true), e[0].active && e[3].active && (this.angle[1].active = true), e[1].active && e[2].active && (this.angle[3].active = true), e[1].active && e[3].active && (this.angle[2].active = true)
    },
    angleControl: function(e) {
        for (var t = 0; t < e.length; t++) this.angle[t].active && e[t] && (this.angle[t].active = false)
    },
    
});
