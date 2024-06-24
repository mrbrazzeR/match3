import GlobalEvent from "./GlobalEvent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class levelNode extends cc.Component {
    private _posX: number;
    private _posY: number;

    @property(cc.Sprite)
    view: cc.Sprite = null;

    @property(cc.Node)
    bubble: cc.Node = null;

    @property(cc.Node)
    grass: cc.Node = null;

    setPos(x: number, y: number) {
        this._posX = y;
        this._posY = x;
    }

    onLoad() {
        this.node.on(cc.Node.EventType.MOUSE_MOVE, function () {
            if (GlobalEvent.ISDRAGGING)
                this.onTouchStart();
        }, this);
        this.node.on(cc.Node.EventType.MOUSE_DOWN, function () {
            this.startDragging();
            this.onTouchStart()
            GlobalEvent.ISDRAGGING = true;
        }, this);
        this.node.on(cc.Node.EventType.MOUSE_UP, function () {
           this.endDragging();
            GlobalEvent.ISDRAGGING= false;
        }, this);
        cc.systemEvent.on('CHANGENODE', this.changeNode, this);
        cc.systemEvent.on('REMOVENODE', this.removeNode, this);
    }
    onTouchStart() {
        cc.systemEvent.emit('LEVELNODECLICK', { x: this._posX, y: this._posY });
    }
    startDragging(){
        cc.systemEvent.emit('STARTDRAGGING', { x: this._posX, y: this._posY });
    }
    endDragging(){
        cc.systemEvent.emit('ENDDRAGGING', { x: this._posX, y: this._posY });
    }

    //solve by id
    changeNode(eventData) {
        if (this._posX == eventData.x && this._posY == eventData.y) {
            if (eventData.isGrass) {
                this.grass.active = !0;
                this.grass.getComponent(cc.Sprite).spriteFrame = eventData.img;
            }
            if(eventData.isBubble)
            {
                this.bubble.active=eventData.isBubble
            }
            if (!eventData.isGrass && !eventData.isBubble && eventData.isNormal) {
                this.view.spriteFrame = eventData.img;
                this.bubble.active = eventData.isBubble;
            }
        }
    }

    removeNode(eventData) {
        if (this._posX == eventData.x && this._posY == eventData.y) {
            this.grass.active = !1;
            this.bubble.active = !1;
            this.view.spriteFrame = eventData.frame;
        }
    }

}