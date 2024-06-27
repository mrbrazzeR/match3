import targetBlock from "./targetBlock";

const { ccclass, property } = cc._decorator;


@ccclass
export default class targetControl extends cc.Component {

    @property(cc.Prefab)
    tile: cc.Prefab = null;

    @property(cc.Sprite)
    icon: cc.Sprite = null;

    @property(cc.Node)
    scrollRect: cc.Node = null;
    @property([cc.SpriteFrame])
    frames: cc.SpriteFrame[] = [];

    @property(cc.Node)
    spawnPos: cc.Node = null;
    @property(cc.EditBox)
    count: cc.EditBox = null;

    idTarget: number;
    id: number;
    idAvaiable = [0, 1, 2, 3, 4, 5, 6, 7, 20, 21, 25, 26, 27, 28, 29, 37, 38, 39,40,41,42]

    protected onLoad(): void {
        cc.systemEvent.on('TARGETCHOOSE', this.chooseTarget, this)
    }

    setView(id:number){
        this.idTarget=id;
        for (let i = 0; i < this.idAvaiable.length; i++) {
            let tileSet = cc.instantiate(this.tile);
            tileSet.getComponent(cc.Sprite).spriteFrame = this.frames[i];
            tileSet.getComponent(targetBlock).set(this.idAvaiable[i],id);
            tileSet.parent = this.scrollRect;
            let row = i % 10;
            let col = Math.floor(i / 10);
            tileSet.setPosition(row * 41, -col * 41 - 35)
            tileSet.setContentSize(40, 40)
        }
        this.scrollRect.active = !this.scrollRect.active;
    }
    chooseTarget(eventData) {
        if (this.idTarget != eventData.targetId) {
            this.scrollRect.active = !1
        }
        else {
            this.id = eventData.id;
            this.icon.spriteFrame = eventData.frame
            this.scrollRect.active = !1
            console.log(eventData.id)
        }
    }
    enableScroll() {
        this.scrollRect.active = !this.scrollRect.active;
    }

    setData(){
        cc.systemEvent.emit('SAVE',{idTarget:this.idTarget,id:this.id,count:this.count.string})
    }


}