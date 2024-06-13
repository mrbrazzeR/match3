
cc.Class({
    extends: cc.Component,
    properties: {
        viewList: [cc.SpriteFrame]
    },
    changeItemTexture: function(e) {
        this.node.getComponent(cc.Sprite).spriteFrame = this.viewList[e]
    },
    
});
