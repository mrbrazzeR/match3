module.exports = {
 
    FbManager: null,
    IS_FB_INSTANT : typeof FBInstant != "undefined" ? true : false,
    requestData : function(url, open, data){
        return new Promise(function(resolve, reject){
            try{
                var boolEncrypt = false
                var encrypt = CryptoJS.encrypt(JSON.stringify(data))
                if(url == "updateRoom" || url == "joinRoom" || url == "addScore" || url == "updateUser" || url == "updateInfo"){
                    boolEncrypt = true
                    data = {"data":encrypt}
                }
       
                let link = Global.API+ url
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
                if(boolEncrypt){
                    xhr.setRequestHeader('Authorization', 'Bearer ' + Global.User.token);
                }        
                xhr.send(JSON.stringify(data));
            }catch(error){
                cc.log(error)    
                Global.analytic("requestData error "+url, "requestData error "+url, error.message);  
                reject(error.message)
            }
      }) 
    }
}