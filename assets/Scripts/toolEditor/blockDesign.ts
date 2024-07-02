const { ccclass, property } = cc._decorator;

@ccclass
export default class blockDesign extends cc.Component {

    @property(cc.Node)
    view: cc.Node = null;

    @property
    _stoneType: number = 0;

    @property
    nextType: number = -1;

    @property([cc.SpriteFrame])
    viewFrame: cc.SpriteFrame[] = [];

    @property(cc.SpriteFrame)
    rocketFrame: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    discoFrame: cc.SpriteFrame = null

    @property([cc.SpriteFrame])
    hinderView: cc.SpriteFrame[] = [];

    @property([cc.SpriteFrame])
    colorCubeViewList: cc.SpriteFrame[] = [];

    @property(cc.SpriteFrame)
    vine: cc.SpriteFrame = null;
    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, function () {
            this.onTouchStart();
        }, this);
    }
    originView() {
        this.view.getComponent(cc.Sprite).spriteFrame = this.viewFrame[this._stoneType]
    }
    changeStoneNum(e: number) {
        // Set the stone type
        this._stoneType = e;
        if (e >= 0) {
            // Check for specific stone types and apply corresponding logic
            if (e == 8) {
                // Rocket type (vao game se random 1 trong 2)
                this.view.getComponent(cc.Sprite).spriteFrame = this.rocketFrame;
            } else if (e == 10) {
                // Disco type           
                this.view.getComponent(cc.Sprite).spriteFrame = this.discoFrame;
            } else if (e == 9) {
                // Some other type (possibly a bomb)
                this.view.getComponent(cc.Sprite).spriteFrame = this.viewFrame[e];
            } else if (e == 11) {
                this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[10];
            }
            else if (e == 12) {
                this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[11];
            } else if (e >= 20) {
                // Various special types
                if (e == 22) {
                    // Vine type
                    this.view.getComponent(cc.Sprite).spriteFrame = this.vine;
                } else if (e >= 23 && e <= 25) {
                    // Box cubes types
                    if (e == 23) this.initBoxCubesData(7);
                    if (e == 24) this.initBoxCubesData(8);
                    if (e == 25) this.initBoxCubesData(3);
                } else if (e == 26) {
                    // Flower cubes type
                    this.initFlowerCubesData();
                } else if (e == 27) {
                    // Windmill type
                    this.initWindmill();
                } else if(e==28){
                    this.view.getComponent(cc.Sprite).spriteFrame = this.viewFrame[11];
                } 
                else if (e >= 29 && e <= 36) {
                    // Colorful cubes types
                    this.initColorfulCubes(1, e - 29);
                } else if (e == 37) {
                    // Ladybug cubes type
                    this.initLadyBugCubes();
                } else if (e == 39) {
                    // Rock stone type
                    this.initRockStone();
                }
                else if (e == 38) {
                    this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[9];
                }
                else if (e == 40) {
                    this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[12];
                } else if (e == 41) {
                    this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[13];
                }
                else if(e==42){
                    this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[14];
                }
                else if(e==43){
                    this.view.getComponent(cc.Sprite).spriteFrame = this.viewFrame[12];
                }
                else if(e==44){
                    this.view.getComponent(cc.Sprite).spriteFrame = this.viewFrame[13];
                }
                else
                 {
                    // Hinder view for other special types
                    this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[e - 20];
                }

            } else {
                // Default case for other types (0 -> 7)
                this.view.getComponent(cc.Sprite).spriteFrame = this.viewFrame[e];

            }
        } else {
            // If the stone type is invalid, set the sprite frame to null
            this.view.getComponent(cc.Sprite).spriteFrame = null;
        }
    }
    randomCreateDiscoType() {
        var e = [0, 1, 2, 3, 4];
        return e[Math.floor(Math.random() * e.length)]
    }
    randomGetItemType(e: number[]) {
        return !!(e && e.length > 0) && e[Math.floor(Math.random() * e.length)]
    }
    initBoxCubesData(e: number) {
        this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[e]
    }
    initFlowerCubesData() {
        this.view.getComponent(cc.Sprite).spriteFrame = this.viewFrame[10];
    }
    initWindmill() {
        this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[4]
    }
    initColorfulCubes(e: number, t: number) {
        this.nextType = t;
        "number" == typeof this.nextType && (this.view.getComponent(cc.Sprite).spriteFrame = this.colorCubeViewList[this.nextType])
    }
    initLadyBugCubes() {
        this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[5]
    }
    initRockStone() {
        this.view.getComponent(cc.Sprite).spriteFrame = this.hinderView[6]
    }

    onTouchStart() {
        var sprite = this.view.getComponent(cc.Sprite).spriteFrame;
        cc.systemEvent.emit('BLOCKCLICK', { id: this._stoneType, img: sprite });
    }

    // ... (các phương thức khác giữ nguyên)
}