import utils  from "./utils"
module.exports = {
    leaderboardName: "block_farm",
    key: "ffjoffrey100",
    sendGetRequest: function(e, t) {
        var i = new XMLHttpRequest;
        i.onreadystatechange = function() {
            4 == i.readyState && (i.status >= 200 && i.status < 400 ? t && t(i.responseText) : t && t(null))
        }, i.open("GET", e, !0), i.send()
    },
    sendPostRequest: function(e, t, i) {
        var s = new XMLHttpRequest;
        s.open("POST", e, !0), s.setRequestHeader("Content-type", "application/x-www-form-urlencoded"), s.onreadystatechange = function() {
            4 == s.readyState && (s.status >= 200 && s.status < 400 ? i && i(s.responseText) : i && i(null))
        }, s.send(t)
    },
    login: function(e, t, i, s) {
        s && s({
            code: 0,
            msg: "",
            data: {
                uid: "102",
                name: "Minh",
                data: {
                    game: [2, 0, 0],
                    player: [{
                        type: 0,
                        name: "battle",
                        number: 1
                    }, {
                        type: 1,
                        name: "fork",
                        number: 2
                    }, {
                        type: 2,
                        name: "hammer",
                        number: 3
                    }, {
                        type: 3,
                        name: "dice",
                        number: 4
                    }]
                },
                coin: 0,
                level: 0,
                star: 0,
                lasttime: 1583408323,
                curtime: 1583408598
            }
        })
    },
    requestData : function(url, open, data){
        return new Promise(function(resolve, reject){
            try{      
                let link = "http://localhost:1337/api/" + url

                const xhr = new XMLHttpRequest();
                xhr.timeout = 15000;
                xhr.ontimeout = function () { reject("timeout") };
                xhr.onreadystatechange = () => {
                    if (xhr.readyState == 4) {
                        if(xhr.status == 200){
                            const response = JSON.parse(xhr.responseText);
                            resolve(response)
                        }else{
                            reject(xhr.responseText)
                        }
                    }
                };
                xhr.onerror = function () {
                    reject("onerror")
                };
                xhr.open(open, link);
                xhr.setRequestHeader('Content-Type', 'application/json');   
                xhr.send(JSON.stringify(data));
            }catch(error){
                cc.log(error)    
                utils.analytic("requestData error "+url, "requestData error "+url, error.message);  
                reject(error.message)
            }
      }) 
    }
}