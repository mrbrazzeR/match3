import utils  from "../utils"
import gameData from "../gameData"
cc.Class({
    extends: cc.Component,

    properties: {
        content: cc.Node,
        srcView: cc.ScrollView,
        itemRank: cc.Prefab
    },
    onLoad () {

    },

    start () {

    },
    showView: function() {
        this.node.active = !0
        utils.showPromptWithScale(this.node)
        // if(gameData.listRank){
        //     this.render()
        // }else{
            this.getRank()
        //}
    },
    render(){
        if(gameData.listRank && gameData.listRank.list.length > 0){
            this.srcView.scrollToTop();  
            this.srcView.content.removeAllChildren()
            for (let i = 0; i < gameData.listRank.list.length; i++) { 
                var data = gameData.listRank.list[i]
                let item = cc.instantiate(this.itemRank);
                item.parent = this.srcView.content            
                let component = item.getComponent("item_rank");
                component.init(data)     
            }
        }
    },
    hideView: function() {
        cc.director.SoundManager.playSound("btnEffect")
        cc.director.screenDialog.hideAllChild()
        this.node.active = !1
    },
    getRank(){
        var _this = this
        cc.systemEvent.emit("LOADING_SHOW");
        cc.director.ServerManager.requestData(
            'getRank',
            'POST',     
            {
                "idUser": gameData.idUser,
            }
        ).then(function(res){
            cc.director.gameLoadingSuccess = true
            if(res){
                cc.systemEvent.emit("LOADDING_HIDE");  
                gameData.listRank = res
                _this.render()
            }         
        }).catch(function(error){                              
            cc.log("err",error)     
            cc.systemEvent.emit("LOADDING_HIDE");
        });  
    },
});
