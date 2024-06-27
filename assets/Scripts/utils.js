import psconfig  from "./psconfig"
import gameData  from "./gameData"
var  s = function(e) {
    return e[Math.floor(Math.random() * e.length)]
};

module.exports = { 
    resize: function() {
        var e = cc.find("Canvas").getComponent(cc.Canvas);
        this.curDR || (this.curDR = e.designResolution);
        var t = this.curDR
          , i = cc.view.getFrameSize()
          , s = i.width
          , n = i.height
          , a = s
          , o = n;
        s / n > t.width / t.height ? a = (o = t.height) * s / n : o = n / s * (a = t.width),
        e.designResolution = cc.size(a, o),
        e.node.width = a,
        e.node.height = o,
        e.node.emit("resize")
    },
    analytic: function(action, category, label) {
        if (action === void 0) {
            action = "";
        }
    
        if (category === void 0) {
            category = "";
        }
    
        if (label === void 0) {
            label = "";
        }
    
        if (typeof gtag != "undefined") {
            gtag("event", action, {
                event_category: category,
                event_label: label,
                value: 1
            });
        }
    },
    loadBundle: function(path, type){       
        return new Promise((resolve, reject) => {  
            if (!path) {
                reject('null');
            }      
            let bundleName = "bundle"
            let bundle = cc.assetManager.getBundle(bundleName)
            if (!bundle) {   
                cc.assetManager.loadBundle(bundleName, (err, bund) => {
                    if(!err){
                        const info = bund.getInfoWithPath(path, type)
                        if(info){
                            let uuid = info.uuid;        
                            let res = cc.assetManager.assets.get(uuid)
                            if(!res){
                                bund.load(path, type, (err, asset) => {
                                    if(!err){
                                        resolve(asset);                                
                                    }else{
                                        reject(err)
                                    }
                                })
                            }else{
                                resolve(res);
                            }
                        }else{
                            reject(new Error(path))           
                        }
                    }else{
                        cc.log(err)
                        reject(err)
                    }
                })    
            }else{
                const info = bundle.getInfoWithPath(path, type)
                if(info){
                    let uuid = info.uuid;
                    let res = cc.assetManager.assets.get(uuid)
                    if(!res){
                        bundle.load(path, type, (err, asset) => {
                            if(!err){          
                                resolve(asset);
                            }else{
                                cc.log(err)
                                reject(err)
                            }
                        })
                    }else{
                        resolve(res);
                    }
                }else{
                    reject(new Error(path))           
                }
            }
        })    
    },
    loadBundleDir: function(path, type){      
        return new Promise((resolve, reject) => { 
            var _this = this       
            if (!path) {
                reject('null');
            }
            
            let bundleName = "bundle"
            let bundle = cc.assetManager.getBundle(bundleName)
    
            if (!bundle) {   
                cc.assetManager.loadBundle(bundleName, (err, bund) => {
                    if(!err){         
                        bund.loadDir(path, type, (err, asset) => {
                            if(!err){
                                //cc.log("11",asset)
                                resolve(asset);
                                
                            }
                        })             
                    }else{
                        cc.log(err)
                        reject(err)
                    }
                })    
            }else{       
                bundle.loadDir(path, type, (err, asset) => {
                    if(!err){          
                        //cc.log("333",asset)
                        resolve(asset);
                    }else{
                        cc.log(err)
                        reject(err)
                    }
                })                       
            }
        })   
    },
    setAvatar: function(spriteUser, img) { 
        try {
            if(img){
                if(img.startsWith("http")){
                    this.loadImage(img).then(function(e) {    
                        let canvas = document.createElement("canvas");    
                        let ctx = canvas.getContext('2d'); 
                        canvas.width =  100;
                        canvas.height =  100;            
                        ctx.beginPath();
                        ctx.arc(50, 50, 50, 0, 2 * Math.PI); 
                        ctx.clip();
                        ctx.drawImage(e, 0, 0, 100, 100);
                        var texture = new cc.Texture2D();
                        var spriteFrame = new cc.SpriteFrame();
                        spriteFrame.setOriginalSize(cc.size(100, 100));
                        texture.initWithElement(canvas);
                        spriteFrame.setTexture(texture);
                        spriteUser.spriteFrame = spriteFrame;
                    }).catch(function(err) {
                        //cc.log(err);
                    });
                }else{
                    this.image2Sprite(img).then(function(spriteFrame) {     
                        spriteUser.spriteFrame = spriteFrame;
                    }).catch(function(err) {
                        //cc.log(err);
                    });
                }
            }else{
                spriteUser.spriteFrame = spDefault;
            }
           
        } catch (error) {
            cc.log(error);
        }
    },
    loadImage : function(src) {
        return new Promise(function(e, t) {
            if (src) {
                var r = new Image();
                r.src = src, r.crossOrigin = "anonymous", r.onload = function() {
                    
                    e(r);
                }, r.onerror = function(A) {
                    t(A);
                };
            } else t(new Error("IMAGE SRC NOT PROVIDED"));
        });
    },
    image2Sprite : function(src){
        return new Promise(function(e, t) {
            this.loadBundle(src,cc.SpriteFrame).then(function(textures,err){
                if(err){
                    t(err)
                }else{        
                    e(textures)
                }
            }); 
        })
    },
    initMatrixDataPortraitRandom: function() {
        for (var e = new Array(psconfig.matrixRow), t = 0; t < psconfig.matrixRow; t++) {
            e[t] = new Array(psconfig.matrixCol);
            for (var n = 0; n < psconfig.matrixCol; n++)
                e[t][n] = s(psconfig.totalColors)
        }
        return e
    },
    grid2Pos: function(e, t) {
        var s = 1.9 + .5 * psconfig.cellSize + (psconfig.cellSize + 1.9) * t
          , n = 1.9 + .5 * psconfig.cellSize + (psconfig.cellSize + 1.9) * e;
        return cc.v2(s, n)
    },
    pos2Grid: function(e, t) {
        var s = (t - .5 * psconfig.cellSize - 1.9) / (psconfig.cellSize + 1.9)
          , n = (e - .5 * psconfig.cellSize - 1.9) / (psconfig.cellSize + 1.9);
        return cc.v2(Math.round(s), Math.round(n))
    },
    indexValue: function(e, t) {
        return e * psconfig.matrixCol + t
    },
    resolveIndex: function(e) {
        var t = e % psconfig.matrixCol
          , s = (e - t) / psconfig.matrixCol;
        return cc.v2(s, t)
    },
    indexOfV2: function(e, t) {
        return e.some(function(e) {
            return e.x == t.x && e.y == t.y
        })
    },
    needRemoveList: function(starMatrix, pos) {
        var result = []
        var tmp = [];
        tmp.push(pos);
        var type = starMatrix[pos.x][pos.y];
        if (type <= -2){
            return result;
        }
        do {
            var o = tmp.pop();
            if (o.y - 1 >= 0 && type == starMatrix[o.x][o.y - 1]) {
                var c = cc.v2(o.x, o.y - 1);
                this.indexOfV2(result, c) || this.indexOfV2(tmp, c) || tmp.push(c)
            }
            if(o.y + 1 < psconfig.matrixCol && type == starMatrix[o.x][o.y + 1]){
                c = cc.v2(o.x, o.y + 1)
                this.indexOfV2(result, c) || this.indexOfV2(tmp, c) || tmp.push(c)
            }
            if(o.x - 1 >= 0 && type == starMatrix[o.x - 1][o.y]){
                c = cc.v2(o.x - 1, o.y)
                this.indexOfV2(result, c) || this.indexOfV2(tmp, c) || tmp.push(c)
            }
            if(o.x + 1 < psconfig.matrixRow && type == starMatrix[o.x + 1][o.y]){
                c = cc.v2(o.x + 1, o.y)
                this.indexOfV2(result, c) || this.indexOfV2(tmp, c) || tmp.push(c)
            }
            result.push(o)
        } while (
            tmp.length > 0
        );
        return result;
    },
    getScore: function(e) {
        for (var t = 0, i = 1; i <= e; i++)
            t += this.getOneScore(i);
        return t
    },
    getOneScore: function(e) {
        return 10 + 5 * e
    },
    needCheckCols: function(e) {
        var t = [];
        return e.forEach(function(e) {
            -1 == t.indexOf(e.y) && t.push(e.y)
        }),
        t.sort(function(e, t) {
            return t - e
        }),
        t
    },
    randomColorByArray: s,
    gameOver: function(arr) {//[1, 2, 3, 4, 5]
        for (var i = 0; i < psconfig.matrixRow; i++){
            for (var j = 0; j < psconfig.matrixCol; j++) {
                var n = arr[i][j];
                if (n >= 0 && n < 20) {
                    var pos = cc.v2(i, j);
                    if (pos.y - 1 >= 0 && n == arr[pos.x][pos.y - 1]){
                        return false;
                    }
                    if (pos.y + 1 < psconfig.matrixCol && n == arr[pos.x][pos.y + 1]){
                        return false;
                    }
                    if (pos.x - 1 >= 0 && n == arr[pos.x - 1][pos.y]){
                        return false;
                    }
                    if (pos.x + 1 < psconfig.matrixRow && n == arr[pos.x + 1][pos.y]){
                        return false
                    }
                }
            }
        }
        return true
    },
    getExtraScore: function(e) {
        return 2e3 - 200 * (e - 1)
    },
    rainbowStarRemoveList: function(e, t) {
        var s = []
          , n = t.x - 1 >= 0 ? t.x - 1 : t.x
          , a = t.y - 1 >= 0 ? t.y - 1 : t.y
          , o = t.x + 1 < psconfig.matrixCol ? t.x + 1 : t.x
          , c = t.y + 1 < psconfig.matrixCol ? t.y + 1 : t.y;
        s.push(t);
        for (var r = n; r <= o; r++)
            for (var d = a; d <= c; d++)
                if (e[r][d] >= 0) {
                    if (r == t.x && d == t.y)
                        continue;
                    var l = cc.v2(r, d);
                    s.push(l)
                }
        return s
    },
    creatSpecialStarList: function() {
        var e, t, i = [];
        do {
            e = Math.floor(10 * Math.random()),
            t = Math.floor(10 * Math.random());
            var s = cc.v2(e, t);
            this.indexOfV2(i, s) || i.push(s)
        } while (i.length < 3);
        return i
    },
    showPromptWithScale: function(e) {
        e.scale = .2,
        cc.tween(e).to(0.3, { scale: 1 }, { easing: 'backOut' })
        .start();
    },
    isNewDay: function() {
        var today = new Date();  
        var year = today.getFullYear();
        var month = today.getMonth();
        var day = today.getDate();

        var currentDayStart = new Date(year, month, day, 0, 0, 0, 0);
        var currentDayStartTime = Math.floor(currentDayStart.getTime() / 1000);
        var currentZeroTime = gameData.currentZeroTime    
        if(!currentZeroTime){
            gameData.currentZeroTime = currentDayStartTime         
            return [true, true]
        }
  
        var currentZeroTimeInt = parseInt(currentZeroTime);
        if (currentZeroTimeInt < currentDayStartTime) {
            gameData.currentZeroTime = currentDayStartTime
            return [true, true]

        } else if (currentZeroTimeInt === currentDayStartTime) {
            return [false, false]
        }
    },
    nodeScale: function(e, t, i, s, n) {
        -1 != n ? e.runAction(cc.sequence(cc.scaleTo(s, t), cc.scaleTo(s, i)).repeat(n)) : e.runAction(cc.sequence(cc.scaleTo(s, t), cc.scaleTo(s, i)).repeatForever())
    },
    setItemPicture: function(e, t) {
        cc.loader.load(e, function(e, i) {
            i && (t.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(i))
        })
    },
    changeLocalNodeTexture: function(e, t, i) {
        e.getComponent(cc.Sprite).spriteFrame = t[i]
    },
    getColData: function(e, t) {
        var i = t.y
          , s = [];
        s.push(t);
        for (var n = 0; n < e[i].length; n++)
            if (e[n][i] >= 0 && n != t.x && 20 != e[n][i]) {
                var a = cc.v2(n, i);
                s.push(a)
            }
        return s
    },
    getRowData: function(e, t) {
        var i = t.x
          , s = [];
        s.push(t);
        for (var n = 0; n < e[i].length; n++)
            if (e[i][n] >= 0 && n != t.y && 20 != e[i][n]) {
                var a = cc.v2(i, n);
                s.push(a)
            }
        return s
    },
    getSameBlockList: function(e, t, i) {
        var s = i
          , n = [];
        n.push(t);
        for (var a = 0; a < e.length; a++)
            for (var o = 0; o < e[a].length; o++)
                if (e[a][o] == s) {
                    var c = cc.v2(a, o);
                    n.push(c)
                }
        return n
    },
    needCombineTool: function(e, t) {
        var s = []
          , n = [];
        n.push(t);
        do {
            var a = n.pop();
            if (a.y - 1 >= 0 && e[a.x][a.y - 1] >= psconfig.rType && e[a.x][a.y - 1] < 20) {
                var o = cc.v2(a.x, a.y - 1);
                this.indexOfV2(s, o) || this.indexOfV2(n, o) || n.push(o)
            }
            if (a.y + 1 < psconfig.matrixCol && e[a.x][a.y + 1] >= psconfig.rType && e[a.x][a.y + 1] < 20) {
                var c = cc.v2(a.x, a.y + 1);
                this.indexOfV2(s, c) || this.indexOfV2(n, c) || n.push(c)
            }
            if (a.x - 1 >= 0 && e[a.x - 1][a.y] >= psconfig.rType && e[a.x - 1][a.y] < 20) {
                var r = cc.v2(a.x - 1, a.y);
                this.indexOfV2(s, r) || this.indexOfV2(n, r) || n.push(r)
            }
            if (a.x + 1 < psconfig.matrixRow && e[a.x + 1][a.y] >= psconfig.rType && e[a.x + 1][a.y] < 20) {
                var d = cc.v2(a.x + 1, a.y);
                this.indexOfV2(s, d) || this.indexOfV2(n, d) || n.push(d)
            }
            s.push(a)
        } while (n.length > 0);
        return s
    },
    getRowAndCol: function(e, t) {
        for (var i = this.getColData(e, t), s = this.getRowData(e, t), n = 0; n < s.length; n++)
            this.indexOfV2(i, s[n]) || i.push(s[n]);
        return i
    },
    get3Row: function(e, t) {
        for (var s, n, a = this.getRowData(e, t), o = 2; o > 0; ) {
            if (t.x - 1 >= 0) {
                var c = cc.v2(t.x - 1, t.y);
                s = this.getRowData(e, c);
                for (var r = 0; r < s.length; r++)
                    this.indexOfV2(a, s[r]) || a.push(s[r])
            }
            if (t.x + 1 < psconfig.matrixRow) {
                var d = cc.v2(t.x + 1, t.y);
                n = this.getRowData(e, d);
                for (var l = 0; l < n.length; l++)
                    this.indexOfV2(a, n[l]) || a.push(n[l])
            }
            o--
        }
        return a
    },
    get3Col: function(e, t) {
        for (var s = this.get3Row(e, t), n = t.y - 1 >= 0 ? t.y - 1 : 0, a = t.y + 1 < psconfig.matrixCol ? t.y + 1 : psconfig.matrixCol - 1, o = 0; o < e.length; o++)
            for (var c = 0; c < e[o].length; c++)
                if (c >= n && c <= a) {
                    var r = cc.v2(o, c);
                    this.indexOfV2(s, r) || s.push(r)
                }
        return s
    },
    getThreeBlockArea: function(e, t) {
        for (var s = [], n = t.x - 2 >= 0 ? t.x - 2 : 0, a = t.x + 2 < psconfig.matrixRow ? t.x + 2 : psconfig.matrixRow - 1, o = t.y - 2 >= 0 ? t.y - 2 : 0, c = t.y + 2 < psconfig.matrixRow ? t.y + 2 : psconfig.matrixCol - 1, r = 0; r < e.length; r++)
            if (r >= n && r <= a)
                for (var d = 0; d < e[r].length; d++)
                    if (d >= o && d <= c && -2 != e[r][d]) {
                        var l = cc.v2(r, d);
                        s.push(l)
                    }
        return s
    },
    getItemAdjacentPos: function(e) {
        var t = [];
        if (e.x - 1 >= 0) {
            var s = cc.v2(e.x - 1, e.y);
            this.indexOfV2(t, s) || t.push(s)
        }
        if (e.x + 1 < psconfig.matrixCol) {
            var n = cc.v2(e.x + 1, e.y);
            this.indexOfV2(t, n) || t.push(n)
        }
        if (e.y - 1 >= 0) {
            var a = cc.v2(e.x, e.y - 1);
            this.indexOfV2(t, a) || t.push(a)
        }
        if (e.y + 1 < psconfig.matrixRow) {
            var o = cc.v2(e.x, e.y + 1);
            this.indexOfV2(t, o) || t.push(o)
        }
        return t
    },
    getBalloonClearList: function(starMatrix, detail, type) {
        var result = []
        for (var i = 0; i < detail.length; i++){
            var itemAdjacentPos = this.getItemAdjacentPos(detail[i])
            for (var j = 0; j < itemAdjacentPos.length; j++) {
                var c = itemAdjacentPos[j]
                var r = starMatrix[c.x][c.y];
                if(!this.indexOfV2(detail, c) && !this.indexOfV2(result, c)){  
                    if(23 == type && r >= type && r <= type + 2){
                        result.push(c)
                    }else if(29 == type && r >= type && r <= type + 7){
                        result.push(c)
                    }else if( r == type){
                        result.push(c)
                    }
                }
            }
        }
        return result
    },
    randomGetGrid: function(e, t) {
        for (var s = [], n = 0, a = 0; a < t.length; a++)
            for (var o = 0; o < t[a].length; o++)
                t[a][o] >= 0 && t[a][o] < psconfig.rType && n++;
        if (0 == n)
            return s;
        for (e = n > e ? e : n; s.length < e; ) {
            var c = Math.floor(Math.random() * psconfig.matrixCol)
              , r = Math.floor(Math.random() * psconfig.matrixRow)
              , d = cc.v2(c, r);
            t[c][r] >= 0 && t[c][r] < psconfig.rType && !this.indexOfV2(s, d) && s.push(d)
        }
        return s
    },
    getRandomBlockPosition: function(e, t) {
        for (var s = []; s.length < t; ) {
            var n = parseInt(Math.random() * psconfig.matrixRow)
              , a = parseInt(Math.random() * psconfig.matrixCol);
            if (e[n][a] >= 0 && e[n][a] < 8) {
                var o = cc.v2(n, a);
                this.indexOfV2(s, o) || s.push(o)
            }
        }
        return s
    },
    computedNodeGap: function(e, t, i) {
        return (t.width - e * i.width) / (e + 1)
    },
    countDonwTime: function(e) {
        var t, i, s, n, a, o, c = new Date, r = e - Math.floor(c.getTime() / 1e3);
        return r >= 0 && (n = (t = Math.floor(r / 60 / 60 % 24)) < 10 ? "0" + t : "" + t,
        a = (i = Math.floor(r / 60 % 60)) < 10 ? "0" + i : "" + i,
        o = (s = Math.floor(r % 60)) < 10 ? "0" + s : "" + s,
        t > 0 ? n + ":" + a + ":" + o : a + ":" + o)
    },
    judgeNearNode: function(e) {
        for (var t = [], s = 0; s < psconfig.matrixRow; s++)
            for (var n = 0; n < psconfig.matrixCol; n++)
                if (e[s][n] >= 8 && e[s][n] < 11) {
                    var a = cc.v2(s, n);
                    this.judgeNearBy(a, e) && t.push(cc.v2(s, n))
                }
        return t
    },
    judgeNearBy: function(e, t) {
        var s = !1;
        return e.x - 1 >= 0 && t[e.x - 1][e.y] >= 8 && t[e.x - 1][e.y] < 11 && (s = !0),
        e.x + 1 < psconfig.matrixRow && t[e.x + 1][e.y] >= 8 && t[e.x + 1][e.y] < 11 && (s = !0),
        e.y + 1 < psconfig.matrixCol && t[e.x][e.y + 1] >= 8 && t[e.x][e.y + 1] < 11 && (s = !0),
        e.y - 1 >= 0 && t[e.x][e.y - 1] >= 8 && t[e.x][e.y - 1] < 11 && (s = !0),
        s
    },
    girdToPos: function(i, j, add) {
        var x = add + 1.9 + 0.5 * psconfig.cellSize + (psconfig.cellSize + 1.9) * j
        var y = add + 1.9 + 0.5 * psconfig.cellSize + (psconfig.cellSize + 1.9) * i;
        return cc.v2(x, y)
    },
    judgeBounder: function(position, matrix) {
        var bounds = []; 
        // Check the bottom boundary
        if (position.x + 1 >= psconfig.matrixRow || matrix[position.x + 1][position.y] === -2) {
            bounds[0] = 1;
        } else {
            bounds[0] = 0;
        } 
        // Check the top boundary
        if (position.x - 1 < 0 || matrix[position.x - 1][position.y] === -2) {
            bounds[1] = 1;
        } else {
            bounds[1] = 0;
        }
        // Check the left boundary
        if (position.y - 1 < 0 || matrix[position.x][position.y - 1] === -2) {
            bounds[2] = 1;
        } else {
            bounds[2] = 0;
        }
        
        // Check the right boundary
        if (position.y + 1 >= psconfig.matrixCol || matrix[position.x][position.y + 1] === -2) {
            bounds[3] = 1;
        } else {
            bounds[3] = 0;
        }  
        
        return bounds;
    },
    judgeAngle: function(position, matrix) {
        var angles = [0, 0, 0, 0];
        // Check the top-left position
        if (position.x - 1 >= 0 && position.y + 1 < psconfig.matrixCol && matrix[position.x - 1][position.y + 1] !== -2) {
            angles[2] = 1;
        }
        // Check the top-right position
        if (position.x + 1 < psconfig.matrixRow && position.y + 1 < psconfig.matrixCol && matrix[position.x + 1][position.y + 1] !== -2) {
            angles[1] = 2;
        }
        // Check the bottom-right position
        if (position.x + 1 < psconfig.matrixRow && position.y - 1 >= 0 && matrix[position.x + 1][position.y - 1] !== -2) {
            angles[0] = 3;
        }
        // Check the bottom-left position
        if (position.x - 1 >= 0 && position.y - 1 >= 0 && matrix[position.x - 1][position.y - 1] !== -2) {
            angles[3] = 4;
        }

        return angles;
    },
    addHinder: function(e, t, s) {
        for (var n = []; n.length < t; ) {
            var a = Math.floor(Math.random() * psconfig.matrixRow)
              , o = Math.floor(Math.random() * psconfig.matrixCol)
              , c = cc.v2(a, o);
            !this.indexOfV2(n, c) && e[a][o] >= 0 && e[a][o] < psconfig.rType && (e[a][o] = s,
            n.push(c))
        }
        return e
    },
    chooseRemoveList: function(e) {
        for (var t = [], s = 0; s < psconfig.matrixRow; s++)
            for (var n = 0; n < psconfig.matrixCol; n++) {
                var a = cc.v2(s, n);
                if (!this.checkItem(a, t)) {
                    var o = this.needRemoveList(e, a);
                    if (o.length > 1) {
                        var c = o[0]
                          , r = e[c.x][c.y];
                        r < psconfig.rType && r >= 0 && o.length >= 5 && t.push(o)
                    }
                }
            }
        return t
    },
    checkItem: function(e, t) {
        for (var i = !1, s = 0; s < t.length; s++) {
            var n = t[s];
            if (this.indexOfV2(n, e)) {
                i = !0;
                break
            }
        }
        return i
    },
    canRemoveList: function(e) {
        for (var t = [], s = 0; s < psconfig.matrixRow; s++)
            for (var n = 0; n < psconfig.matrixCol; n++) {
                var a = cc.v2(s, n);
                if (!this.checkItem(a, t)) {
                    var o = this.needRemoveList(e, a);
                    if (o.length > 1)
                        return o
                }
            }
    },
    noticeLongestList: function(e) {
        for (var t = [], s = 0; s < psconfig.matrixRow; s++)
            for (var n = 0; n < psconfig.matrixCol; n++)
                if (e[s][n] < 8 && e[s][n] >= 0) {
                    var a = cc.v2(s, n);
                    if (this.checkItem(a, t))
                        continue;
                    var o = this.needRemoveList(e, a);
                    o.length > 1 && t.push(o)
                }
        return t.sort(function(e, t) {
            return e.length - t.length
        }),
        t.length > 0 && t.pop()
    },
    judgeOperateLevel: function(e) {
        return !(e < 5) && (e >= 5 && e < 7 ? 1 : 7 == e ? 2 : e >= 8 ? 3 : void 0)
    },
    getCurrentMapVineList: function(e) {
        for (var t = [], i = 0; i < e.length; i++)
            for (var s = 0; s < e.length; s++) {
                var n = e[i][s];
                22 != n || this.indexOfV2(t, n) || t.push(cc.v2(i, s))
            }
        return t.length > 0 && t
    },
    judgeCurrentMapHinderByType: function(e, t) {
        for (var i = [], s = 0; s < e.length; s++)
            for (var n = 0; n < e.length; n++) {
                var a = e[s][n];
                a != t || this.indexOfV2(i, a) || i.push(cc.v2(s, n))
            }
        return i.length > 0 && i
    },
    getWindmillEffectAreaList: function(e, t) {
        var s = []
          , n = t.x - 1 >= 0 ? t.x - 1 : t.x
          , a = t.y - 1 >= 0 ? t.y - 1 : t.y
          , o = t.x + 2 < psconfig.matrixCol ? t.x + 2 : t.x + 1 < psconfig.matrixCol ? t.x + 1 : t.x
          , c = t.y + 1 < psconfig.matrixCol ? t.y + 1 : t.y;
        s.push(t);
        for (var r = n; r <= o; r++)
            for (var d = a; d <= c; d++)
                if (e[r][d] >= 0) {
                    if (r == t.x && d == t.y)
                        continue;
                    var l = cc.v2(r, d);
                    s.push(l)
                }
        return s
    },
   
}
        