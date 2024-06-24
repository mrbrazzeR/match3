import { Rectangle } from "./LevelDesignTool";
const { ccclass, property } = cc._decorator;
@ccclass
export default class customBlockDesign extends cc.Component {
    @property(cc.Label)
    counting: cc.Label = null;

    comfirmBearWidthAndHeight(rec: Rectangle, count: number) {
        let recWidth = rec.topRight.x - rec.bottomLeft.x + 1;
        let recHeight = rec.topRight.y - rec.bottomLeft.y + 1;
        this.node.height = recWidth * 75, this.node.width = recHeight * 75
        this.node.setPosition(rec.bottomLeft.y * 75 - 75 / 2, rec.bottomLeft.x * 75 - 75 / 2)
        this.counting.string = count.toString()
    }
}