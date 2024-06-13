import utils  from "./utils"

const MUSIC_PATH = "Audios/Game/bgm/";
const SOUND_PATH = "Audios/Game/effect/";
module.exports = {
    clip_cache: new Map(),
    loading_map: new Map(),
    curr_music: "",
    music_id: -1,
    music_volume: 0, 
    music_mute: false,
    sound_ids: [],
    sound_volume: 0,
    sound_mute: false,
    volumeSound: {
        musicbg: 0.3,
    },
    handler_pool: [],
    init: function() {
        var _this = this;
        try {
            let muteSound = cc.sys.localStorage.getItem("KEY_SOUND_IS_MUTE") ? cc.sys.localStorage.getItem("KEY_SOUND_IS_MUTE") : false    
            if(muteSound == "true"){
                this.sound_mute = true
            }else{
                this.sound_mute = false
            }
            let muteMusic = cc.sys.localStorage.getItem("KEY_MUSIC_IS_MUTE") ? cc.sys.localStorage.getItem("KEY_MUSIC_IS_MUTE") : false    
            if(muteMusic == "true"){
                this.music_mute = true
            }else{
                this.music_mute = false
            }   
            utils.loadBundleDir("Audios/Game/effect", cc.AudioClip).then(function(assets,err){
                if(err){
                    cc.log("err Audios",err)
                }else{
                    assets.forEach(e => {
                        let path = 'Audios/Game/effect/' + e.name;
                        _this.clip_cache.set(path, e);      
                    });    
                }
            }); 
            utils.loadBundle("Audios/Game/bgm/bgm1", cc.AudioClip).then(function(asset,err){
                if(err){
                    cc.log(err)
                }else{
                    _this.clip_cache.set("Audios/Game/bgm/bgm1", asset); 
                    if(_this.music_mute == false) {
                        _this.play_music('bgm1')
                    } 
                }
            });
        } catch (error) {
            cc.log(error)
        }
       
    },
 
    playSound: function(name) {
        this.isSound && this.sounds[e] && cc.audioEngine.play(this.sounds[e], !1, 1)
        if (this.sound_mute) {
            return;
        }
        let path = SOUND_PATH + name;
        let clip = this.clip_cache.get(path);
        ///m
        if (clip) {
            this.play_clip(clip, 1, false, 'Sound');
        } else {
            let task = { type: 'Sound', name: name, path: path, volume: 1, loop: false };
            this.load_task(task);
        }
    },
    
    stop_music() {
        if (this.music_id < 0) {
            // cc.log("no music is playing");
            return;
        }
        cc.audioEngine.stop(this.music_id);
        this.music_id = -1;
    },
    get_music_mute() {
        return this.music_mute;
    },
    play_music: function(name) {
        if (this.music_id >= 0) {
            this.stop_music();
        }

        let path = MUSIC_PATH + name; 
        this.curr_music = name;

        if (this.music_mute) {
            return;
        }
        let clip = this.clip_cache.get(path);
        ///m
        let volumeSound = this.volumeSound[name];
        if (clip) {
            //this.play_clip(clip, this.music_volume, true, AudioType.Music);
            this.play_clip(clip, volumeSound, true, "Music");
        } else {
            // let task: AudioPlayTask = { type: AudioType.Music, name: name, path: path, volume: this.music_volume, loop: true };
            let task = { type: "Music", name: name, path: path, volume: volumeSound, loop: true };
            this.load_task(task);
        }
        ///m
    },
    set_music_mute(is_mute) {
        this.music_mute = is_mute;
        if (this.music_id < 0) {
            if (!is_mute) {  
                if(this.curr_music){
                    this.play_music(this.curr_music);
                }else{
                    this.play_music("bgm1");
                }     
                
            }
            return;
        }
        if (is_mute) {
            cc.audioEngine.pause(this.music_id);
        } else {
            cc.audioEngine.resume(this.music_id);
        }
    },
    set_music_mute_menu(is_mute) {
        this.music_mute = is_mute;

        if (this.music_id < 0) {
            return;
        }
        if (is_mute) {
            cc.audioEngine.pause(this.music_id);
        } else {
            cc.audioEngine.resume(this.music_id);
        }
    },
    set_music_volume(volume) {
        this.music_volume = volume;
        if (this.music_id >= 0) {
            cc.audioEngine.setVolume(this.music_id, volume);
        }
    },
    load_task(task) {
        var _this = this;
       
        let path = task.path;
        if (this.loading_map.get(path)) {
            return;
        }
        this.loading_map.set(path, true);
        this.loadRawAsset(path).then(function(res) {
           // cc.log(res)
            if (res) {
                _this.on_clip_loaded(task, res);
            }
        });
        //, this.gen_handler(this.on_clip_loaded, this, task));
        //loadRawAsset(path, utils.gen_handler(this.on_clip_loaded, this, task));
    },
    gen_handler(cb, host = null) {
        if (host === void 0) { host = null; }
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var single_handler = this.handler_pool.length < 0 ? this.handler_pool.pop() : new handler();
        //The args must be expanded here, otherwise the args will be passed to the wrapper as an array, causing its args parameter to become a 2-dimensional array [[]]
        single_handler.init.apply(single_handler, __spreadArray([cb, host], args, false));
        return single_handler;
    },
    loadRawAsset(url) {
        return new Promise(function(e, t) {

            /* let res = cc.loader.getRes(url);
            if (res) {
                e(res);
            } else { */
            utils.loadBundle(url,cc.AudioClip).then(function(res,err){
                    if(err){
                        t(new Error("loadRawAsset error"))
                        cc.log(err)
                    }else{
                        e(res);
                    }
                }); 
            //}
        })
    },
    on_clip_loaded(task, clip) {
        this.clip_cache.set(task.path, clip);
        if (task.type == 'Music' && task.name != this.curr_music) {
            return;
        }
        this.play_clip(clip, task.volume, task.loop, task.type, task.cb);
    },

    play_clip(clip, volume, loop, type) {

        let aid = cc.audioEngine.play(clip, loop, volume);
        if (type == "Music") {
            this.music_id = aid;
        } else if (type == "Sound") {
            this.sound_ids.push(aid);
            cc.audioEngine.setFinishCallback(aid, () => {
                this.on_sound_finished(aid);
                //  cb && cb.exec();
            });
        }
    },

    on_sound_finished(aid) {
        let idx = this.sound_ids.findIndex((id) => {
            return id == aid;
        });
        if (idx != -1) {
            this.sound_ids.splice(idx, 1);
        }
    },

    get_sound_mute() {
        return this.sound_mute;
    },

    set_sound_mute(is_mute) {
        
        this.sound_mute = is_mute;
        this.sound_ids.forEach((sid) => {
            if (is_mute) {
                cc.audioEngine.pause(sid);
            } else {
                cc.audioEngine.resume(sid);
            }
        });
    },

    //0~1
    set_sound_volume(volume) {
        this.sound_volume = volume;
        this.sound_ids.forEach((sid) => {
            cc.audioEngine.setVolume(sid, volume);
        });
    },

    stop_sound() {
        this.sound_ids.forEach((sid) => {
            cc.audioEngine.stop(sid);
        });
        this.sound_ids.length = 0;
    },

    clear_cache() {
        this.clip_cache.forEach((clip, key) => {
            this.release(clip);
        });
        this.clip_cache.clear();
        this.loading_map.clear();
        cc.audioEngine.uncacheAll();
    },
    release(urlOrAssetOrNode) {
        if (urlOrAssetOrNode instanceof cc.Node) {
            //Release the node and remove it from the scene
            urlOrAssetOrNode.destroy();
        } else {
            // Release cache references and resource content
            cc.loader.release(urlOrAssetOrNode);
        }
    }
}