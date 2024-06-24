import utils  from "../../utils"
import gameData from "../../gameData"
cc.Class({
    extends: cc.Component,

    properties: {
        lbRank: cc.Label,
        lblName: cc.Label,
        lblScore: cc.Label,
        spAvarta: cc.Sprite,
        btnPlay: cc.Node,
        btnShare: cc.Node
    },
    onLoad(){

    },
    init(data){
        try {
            this.btnPlay.active = false
            this.btnShare.active = false
            this.rank = data.rank
            this.lblName.string = data.name
            this.lbRank.string = data.rank
            this.lblScore.string = data.bestLevel
            //utils.setAvatar(this.spAvarta, data.avatar);   
            if(data.idUser == gameData.idUser){
                this.btnShare.active = true
            }else{
                if (gameData.friendIds.includes(data.idUser)) {
                    this.btnPlay.active = true; 
                    this.btnPlay.getComponent(cc.Button).clickEvents[0].customEventData = data.idUser
                }
            }
                
        } catch (error) {
            cc.log(error)
        }               
    },
    share(){

    },
    playWithFriend(){
        var _this = this;
        if (!cc.director.FbManager.IS_FB_INSTANT){
            return;
        }
        cc.systemEvent.emit("LOADING_SHOW");
        FBInstant.context.createAsync(idPlayer)
        .then(function() {
            cc.systemEvent.emit("LOADDING_HIDE");
            gameData.isPlayWithFriend = true;
            gameData.isSendSingle = true;
            cc.director.gameManager.setActive(2)       
            cc.director.jumpCode = 1
            cc.director.container.startNewGame()                    
        }).catch(error => {
            cc.systemEvent.emit("LOADDING_HIDE");
            if (error.code == "SAME_CONTEXT") {
                gameData.isPlayWithFriend = true;
                gameData.isSendSingle = true;           
                cc.director.gameManager.setActive(2)       
                cc.director.jumpCode = 1
                cc.director.container.startNewGame()
                
            }
        });
    }
});
