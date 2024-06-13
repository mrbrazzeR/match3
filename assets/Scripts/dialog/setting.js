
import utils  from "../utils"

cc.Class({
    extends: cc.Component,

    properties: {
        effectBtn: cc.Node,
        musicBtn: cc.Node,
        exitBtn: cc.Node,
        bgmViewList: [cc.SpriteFrame],
        effectViewList: [cc.SpriteFrame],
    },
    onLoad(){
        
    },
 
    showView: function() {
        this.node.active = !0
        utils.showPromptWithScale(this.node)
        var e = cc.director.gameManager.screenName
        if("game" == e){
           this.exitBtn.active = true 
        }
        if("main" == e){
            this.exitBtn.active = false 
        }

        if(cc.director.SoundManager.music_mute){
            this.musicBtn.getComponent(cc.Sprite).spriteFrame = this.bgmViewList[1]
        }else{
            this.musicBtn.getComponent(cc.Sprite).spriteFrame = this.bgmViewList[0]
        }  

        if(cc.director.SoundManager.sound_mute){
            this.effectBtn.getComponent(cc.Sprite).spriteFrame = this.effectViewList[1]
        }else{
            this.effectBtn.getComponent(cc.Sprite).spriteFrame = this.effectViewList[0]
        }  
    },
    changOnOffMusic(){     
        if(cc.director.SoundManager.music_mute){        
            cc.director.SoundManager.music_mute = false;   
            cc.director.SoundManager.set_music_mute(false)
            cc.sys.localStorage.setItem("KEY_MUSIC_IS_MUTE", false);
        }else{
            cc.director.SoundManager.music_mute = true;
            cc.director.SoundManager.set_music_mute(true)
            cc.sys.localStorage.setItem("KEY_MUSIC_IS_MUTE", true);
        }
        if(cc.director.SoundManager.music_mute){
            this.musicBtn.getComponent(cc.Sprite).spriteFrame = this.bgmViewList[1]
        }else{
            this.musicBtn.getComponent(cc.Sprite).spriteFrame = this.bgmViewList[0]
        }   
    },
    changOnOffSound(){
        if(cc.director.SoundManager.sound_mute){
            cc.director.SoundManager.sound_mute = false;     
            cc.director.SoundManager.set_sound_mute(false) 
            cc.director.SoundManager.playSound('click')
            cc.sys.localStorage.setItem("KEY_SOUND_IS_MUTE", false);
        }else{
            cc.director.SoundManager.sound_mute = true; 
            cc.director.SoundManager.set_sound_mute(true)    
            cc.sys.localStorage.setItem("KEY_SOUND_IS_MUTE", true);
        }
        if(cc.director.SoundManager.sound_mute){
            this.effectBtn.getComponent(cc.Sprite).spriteFrame = this.effectViewList[1]
        }else{
            this.effectBtn.getComponent(cc.Sprite).spriteFrame = this.effectViewList[0]
        }   

    },
    hideView: function() {
        var e = cc.director.gameManager.screenName
        if("game" == e){
            cc.director.dialogScript.mask.active = false 
        }
        if("main" == e){
            cc.director.screenDialog.mask.active = false 
        }
        this.node.active = !1
    },
    jumpToMainScreen: function() {
        var e = cc.director.gameManager.screenName
        if("game" == e){
            cc.director.dialogScript.mask.active = false 
        }
        if("main" == e){
            cc.director.screenDialog.mask.active = false 
        }
        cc.director.dialogScript.showQuitView()
    },
   
  
   
});
