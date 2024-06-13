
cc.Class({
    extends: cc.Component,

    properties: {
        expItem: cc.Prefab,
        cropItem: cc.Prefab,
        coinsNode: cc.Node,
        coinsItem: cc.Prefab,
        land: cc.Node
    },

    onLoad: function() {
        this.positionList = {
            targetUrl1: "Canvas/UiNode/header/levelNode",
            targetUrl2: "Canvas/UiNode/btnArea/warehouse",
            targetUrl3: "Canvas/UiNode/btnArea/plant"
        }, cc.systemEvent.on("START_TO_END", this.fromStartToTarget, this), cc.systemEvent.on("OBTAIN_CROPS", this.obtainCrops, this), cc.systemEvent.on("OBTAIN_COINS", this.obtainCoinsAnimation, this), cc.systemEvent.on("ANIMA_LAND_UNLOCK", this.landUnlockAnimation, this), cc.systemEvent.on("OBTAIN_SEED", this.unlockPlantSeedReward, this), this.expPool = new cc.NodePool, this.cropPool = new cc.NodePool
    },
    initPool: function() {
        for (var e = cc.instantiate(this.expItem), t = 0; t < 10; t++) this.expPool.put(e);
        for (var i = cc.instantiate(this.cropItem), s = 0; s < 10; s++) this.cropPool.put(i)
    },
    fromStartToTarget: function(e) {
        var t, i = this;
        t = this.expPool.size() > 0 ? this.expPool.get() : cc.instantiate(this.expItem);
        var s = e.worldPos,
            n = e.num,
            a = e.exp,
            o = cc.find(this.positionList.targetUrl1),
            c = o.parent.convertToWorldSpaceAR(o.position),
            r = this.node.convertToNodeSpaceAR(s),
            d = this.node.convertToNodeSpaceAR(c);
        t.position = r, t.parent = this.node, t.getComponent("expItem").updateExpNumber(a);
        var l = d.sub(r).mag() / 900,
            h = cc.sequence(cc.moveTo(l, d).easing(cc.easeIn(2)), cc.callFunc(function() {
                i.expPool.put(t), cc.systemEvent.emit("UPDATE_FARM_PROGRESS", {
                    num: n,
                    islevelUp: e.islevelUp
                }), cc.director.SoundManager.playSound("farm_reap_exp")
            }));
        t.stopAllActions(), t.runAction(h)
    },
    obtainCrops: function(e) {
        var t, i = this;
        t = this.cropPool.size() > 0 ? this.cropPool.get() : cc.instantiate(this.cropItem);
        var s = e.worldPos,
            n = cc.find(this.positionList.targetUrl2);
  
        var a = n.parent.convertToWorldSpaceAR(n.position),
            o = this.node.convertToNodeSpaceAR(s),
            c = this.node.convertToNodeSpaceAR(a);
        t.position = o, t.parent = this.node, t.getComponent("cropItem").updateDetail(e.data);
        var r = c.sub(o).mag() / 600,
            d = cc.sequence(cc.moveTo(.5, cc.v2(o.x, o.y + 100)), cc.delayTime(.2), cc.moveTo(r, c).easing(cc.easeIn(3)), cc.callFunc(function() {
                i.cropPool.put(t), n.runAction(cc.sequence(cc.scaleTo(.2, 1.1), cc.scaleTo(.2, .9), cc.scaleTo(.2, 1)))
                , cc.director.SoundManager.playSound("farm_reap_vagetable")
            }));
        t.stopAllActions(), t.runAction(d)
    },
    unlockPlantSeedReward: function(e) {
        var t, i = this;
        t = this.cropPool.size() > 0 ? this.cropPool.get() : cc.instantiate(this.cropItem);
        var s = e.worldPos,
            n = cc.find(this.positionList.targetUrl3),
            a = n.parent.convertToWorldSpaceAR(n.position),
            o = this.node.convertToNodeSpaceAR(s),
            c = this.node.convertToNodeSpaceAR(a);
        t.position = o, t.parent = this.node, t.getComponent("cropItem").updateDetail(e.data);
        var r = c.sub(o).mag() / 600,
            d = cc.sequence(cc.moveTo(r, c).easing(cc.easeIn(3)), cc.callFunc(function() {
                i.cropPool.put(t), cc.systemEvent.emit("UPDATE_SEED", {
                    data: {
                        mode: 1,
                        type: e.data.type,
                        number: e.data.number
                    }
                }), n.runAction(cc.sequence(cc.scaleTo(.2, 1.1), cc.scaleTo(.2, .9), cc.scaleTo(.2, 1)))
                , cc.director.SoundManager.playSound("farm_reap_vagetable")
            }));
        t.stopAllActions(), t.runAction(d)
    },
    obtainCoinsAnimation: function(e) {
        console.log(e, "farm animaLayer");
        var t = cc.instantiate(this.coinsItem);
        t.getComponent(cc.Label).string = "." + e.coin;
        var i = this.coinsNode.parent.convertToWorldSpaceAR(this.coinsNode.position),
            s = this.node.convertToNodeSpaceAR(i),
            n = cc.sequence(cc.moveTo(1, s).easing(cc.easeIn(3)), cc.callFunc(function() {
                cc.systemEvent.emit("ADD_COINS", e.coin), t.removeFromParent()
            }));
        t.parent = this.node, t.runAction(n)
    },
    landUnlockAnimation: function(e) {
        var t = this.node.convertToNodeSpaceAR(e.worldPos),
            i = cc.director.FarmManager.landContainer.children[e.index],
            s = cc.instantiate(this.land);
        s.parent = this.node, s.active = !0;
        var n = cc.sequence(cc.spawn(cc.moveTo(.5, t), cc.scaleTo(.5, .5)), cc.callFunc(function() {
            s.removeFromParent(), i.getComponent("groundLand").displayLandStatue(3, !1)
        }));
        s.runAction(n)
    },
    
});
