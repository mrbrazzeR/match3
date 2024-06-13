
cc.Class({
    extends: cc.Component,

    properties: {
        label_expNumber: cc.Label
    },
    updateExpNumber: function(e) {
        this.label_expNumber.string = new String(e), this.label_expNumber.node.getComponent(cc.Widget).left = 20
    },
    
});
