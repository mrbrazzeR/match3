import { Rectangle } from "./LevelDesignTool";
const { ccclass, property } = cc._decorator;
@ccclass
export default class squirrelDesign extends cc.Component {
    
    rectangle:Rectangle;
    comfirmBearWidthAndHeight(rec: Rectangle) {
        this.rectangle=rec;
        let recWidth = rec.topRight.x - rec.bottomLeft.x + 1;
        let recHeight = rec.topRight.y - rec.bottomLeft.y + 1;
        recWidth - recHeight > 0 ? (this.node.height = recWidth * 75, this.node.width = recHeight * 75, this.node.angle = -0)
            : (this.node.width = recWidth * 75, this.node.height = recHeight * 75, this.node.angle = -90)

        //kiem tra do lech:
        let xBonus = (rec.topRight.x - rec.bottomLeft.x) * 75 / 2;
        let yBonus = (rec.topRight.y - rec.bottomLeft.y) * 75 / 2;
        if (recWidth - recHeight > 0) {
            this.node.setPosition(rec.bottomLeft.y * 75 + yBonus, rec.bottomLeft.x * 75)
        }
        else { this.node.setPosition(rec.bottomLeft.y * 75, rec.bottomLeft.x * 75 + xBonus) }
    }
}