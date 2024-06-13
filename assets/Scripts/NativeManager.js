window.NativeManager = {
    splashBegin: function() {
        try {
            cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "splashBegin", "()V") : cc.sys.os == cc.sys.OS_IOS && jsb.reflection.callStaticMethod("NativeBridge", "splashBegin")
        } catch (e) {}
    },
    splashEnd: function() {
        try {
            cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "splashEnd", "()V") : cc.sys.os == cc.sys.OS_IOS && jsb.reflection.callStaticMethod("NativeBridge", "splashEnd")
        } catch (e) {}
    },
    getUid: function() {
        try {
            if (cc.sys.os == cc.sys.OS_ANDROID)
                return jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getOpenUDID", "()Ljava/lang/String;") || "";
            if (cc.sys.os == cc.sys.OS_IOS)
                return jsb.reflection.callStaticMethod("NativeBridge", "getOpenUDID") || ""
        } catch (e) {}
        return ""
    },
    getCountryCode: function() {
        try {
            if (cc.sys.os == cc.sys.OS_ANDROID)
                return jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getCountryCode", "()Ljava/lang/String;") || "ZZ";
            if (cc.sys.os == cc.sys.OS_IOS)
                return jsb.reflection.callStaticMethod("NativeBridge", "getCountryCode") || "ZZ"
        } catch (e) {}
        return "ZZ"
    },
    showGift: function() {
        try {
            cc.sys.os == cc.sys.OS_ANDROID && jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "showGift", "()V")
        } catch (e) {}
    },
    showBannerAd: function(e) {
        try {
            cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "showBannerAd", "(Z)V", !!e) : cc.sys.os == cc.sys.OS_IOS && jsb.reflection.callStaticMethod("NativeBridge", "showBannerAd:", !!e)
        } catch (t) {}
    },
    showInterstitialAd: function(e) {
        try {
            cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "showAd", "(I)V", e) : cc.sys.os == cc.sys.OS_IOS && jsb.reflection.callStaticMethod("NativeBridge", "showAd:", e)
        } catch (t) {}
    },
    showRate: function() {
        try {
            cc.sys.os == cc.sys.OS_ANDROID && jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "showRate", "()V")
        } catch (e) {}
    },
    hasRewardVideo: function() {
        try {
            if (cc.sys.os == cc.sys.OS_ANDROID)
                return !!jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "hasRewardVideo", "()Z");
            if (cc.sys.os == cc.sys.OS_IOS)
                return jsb.reflection.callStaticMethod("NativeBridge", "hasRewardVideo")
        } catch (e) {
            return !1
        }
    },
    showRewardVideo: function(e) {
        try {
            cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "showRewardVideo", "()V") : cc.sys.os == cc.sys.OS_IOS && jsb.reflection.callStaticMethod("NativeBridge", "showRewardVideo"),
            this.rewardVideoCallback = e
        } catch (t) {}
    },
    rewardVideoBack: function(e) {
        this.rewardVideoCallback && this.rewardVideoCallback(1 == e)
    },
    goShare: function(e) {
        try {
            cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "goShare", "()V") : cc.sys.os == cc.sys.OS_IOS && jsb.reflection.callStaticMethod("NativeBridge", "goShare"),
            this.shareCallback = e
        } catch (t) {}
    },
    shareBack: function(e) {
        this.shareCallback && this.shareCallback(1 == e)
    },
    reportLifeChanged: function(e) {
        try {
            e >= 0 && (cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "reportLifeChanged", "(I)V", e) : cc.sys.os == cc.sys.OS_IOS && jsb.reflection.callStaticMethod("NativeBridge", "reportLifeChanged:", e))
        } catch (t) {}
    },
    reportReview: function(e) {
        try {
            e >= 0 && (cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "reportReview", "(I)V", e) : cc.sys.os == cc.sys.OS_IOS && jsb.reflection.callStaticMethod("NativeBridge", "reportReview:", e))
        } catch (t) {}
    },
    reportLevelEvent: function(e) {
        try {
            e >= 0 && (cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "reportLevelEvent", "(I)V", e) : cc.sys.os == cc.sys.OS_IOS && jsb.reflection.callStaticMethod("NativeBridge", "reportLevelEvent:", e))
        } catch (t) {}
    },
    hasPhoneHair: function() {
        try {
            if (cc.sys.os == cc.sys.OS_ANDROID)
                return jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "hasPhoneHair", "()Z");
            if (cc.sys.os == cc.sys.OS_IOS)
                return jsb.reflection.callStaticMethod("NativeBridge", "hasPhoneHair")
        } catch (e) {}
        return !1
    },
    tjReport: function(e, t, i) {
        try {
            e >= 0 && (cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "tjReport", "(III)V", e, t, i) : cc.sys.os == cc.sys.OS_IOS && jsb.reflection.callStaticMethod("NativeBridge", "tjReport:step:isProp", e, t, i))
        } catch (s) {}
    },
    goForum: function() {
        try {
            cc.sys.os == cc.sys.OS_ANDROID ? jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "goForum", "()V") : cc.sys.os == cc.sys.OS_IOS && jsb.reflection.callStaticMethod("NativeBridge", "goForum"),
            this.shareCallback = callback
        } catch (e) {}
    },
    purchaseGoods: function(e, t) {
        try {
            cc.sys.os == cc.sys.OS_ANDROID && jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "purchaseGoods", "(I)V", e),
            this.purchaseCallback = t
        } catch (i) {}
    },
    purchaseBack: function(e) {
        this.purchaseCallback && this.purchaseCallback(e)
    },
    login: function(e) {
        try {
            cc.sys.os == cc.sys.OS_ANDROID && jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "login", "()V"),
            this.loginCallback = e
        } catch (t) {}
    },
    loginBack: function(e, t) {
        this.loginCallback && this.loginCallback(e, t)
    }
}
module.exports = window.NativeManager
 