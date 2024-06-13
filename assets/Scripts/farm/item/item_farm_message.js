// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        headView: cc.Sprite,
        atlas_headView: cc.SpriteAtlas,
        friendName: cc.Label,
        level: cc.Label,
        label_time: cc.Label
    },
    initItemDeatail: function(e) {
        this.updateFriendName(e.name), this.updateLevel(e.level), this.updateTime(e.time)
    },
    updateHeadView: function(e) {
       
    },
    updateFriendName: function(e) {
        this.friendName.string = new String(e)
    },
    updateLevel: function(e) {
        this.level.string = new String(e)
    },
    updateTime: function(e) {
        var t = new Date(1e3 * e),
            i = t.getHours() + ":" + t.getMinutes();
        this.label_time.string = i
    },
    
    // update (dt) {},
});
