var arrPosStar = [cc.v2(-220, -400), cc.v2(0, -400), cc.v2(220, -400)];

import gameData from "../gameData"
import psconfig from "../psconfig"
cc.Class({
    extends: cc.Component,

    properties: {
        toolItem: cc.Prefab,
        bigStar: cc.Prefab,
        btn_play: cc.Node,
        btn_blueBox: cc.Node,
        lifeNumNode: cc.Node,
        coins: cc.Node,
        daily_item_view: cc.Prefab,
        guideScreenNode: require("./guideScreenNode"),
        firework: cc.Prefab,
        toolList: [cc.Node],
        btn_lottery: cc.Node,
        btn_dailySign: cc.Node,
        gift: cc.Node,
        node_cloud: cc.Node
    },

    onLoad: function() {
        cc.systemEvent.on("TOOLOBTAIN", this.toolObtainEffect, this)
        cc.systemEvent.on("STARANIMA", this.starMoveAnimation, this),
        cc.systemEvent.on("DAILY_BOUNS_ANIMA", this.getDailyBounsAnimation, this),
        cc.systemEvent.on("SUCCESS_BUY_ANIMA", this.buySuccessAnimation, this),
        cc.systemEvent.on("LOTTERY_FINISHED", this.lotteryFinishedAnimation, this),
        cc.systemEvent.on("LOTTERY_GUIDE", this.showLotteryAnimatiaon, this),
        cc.systemEvent.on("DAILYSIGN_GUIDE", this.showDailySignAnimation, this),
        cc.systemEvent.on("GIFT_SELL_SUCCESS", this.successBuyBigGift, this),
        cc.systemEvent.on("IN_COULD_ANIMA", this.cloudFadeIn, this),
        cc.systemEvent.on("OUT_COULD_ANIMA", this.cloudFadeOut, this),
        this.itemPool = new cc.NodePool;
        this.coinsHeader = 0
        for (var e = 0; e < 5; e++) {
            var t = cc.instantiate(this.toolItem);
            this.itemPool.put(t)
        }
        this.starPool = new cc.NodePool;
        for (var i = 0; i < 5; i++) {
            var s = cc.instantiate(this.bigStar);
            this.starPool.put(s)
        }
        var n = this.btn_blueBox.parent.convertToWorldSpaceAR(this.btn_blueBox);
        this.boxPos = this.node.convertToNodeSpaceAR(n)
    },
    
    toolObtainEffect: function(e, STATUS) {   
        var t, s = e;
        if (s.pos) {
            t = this.node.convertToNodeSpaceAR(s.pos);
        }
 
        var n, a = s.type;
        n = this.itemPool.size() > 0 ? this.itemPool.get() : cc.instantiate(this.toolItem);

        if (a != 0) {
            n.parent = this.node;
            n.position = t || cc.v2(0, 0);
            n.getComponent("toolItem").changeItemTexture(a);
            if (a < 4 && a > 0) {
                this.toolItemMoveAnimation(n);
                gameData.changeGameTool("gameTool", s.number, a - 1, true);         
            } else if (a >= 4 && a < 8) {
                this.toolItemMoveAnimation(n);
                gameData.changeGameTool("playerTool", s.number, a - 4, true);
            }
        } else {
            this.addCoins(s.number, STATUS);
        } 
    },
    addCoins: function(coins, STATUS) {
        var _this = this;
        this.coinsHeader = gameData.starCount
        var per = coins % 10;
        var s = (coins - per) / 10;
        cc.systemEvent.emit("STOP_TOUCH", { number: 1 });
        var addCoinsEffect = function(i) {
            setTimeout(function() {
                if (i === 9) {
                    _this.obtainCoinsEffect(s + per);
                    if(!STATUS){
                        cc.systemEvent.emit("STOP_TOUCH", { number: 2 });
                    }                
                } else {
                    _this.obtainCoinsEffect(s);
                }
            }, 100 * i);
        };
        // Lặp lại 10 lần để thực hiện hiệu ứng thêm xu
        for (var i = 0; i < 10; i++) {
            addCoinsEffect(i);
        }
    },
    obtainCoinsEffect: function(e) {
        
        var t = this,
            s = cc.instantiate(this.toolItem),
            n = this.node.convertToNodeSpaceAR(this.coins.parent.convertToWorldSpaceAR(this.coins.position));
        s.getComponent("toolItem").changeItemTexture(0), s.parent = this.node;
        var a = Math.floor(200 * Math.random()),
            o = -500 + Math.floor(100 * Math.random()),
            c = .2 + .5 * Math.random();
        s.position = cc.v2(a, o);
        var r = cc.sequence(cc.sequence(cc.scaleTo(.1, .9), cc.scaleTo(.1, 1.1), cc.scaleTo(.1, 1)), cc.spawn(cc.rotateBy(c, 720), cc.moveTo(c, n).easing(cc.easeInOut(3)), cc.scaleTo(c, .5)), cc.callFunc(function() {
            cc.director.SoundManager.playSound("flyCoins")
        }), cc.callFunc(function() {
            s.removeFromParent()
            t.coins.runAction(cc.sequence(cc.scaleTo(0.1, 0.9), cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1), cc.callFunc(function() {
                t.coinsHeader += e
                cc.systemEvent.emit("UPDATE_COINS_EFFECT", t.coinsHeader)
            })))
        }));
        s.runAction(r)
    },
    toolItemMoveAnimation: function(e) {
        var t = this,
            i = this.btn_play.parent.convertToWorldSpaceAR(this.btn_play),
            s = this.node.convertToNodeSpaceAR(i);
        cc.director.SoundManager.playSound("flyStart");
        var n = cc.sequence(cc.moveTo(.5, s), cc.callFunc(function() {
            t.itemPool.put(e), t.btn_play.runAction(cc.sequence(cc.scaleTo(.2, .9), cc.scaleTo(.2, 1.1), cc.scaleTo(.2, 1)))
            , cc.director.SoundManager.playSound("starCollect");
            var i = cc.instantiate(t.firework);
            i.parent = t.btn_play, i.y += 40, i.getComponent(cc.ParticleSystem).resetSystem()
        }));
        e.runAction(n)
    },
    starMoveAnimation: function(e) {
        var t = this;
        var passRate = e.passRate;
        var _this = this;

        // Hàm để tạo và di chuyển các ngôi sao
        var createAndMoveStar = function(index) {
            t.scheduleOnce(function() {
                var star;
                // Lấy một ngôi sao từ pool hoặc tạo mới nếu pool rỗng
                star = this.starPool.size() > 0 ? this.starPool.get() : cc.instantiate(this.bigStar);
                star.parent = this.node;
                star.scale = 0.01;

                // Tạo hành động di chuyển và thay đổi kích thước cho ngôi sao
                var moveAction = cc.sequence(
                    cc.spawn(
                        cc.scaleTo(0.5, 1),
                        cc.rotateBy(0.5, 360),
                        cc.moveTo(0.5, arrPosStar[index])
                    ),
                    cc.sequence(
                        cc.scaleTo(0.2, 1.05),
                        cc.scaleTo(0.2, 1)
                    ).repeat(2),
                    cc.spawn(
                        cc.scaleTo(0.7, 0.2),
                        cc.rotateBy(0.7, 360),
                        cc.moveTo(0.7, this.boxPos)
                    ),
                    cc.callFunc(function() {
                        _this.starPool.put(star);
                        cc.systemEvent.emit("FINISHEDCOLLECT");
                        cc.director.SoundManager.playSound("starCollect");

                        // Kiểm tra nếu đây là ngôi sao cuối cùng
                        if (index == passRate - 1) {
                            if (gameData.bestLevel == 1 && !gameData.boxGuide) {
                                _this.guideScreenNode.showScreenGuide();
                            }
                            cc.systemEvent.emit("STOP_TOUCH", { number: 2 });
                        }
                    })
                );

                star.runAction(moveAction);
            }, 0.2 * index);
        };

        // Tạo và di chuyển các ngôi sao dựa trên passRate
        for (var c = 0; c < passRate; c++) {
            createAndMoveStar(c);
        }
    },
   
    getDailyBounsAnimation: function(bounsDay, STATUS) {
        var _this = this
        var parentBtnPlay = this.btn_play.parent.convertToWorldSpaceAR(this.btn_play)
        var pos = this.node.convertToNodeSpaceAR(parentBtnPlay)
        var daily_item = cc.instantiate(this.daily_item_view)
        daily_item.parent = this.node
        daily_item.scale = 0.1
        daily_item.getComponent("item_daily_view").initView(bounsDay.type - 1)
        cc.director.SoundManager.playSound("flyStart")
        cc.systemEvent.emit("STOP_TOUCH", { number: 1 });
        daily_item.runAction(
            cc.sequence(
                cc.scaleTo(0.5, 1).easing(cc.easeBackInOut(3)), cc.delayTime(1.5), cc.spawn(cc.scaleTo(0.5, 0.2), cc.moveTo(0.5, pos).easing(cc.easeInOut(3))),
                    cc.callFunc(function() {
                        _this.btn_play.runAction(cc.sequence(cc.scaleTo(0.2, 0.9), cc.scaleTo(.2, 1.1), cc.scaleTo(0.2, 1)))
                        cc.director.SoundManager.playSound("starCollect");
                        var firework = cc.instantiate(_this.firework);
                        firework.parent = _this.btn_play
                        firework.y += 40
                        firework.getComponent(cc.ParticleSystem).resetSystem()
                        daily_item.removeFromParent()   
                        if(STATUS){
                            if(bounsDay.type == 3){
                                cc.systemEvent.emit("STOP_TOUCH", { number: 2 });
                            }
                        }else{
                            cc.systemEvent.emit("STOP_TOUCH", { number: 2 });
                        }       
                })
            )
        )
    },
    buySuccessAnimation: function(e) {
        var t = cc.instantiate(this.daily_item_view);
        t.getComponent("item_daily_view").initView(e.type + 3), t.parent = this.node;
        var i = this.toolList[e.type],
            s = i.parent.convertToWorldSpaceAR(i.position),
            n = this.node.convertToNodeSpaceAR(s);
        t.scale = .1, cc.director.SoundManager.playSound("flyStart");
        var a = cc.sequence(cc.scaleTo(.5, 1).easing(cc.easeBackInOut(3)), cc.delayTime(1.5), cc.spawn(cc.scaleTo(.5, .2), cc.moveTo(.5, n).easing(cc.easeInOut(3))), cc.callFunc(function() {
            cc.director.SoundManager.playSound("starCollect"), 
            t.removeFromParent(), cc.systemEvent.emit("UPDATE_TOOLLIST_SHOP", {
                type: e.type
            })
        }));
        t.runAction(a)
    },
    bigGiftPlayerToolAnima: function(e, t, i) {
        var s = this.toolList[t - 4],
            n = s.parent.convertToWorldSpaceAR(s.position),
            a = this.node.convertToNodeSpaceAR(n);
        cc.director.SoundManager.playSound("flyStart");
        var o = cc.sequence(cc.moveTo(.8, a).easing(cc.easeInOut(3)), cc.callFunc(function() {
            cc.director.SoundManager.playSound("starCollect"), 
            e.removeFromParent(), cc.systemEvent.emit("UPDATE_TOOLLIST_SHOP", {
                type: t - 4,
                tag: 2,
                isLast: i
            })
        }));
        e.runAction(o)
    },
    lotteryFinishedAnimation: function(e) {
        var _this = this,
            s = e,
            type = s.type;
        if (type < 4 && type > 0) {
            gameData.changeGameTool("gameTool", s.number, type - 1, true);
        }else {
            if (!(type >= 4)) {
                this.addCoins(s.number);
                gameData.starCount += s.number
                gameData.setStarGameData()
                if(cc.director.FbManager.IS_FB_INSTANT){
                    cc.director.FbManager.updateDataFB({
                        lotteryEndTime: gameData.lotteryEndTime,
                        starGameData: JSON.stringify(gameData.starGameData)                   
                    })
                }else{
                    cc.log("storeGameData & lotteryEndTime")
                    cc.sys.localStorage.setItem("lotteryEndTime", gameData.lotteryEndTime)
                    cc.sys.localStorage.setItem("starGameData", JSON.stringify(gameData.starGameData))
                }
                return
            }
            gameData.changeGameTool("playerTool", s.number, type - 4, true)
        }
        gameData.setStarGameData()
        if(cc.director.FbManager.IS_FB_INSTANT){
            cc.director.FbManager.updateDataFB({
                lotteryEndTime: gameData.lotteryEndTime,
                starGameData: JSON.stringify(gameData.starGameData)                   
            })
        }else{
            cc.log("storeGameData & lotteryEndTime")
            cc.sys.localStorage.setItem("lotteryEndTime", gameData.lotteryEndTime)
            cc.sys.localStorage.setItem("starGameData", JSON.stringify(gameData.starGameData))
        }
        var daily_item = cc.instantiate(this.daily_item_view);
        daily_item.getComponent("item_daily_view").initView(e.type - 1)
        daily_item.parent = this.node;
        daily_item.scale = 0.1
        var o = this.btn_play.parent.convertToWorldSpaceAR(this.btn_play)
        var pos = this.node.convertToNodeSpaceAR(o);
        
        cc.director.SoundManager.playSound("flyStart");

        var action = cc.sequence(cc.scaleTo(.5, 1).easing(cc.easeBackInOut(3)), cc.delayTime(1.5), cc.spawn(cc.scaleTo(.5, .2), cc.moveTo(.5, pos).easing(cc.easeInOut(3))), cc.callFunc(function() {
            cc.director.SoundManager.playSound("starCollect") 
            daily_item.removeFromParent()
            _this.btn_play.runAction(cc.sequence(cc.scaleTo(.2, .9), cc.scaleTo(.2, 1.1), cc.scaleTo(.2, 1)))
            cc.director.SoundManager.playSound("starCollect");
            var firework = cc.instantiate(_this.firework);
            firework.parent = _this.btn_play
            firework.y += 40
            firework.getComponent(cc.ParticleSystem).resetSystem()
            cc.systemEvent.emit("STOP_TOUCH", {
                number: 2
            })
        }));
        daily_item.runAction(action)
    },
    showLotteryAnimatiaon: function() {
        var e = this,
            t = cc.instantiate(this.daily_item_view);
        cc.systemEvent.emit("STOP_TOUCH", {
            number: 1
        }), t.getComponent("item_daily_view").initView(7), t.parent = this.node;
        var i = this.btn_lottery,
            s = i.parent.convertToWorldSpaceAR(i.position),
            n = this.node.convertToNodeSpaceAR(s);
        t.scale = .1, cc.director.SoundManager.playSound("unlock");
        var a = cc.sequence(cc.scaleTo(.5, 1).easing(cc.easeBackInOut(3)), cc.delayTime(1.5), cc.moveTo(.5, n).easing(cc.easeInOut(3)), cc.callFunc(function() {
            cc.director.SoundManager.playSound("flyStart"), 
            t.removeFromParent()
            e.btn_lottery.active = true
            gameData.lotteryGuide01 = "yes"
            if(cc.director.FbManager.IS_FB_INSTANT){
                cc.director.FbManager.updateDataFB({
                    lotteryGuide01: gameData.lotteryGuide01             
                })
            }else{
                cc.sys.localStorage.setItem("lotteryGuide01", "yes")
                cc.log("lotteryGuide01")
            }
            cc.systemEvent.emit("STOP_TOUCH", {
                number: 2
            }), cc.systemEvent.emit("START_FINGER_GUIDE", {
                targetNode: e.btn_lottery,
                worldPos: s
            })
        }));
        t.runAction(a)
    },
    showDailySignAnimation: function() {
        var e = this,
            t = cc.instantiate(this.daily_item_view);
        cc.systemEvent.emit("STOP_TOUCH", {
            number: 1
        }), t.getComponent("item_daily_view").initView(8), t.parent = this.node;
        var i = this.btn_dailySign,
            s = i.parent.convertToWorldSpaceAR(i.position),
            n = this.node.convertToNodeSpaceAR(s);
        t.scale = .1
        , cc.director.SoundManager.playSound("unlock");
        var a = cc.sequence(cc.scaleTo(.5, 1).easing(cc.easeBackInOut(3)), cc.delayTime(1.5), cc.moveTo(.5, n).easing(cc.easeInOut(3)), cc.callFunc(function() {
            cc.director.SoundManager.playSound("flyStart"), 
            t.removeFromParent(), e.btn_dailySign.active = true
            cc.systemEvent.emit("STOP_TOUCH", {
                number: 2
            }), cc.systemEvent.emit("START_FINGER_GUIDE", {
                targetNode: e.btn_dailySign,
                worldPos: s
            })
        }));
        t.runAction(a)
    },
    successBuyBigGift: function(e) {
        var t = this;
        cc.systemEvent.emit("STOP_TOUCH", {
            number: 1
        }), this.giftFadeIn(function() {
            var n = e.type;
            n = n || 0;
            var a, c, r, d = psconfig.giftNumber[n];
            a = d.coins, 
            c = d.gameTool, 
            r = d.playerTool, 
            a && a > 0 && cc.systemEvent.emit("TOOLOBTAIN", {
                type: 0,
                number: a
            })
    
            for (var l = Object.getOwnPropertyNames(c), h = 0; h < l.length; h++) {
                var p = c[l[h]];
                gameData.changeGameTool("gameTool", p, h, true)
                cc.log("storeGameData changeGameTool")
                gameData.storeGameData()
                
            }
            for (var m = Object.getOwnPropertyNames(r), u = 0; u < m.length; u++) {
                var g = r[m[u]];
                gameData.changeGameTool("playerTool", g, u, true)
                cc.log("storeGameData changeGameTool")
                gameData.storeGameData()
            }
            for (var f = [1, 2, 3, 4, 5, 6, 7], v = function(e) {
                    t.scheduleOnce(function() {
                        var i;
                        (i = this.itemPool.size() > 0 ? this.itemPool.get() : cc.instantiate(this.toolItem)).getComponent("toolItem").changeItemTexture(f[e]), i.parent = this.node, i.position = cc.v2(0, 0), e < 3 ? this.toolItemMoveAnimation(i) : e == f.length - 1 ? (this.bigGiftPlayerToolAnima(i, f[e], true), t.gift.active = false, 
                        cc.systemEvent.emit("STOP_TOUCH", {
                            number: 2
                        })) : this.bigGiftPlayerToolAnima(i, f[e])
                    }, .2 * e)
                }, L = 0; L < f.length; L++) v(L)
        })
    },
    giftFadeIn: function(e) {
        this.gift.scale = .1, this.gift.active = true, this.gift.getChildByName("light").runAction(cc.rotateBy(5, 360).repeatForever()), this.gift.runAction(cc.sequence(cc.scaleTo(.5, 1).easing(cc.easeBackOut(3)), cc.callFunc(e)))
    },
    cloudFadeOut: function() {
        this.node_cloud.active = true;
        var e = this.node_cloud.getChildByName("cloudLeft"),
            t = this.node_cloud.getChildByName("cloudRight");
        e.position = cc.v2(-400, 0), t.position = cc.v2(400, 0);
        var i = cc.sequence(cc.fadeIn(.1), cc.spawn(cc.fadeOut(1), cc.moveTo(1, cc.v2(-1200, 0)))).easing(cc.easeInOut(3)),
            s = cc.sequence(cc.fadeIn(.1), cc.spawn(cc.fadeOut(1), cc.moveTo(1, cc.v2(1200, 0)))).easing(cc.easeInOut(3));
        e.runAction(i), t.runAction(s), cc.director.SoundManager.playSound("farm_cloud")
    },
    cloudFadeIn: function() {
        this.node_cloud.active = true;
        var e = this.node_cloud.getChildByName("cloudLeft"),
            t = this.node_cloud.getChildByName("cloudRight");
        e.position = cc.v2(-1200, 0), t.position = cc.v2(1200, 0);
        var i = cc.sequence(cc.fadeOut(.1), cc.spawn(cc.fadeIn(1), cc.moveTo(1, cc.v2(-400, 0)))).easing(cc.easeInOut(3)),
            s = cc.sequence(cc.fadeOut(.1), cc.spawn(cc.fadeIn(1), cc.moveTo(1, cc.v2(400, 0)))).easing(cc.easeInOut(3));
        e.runAction(i), t.runAction(s)
        , cc.director.SoundManager.playSound("farm_cloud")
    }
});
