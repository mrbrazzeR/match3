

cc.Class({
    extends: cc.Component,

    properties: {
        fMask: cc.Node,
        shopPrefab: cc.Prefab,
        footer: cc.Node,
        toolItemList: [cc.Node]
        // shop_android: require("./shop_android")
    },

    onLoad: function() {
        cc.director.funcView = this
        this.shop = null
    },
    ifHaveNode(pop, prefab) {
        if(!pop){
            pop = cc.instantiate(prefab)
            this.node.addChild(pop)         
        }
        pop.setSiblingIndex(-1)
        return pop 
    },
    hideAllChilden: function() {
        for (var e = this.node.children, t = 0; t < e.length; t++) e[t].active = !1
    },
    showShop: function() {
        cc.director.SoundManager.playSound("btnEffect")
        this.fMask.active = !0
        this.shop = this.ifHaveNode(this.shop, this.shopPrefab)
        this.shop.getComponent('shop').showView()
        /*  cc.sys.os == cc.sys.OS_ANDROID ? (this.hideAllChilden(), this.fMask.active = !0, this.shop_android.showView(), window.NativeManager.showInterstitialAd(2)) : (this.hideAllChilden(), this.fMask.active = !0, this.shop.showView(), window.NativeManager.showInterstitialAd(2)) */
    },
    hideShop: function() {
        cc.director.SoundManager.playSound("btnEffect")
         this.hideAllChilden(), this.shop.hideView()
    }, 
});
