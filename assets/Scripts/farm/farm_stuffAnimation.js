var i = [cc.v2(-300, 280), cc.v2(-370, 250), cc.v2(320, 230)],
            s = [cc.v2(-320, -330), cc.v2(-260, 100)],
            n = [cc.v2(100, -420)];
cc.Class({
    extends: cc.Component,

    properties: {
        mow: cc.Prefab,
        flower_double: cc.Prefab,
        flower_single: cc.Prefab
    },

    start: function() {
        this.addMowToFarm(), this.addFlowerToFarm(), this.turnOnSchedule()
    },
    addMowToFarm: function() {
        for (var e = 0; e < i.length; e++) this.addStuffToFarm(this.mow, i[e])
    },
    addDoubleFlower: function() {
        for (var e = 0; e < s.length; e++) this.addStuffToFarm(this.flower_double, s[e])
    },
    addSingleFlower: function() {
        for (var e = 0; e < n.length; e++) this.addStuffToFarm(this.flower_single, n[e])
    },
    addStuffToFarm: function(e, t) {
        var i = cc.instantiate(e);
        i.parent = this.node, i.position = t
    },
    addFlowerToFarm: function() {
        this.addDoubleFlower(), this.addSingleFlower()
    },
    playAnimaiton: function(e) {
        e.getComponent(cc.Animation).play()
    },
    playStuffAnimation: function() {
        for (var e = this.node.children, t = e.length - 1; t >= 0; t--) this.playAnimaiton(e[t])
    },
    turnOnSchedule: function() {
        this.schedule(this.playStuffAnimation, 5)
    },
    onDestroy: function() {
        this.unschedule(this.playStuffAnimation)
    }
});
