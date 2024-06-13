

cc.Class({
    extends: cc.Component,

    properties: {
        node_container: cc.Node,
        prefab_messageItem: cc.Prefab
    },
    onLoad: function() {
        this.data = [{
            country: 1,
            name: "red",
            level: 1,
            time: 1578483458
        }, {
            country: 3,
            name: "yellow",
            level: 3,
            time: 1578485458
        }, {
            country: 4,
            name: "green",
            level: 2,
            time: 1578483458
        }, {
            country: 6,
            name: "TarloySwift",
            level: 1,
            time: 1578482458
        }, {
            country: 8,
            name: "James",
            level: 4,
            time: 1578480458
        }, {
            country: 9,
            name: "KobeBryant",
            level: 2,
            time: 1578473458
        }]
    },
    initMessageContainer: function() {
        this.node_container.children.length > 0 && this.node_container.removeAllChildren();
        for (var e = 0; e < this.data.length; e++) {
            var t = cc.instantiate(this.prefab_messageItem);
            t.parent = this.node_container, t.getComponent("item_farm_message").initItemDeatail(this.data[e])
        }
    },
    getFriendHelpMessage: function() {
        var e = cc.sys.localStorage.getItem("localData");
        e ? (e = JSON.parse(e)).uid : (window.NativeManager.getUid(), console.log("localData is not exist"))
    },
    showView: function() {
        this.node.active = !0, this.fromTopToCenter(this.node), this.getFriendHelpMessage(), this.initMessageContainer()
    },
    hideView: function() {
        this.fromCenterToTop(this.node)
    },
    fromTopToCenter: function(e) {
        var t = cc.view.getDesignResolutionSize();
        e.position = cc.v2(0, (t.height + e.height) / 2);
        var i = cc.moveTo(.5, cc.v2(0, 0)).easing(cc.easeBackOut(3));
        e.runAction(i)
    },
    fromCenterToTop: function(e) {
        var t = cc.view.getDesignResolutionSize(),
            i = cc.sequence(cc.moveTo(.5, cc.v2(0, (t.height + e.height) / 2)).easing(cc.easeBackIn(3)), cc.callFunc(function() {
                e.active = !1, cc.director.farmDialog.mask.active = !1
            }));
        e.runAction(i)
    },
    
});
