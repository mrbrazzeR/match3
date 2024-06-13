
cc.Class({
    extends: cc.Component,

    properties: {
        texture: cc.Sprite,
        viewList: [cc.SpriteFrame],
        bombCount: -1
    },
    initGroundData: function(e) {
        this.bombCount = e, this.texture.spriteFrame = this.viewList[this.bombCount - 1], this.changeTexture(this.texture, this.bombCount - 1, this.viewList)
    },
    hitGround: function() {
        this.bombCount > 0 && this.changeTexture(this.texture, this.bombCount - 1, this.viewList)
    },
    changeTexture: function(e, t, i) {
        e && (e instanceof cc.Sprite && (e.spriteFrame = i[t]), e instanceof cc.Node && (e.getComponent(cc.Sprite).spriteFrame = i[t]))
    },
    
});
