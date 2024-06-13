
cc.Class({
    extends: cc.Component,

    properties: {
        node_worldContainer: cc.Node,
        node_teamContainer: cc.Node,
        myRankArea: cc.Node,
        item_rank_farm: cc.Prefab,
        node_worldRank: cc.Node,
        node_teamRank: cc.Node,
        btn_world: cc.Node,
        btn_team: cc.Node,
        btn_world_viewList: [cc.SpriteFrame],
        btn_team_viewList: [cc.SpriteFrame]
    },

    addChildToContainer: function(e, t) {
        for (var i = 0; i < e.length; i++) {
            var s = void 0;
            (s = this.itemPool && this.itemPool.size() > 0 ? this.itemPool.get() : cc.instantiate(this.item_rank_farm)).parent = t, e[i].index = i, s.getComponent("item_farm_rank").initItemDetail(e[i])
        }
    },
    initWorldLeaderboard: function() {
        var e = this.worldList;
        this.addChildToContainer(e, this.node_worldContainer)
    },
    initTeamLeaderboard: function() {
        var e = this.teamList;
        this.addChildToContainer(e, this.node_teamContainer)
    },
    addChildToMyRank: function() {
        (this.itemPool && this.itemPool.size() > 0 ? this.itemPool.get() : cc.instantiate(this.item_rank_farm)).parent = this.myRankArea
    },
    showWorldRank: function() {
        this.node_worldRank.active = !0, this.node_teamRank.active = !1, this.btn_world.getComponent(cc.Sprite).spriteFrame = this.btn_world_viewList[0], this.btn_team.getComponent(cc.Sprite).spriteFrame = this.btn_team_viewList[1]
        , cc.director.SoundManager.playSound("farm_btn")
    },
    showTeamRank: function() {
        this.node_worldRank.active = !1, this.node_teamRank.active = !0, this.btn_world.getComponent(cc.Sprite).spriteFrame = this.btn_world_viewList[1], this.btn_team.getComponent(cc.Sprite).spriteFrame = this.btn_team_viewList[0]
        , cc.director.SoundManager.playSound("farm_btn")
    },
    recycleRankItem: function(e) {
        var t = e.children;
        if (this.itemPool || (this.itemPool = new cc.NodePool("item_rank")), t.length > 0)
            for (var i = t.length - 1; i >= 0; i--) {
                var s = t[i];
                "item_rank" == s.name ? this.itemPool.put(s) : s.removeFromParent()
            }
    },
    hideView: function() {
        this.node.active = !1, this.recycleRankItem(this.node_worldContainer), this.recycleRankItem(this.node_teamContainer), cc.systemEvent.emit("HIDE_CACHE_ANIMA")
    },
    showView: function() {
        this.node.active = !0, this.showPromptWithScale(this.node), this.getRankData(), this.scheduleOnce(function() {
            cc.systemEvent.emit("HIDE_CACHE_ANIMA"), this.initWorldLeaderboard(), this.initTeamLeaderboard()
        }, 3), this.showWorldRank()
    },
    showPromptWithScale: function(e) {
        e.scale = .2;
        var t = cc.sequence(cc.scaleTo(.3, 1).easing(cc.easeBackOut(3)), cc.callFunc(function() {
            cc.systemEvent.emit("SHOW_CACHE_ANIMA")
        }));
        e.runAction(t)
    },
    getRankData: function() {
        var e = cc.sys.localStorage.getItem("localData");
        e ? "" == (e = JSON.parse(e)).uid ? window.NativeManager.getUid() : e.uid : (window.NativeManager.getUid(), console.log("localData is not exist"))
    }
});
