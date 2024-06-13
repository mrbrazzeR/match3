
import utils  from "../utils"
import gameData from "../gameData"

cc.Class({
    extends: cc.Component,

    properties: {
        coinsNumber: cc.Label,
    },

    onLoad: function() {
        cc.systemEvent.on("UPDATE_COINS", this.changeCoinsNumber, this)
        cc.systemEvent.on("UPDATE_COINS_EFFECT", this.changeCoinsNumberEffect, this)

    },
    init: function() {
        this.changeCoinsNumber()
    },
    changeCoinsNumber: function() {
        this.coinsNumber.string = gameData.starCount + ""
    },
    changeCoinsNumberEffect: function(number) {
        this.coinsNumber.string = number + ""
    },
   
    
});
