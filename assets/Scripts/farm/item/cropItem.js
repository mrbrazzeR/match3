
cc.Class({
    extends: cc.Component,

    properties: {
        sprite_crops_view: cc.Sprite,
        label_crops_obtain: cc.Label,
        list_cropsView: [cc.SpriteFrame]
    },
    updateDetail: function(e) {
        this.sprite_crops_view.spriteFrame = this.list_cropsView[e.type], this.label_crops_obtain.string = "." + e.number
    },
    
});
