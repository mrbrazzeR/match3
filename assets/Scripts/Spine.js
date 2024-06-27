//import { Global } from "../public/Global";
cc.Class({
    extends: cc.Component,

    properties: {
        spine: sp.Skeleton
    },
    onLoad () {
        this._frameEventMap = {}
        this._loop = false
        this._times = 1
        this._playingName = ""
        this._playingNameQueue = []
        
    },
    start () {
        this.init()
    },
    init(){
        if(this.spine){
            this.spine.setCompleteListener(this.completeFunc.bind(this))
            this.spine.setStartListener(this.startFunc.bind(this))
            this.spine.setEventListener(this.frameEventFunc.bind(this))
        }
    },
    completeFunc(t) {
        if (!this._loop)
            if (this._playingNameQueue.length > 0) {
                if (t.animation.name == this._playingNameQueue[this._playingNameQueue.length - 1]) {
                    this._times--
                    if (0 == this._times){
                        return void (this._completeCb && this._completeCb(t.animation.name));
                    }
                    this.playQueue(this._playingNameQueue, this._times, this._completeCb)
                }
            } else {
                this._times--
                if (0 == this._times){
                    return void (this._completeCb && this._completeCb(t.animation.name));
                }
                this.play(this._playingName, this._times, this._completeCb)
            }
    },
    startFunc (t) {
        if( this._startCb){
            this._startCb(t.animation.name)
        }
    },
    frameEventFunc (t, e) {
        if(this._frameEventMap[e.data.name]){
            this._frameEventMap[e.data.name](e.data.name)
        }
    },
    setCompleteCb (t) {
        this._completeCb = t
    },
    setStartCb (t) {
        this._startCb = t
    },
    setFrameEventCb (t, e) {
        if(t){
            if(e){
                this._frameEventMap[t] = e
            }else{
                delete this._frameEventMap[t]
            }
        }else{
            this._frameEventMap = {}
        }
    },
    setNewSkin (spSkin) {
        this.spine.setSkin(spSkin)
    },
    play (anim, loop, callback) {
        try {
            if(loop == undefined){
                loop = 1
            }
            if(cc.isValid(this) && cc.isValid(this.node)) {
                this.spine.clearTracks()
                this.spine.setToSetupPose()
                this._playingName = anim
                this._loop = 0 == loop
                this._times = loop
                this._completeCb = callback
                this._playingNameQueue = []
                this.spine.setAnimation(0, this._playingName, this._loop)
            }
        } catch (error) {
            cc.log(error)
        }     
    }, 
    playQueue (arr, loop, callback) {
        if (void 0 === loop && (loop = 1), cc.isValid(this) && cc.isValid(this.node) && 0 != arr.length){
            this._completeCb = callback
            this.spine.clearTracks()
            this.spine.setToSetupPose()
            if(arr.length == 1){
                this.play(arr[0], loop);
            }else{
                this._loop = 0 == loop
                this._times = loop
                this._playingNameQueue = arr.concat()
                this.spine.setAnimation(0, arr[0], false);
                for (var n = 1; n < arr.length; n++){
                    this.spine.addAnimation(0, arr[n], false)
                }
            }
        }
    },
    /* loadNewSpine (t, e) {
        var _this = this;  
        Global.loadBundle("skeleton/cat/"+t, sp.SkeletonData).then(function(ske, err){
            if(ske){
                _this.spine.skeletonData = ske
                e()           
            }
        });  
    },
    loadSpine (t, e) {
        var _this = this;  
        Global.loadBundle("skeleton/cat/"+t, sp.SkeletonData).then(function(ske, err){
            if(ske){
                _this.spine.skeletonData = ske
                e()           
            }
        });           
    }, */
    clear () {
        this._loop = false
        this._times = 0
        this._playingName = ""
        this._playingNameQueue= []
        this.setCompleteCb()
        this.setFrameEventCb()
        this.spine.clearTracks()
    },
    onDestroy () {
        this.clear()
    },


});
