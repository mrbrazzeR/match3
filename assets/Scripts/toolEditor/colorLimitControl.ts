import colorLimitBlock from "./colorLimitBlock";

const { ccclass, property } = cc._decorator;


@ccclass
export default class colorLimitControl extends cc.Component {

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

    idTarget: number;
    id: number;
    idAvaiable = [1, 2, 3, 4, 5, 21, 22, 38, 40]

    protected onLoad(): void {
        cc.systemEvent.on('COLORLIMIT', this.chooseTarget, this)
    }

    setView(id: number) {
        this.idTarget = id;
        for (let i = 0; i < this.idAvaiable.length; i++) {
            let tileSet = cc.instantiate(this.tile);
            tileSet.getComponent(cc.Sprite).spriteFrame = this.frames[i];
            tileSet.getComponent(colorLimitBlock).set(this.idAvaiable[i], id);
            tileSet.parent = this.scrollRect;
            let row = i % 10;
            let col = Math.floor(i / 10);
            tileSet.setPosition(row * 50, -col * 50 - 35)
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

}