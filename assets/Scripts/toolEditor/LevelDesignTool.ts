import blockDesign from "./blockDesign";
import customBlockDesign from "./customBlockDesign";
import levelNode from "./levelNode";
import squirrelDesign from "./squirrelDesign";
import targetControl from "./targetControl";
const { ccclass, property } = cc._decorator;

@ccclass
export default class levelDesignTool extends cc.Component {
  @property(cc.Prefab)
  block: cc.Prefab = null;

  @property(cc.Node)
  spawnPosition: cc.Node = null;

  @property(cc.Prefab)
  levelNode: cc.Prefab = null;

  @property(cc.Node)
  levelMap: cc.Node = null;

  @property(cc.SpriteFrame)
  baseFrame: cc.SpriteFrame = null;

  @property(cc.RichText)
  phaseText: cc.RichText = null;

  @property(cc.Prefab)
  squirrel: cc.Prefab = null;

  @property(cc.Prefab)
  customAvatar: cc.Prefab = null;
  @property(cc.Prefab)
  customCan: cc.Prefab = null;

  @property([cc.EditBox])
  scoreStandard: cc.EditBox[] = [];

  @property(cc.EditBox)
  step: cc.EditBox = null;

  @property(cc.EditBox)
  countingBox: cc.EditBox = null;
  @property(cc.EditBox)
  sizeBox: cc.EditBox = null;

  @property(cc.Node)
  targetPos: cc.Node = null;
  @property(cc.Prefab)
  targetControlPre: cc.Prefab = null;

  matrix: number[][] = [];
  grassMatrix: number[][] = [];
  bubbleMatrix: number[][] = [];

  grassSquare: grassModified[] = [];
  bubbleSquare: grassModified[] = [];
  squirrelSquare: squirrelModified[] = [];
  squirrelList: cc.Node[] = [];
  customBlockList: customBlockModified[] = [];
  customBlockNodeList: cc.Node[] = [];

  private targetList: number[][] = [];
  private targetNode: cc.Node[] = [];

  private frame: cc.SpriteFrame;
  private id: number;
  private phase: PHASE;
  private startPoint: Point = null;
  protected onLoad(): void {
    this.startPoint = { x: -1, y: -1 };
    cc.systemEvent.on('BLOCKCLICK', this.getBlock, this);
    cc.systemEvent.on('LEVELNODECLICK', this.changeNode, this);
    cc.systemEvent.on('STARTDRAGGING', this.startDragging, this)
    cc.systemEvent.on('ENDDRAGGING', this.endDragging, this)
    cc.systemEvent.on('SAVE', this.addTarget, this)
    this.phase = PHASE.ADD;
  }

  protected start(): void {
    let index = 0;
    for (let i = 0; i < 42; i++) {
      //normal tile
      if (i >= 0 && i <= 12) {
        var b = cc.instantiate(this.block);
        b.getComponent(blockDesign).changeStoneNum(i);
        let row = index % 10;
        let col = Math.floor(index / 10);
        b.parent = this.spawnPosition;
        b.setPosition(row * 75, col * 75)
        b.setContentSize(75, 75)
        index++;
      }
      //Various special types
      else if (i >= 20) {
        var b = cc.instantiate(this.block);
        b.getComponent(blockDesign).changeStoneNum(i);
        let row = index % 10;
        let col = Math.floor(index / 10);
        b.parent = this.spawnPosition;
        b.setPosition(row * 75, col * 75)
        b.setContentSize(75, 75)
        index++;
      }
    }

    //setup
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        var n = cc.instantiate(this.levelNode);
        n.parent = this.levelMap;
        n.setPosition(i * 75, j * 75);
        n.getComponent(levelNode).setPos(i, j)
      }
    }
    this.matrix = Array(9).fill(null).map(() => Array(9).fill(-2));
    this.grassMatrix = Array(9).fill(null).map(() => Array(9).fill(-2));
    this.bubbleMatrix = Array(9).fill(null).map(() => Array(9).fill(-2));
  }
  getBlock(eventData) {
    this.frame = eventData.img;
    this.id = eventData.id;
  }

  changeNode(eventData) {

    let x = eventData.x;
    let y = eventData.y;
    switch (this.phase) {
      case PHASE.ADD:
        let isGrass = false;
        let isBubble = false;
        let isNormal = false;
        //check is lock
        if ((this.matrix[x][y] == 40 || this.matrix[x][y] == 41) && (this.id != 40 && this.id != 41)) {
          let temp = this.customBlockList.findIndex((obj) => (obj[0][0] <= x && obj[0][1] <= y && obj[1][0] >= x && obj[1][1] >= y));
          if (temp != -1) {
            let pos = this.customBlockList[temp];
            this.customBlockList.splice(temp, 1);
            this.customBlockNodeList[temp].destroy();
            for (let i = pos[0][0]; i <= pos[1][0]; i++)
              for (let j = pos[0][1]; j <= pos[1][1]; j++) {
                this.matrix[i][j] = -2;
              }
            this.customBlockNodeList.splice(temp, 1)
          }
        }

        if (this.id >= 0 && this.id <= 10) {
          //normal block
          this.matrix[x][y] = this.id;
          isNormal = true;
        }
        else if (this.id >= 20 && this.id <= 39 && this.id != 38 && this.id != 28) {
          //main view block
          this.matrix[eventData.x][eventData.y] = this.id;
          isNormal = true;
        }
        else if (this.id == 11) {
          //grass layer
          if (this.matrix[x][y] == -2)
            return;
          isGrass = true;
          this.grassMatrix[x][y] = 2;
        }
        else if (this.id == 12) {
          if (this.matrix[x][y] == -2)
            return;
          isGrass = true;
          this.grassMatrix[x][y] = 1;
        }
        else if (this.id == 38) {
          let pos = this.matrix[x][y];
          //bubble layer
          if (pos >= 0 && pos <= 7) {
            isBubble = true;
            this.bubbleMatrix[x][y] = 1;
          } else if (pos >= 20 && pos <= 39 && pos != 38) {
            isBubble = true;
            this.bubbleMatrix[x][y] = 1;
          }
        }
        else if (this.id == 40) {
          let size: number = +this.sizeBox.string
          let count: number = +this.countingBox.string
          this.frame = this.baseFrame;
          if (size == 1) {
            if (this.matrix[x][y] == 40)
              return

            cc.systemEvent.emit('REMOVENODE', { x: x, y: y, frame: this.baseFrame })
            this.matrix[x][y] = 40;
            let rec: Rectangle = { bottomLeft: { x: x, y: y }, topRight: { x: x, y: y } }
            let cus = cc.instantiate(this.customAvatar);
            cus.parent = this.levelMap;
            cus.getComponent(customBlockDesign).comfirmBearWidthAndHeight(rec, count)
            this.customBlockList.push([[rec.bottomLeft.x, rec.bottomLeft.y], [rec.topRight.x, rec.topRight.y], count, "custom_avarta"])
            this.customBlockNodeList.push(cus)
          } else {
            if (x + 2 > 8 || y + 2 > 8) { return }
            for (let i = x; i < x + 2; i++) {
              for (let j = y; j < y + 2; j++) {
                if (this.matrix[i][j] == 40) {
                  return
                }
              }
            }
            for (let i = x; i < x + 2; i++) {
              for (let j = y; j < y + 2; j++) {
                this.matrix[i][j] = 40
                cc.systemEvent.emit('REMOVENODE', { x: i, y: j, frame: this.baseFrame })
              }
            }
            let rec: Rectangle = { bottomLeft: { x: x, y: y }, topRight: { x: x + 1, y: y + 1 } }
            let cus = cc.instantiate(this.customAvatar);
            cus.parent = this.levelMap;
            cus.getComponent(customBlockDesign).comfirmBearWidthAndHeight(rec, count)
            this.customBlockList.push([[rec.bottomLeft.x, rec.bottomLeft.y], [rec.topRight.x, rec.topRight.y], count, "custom_avarta"])
            this.customBlockNodeList.push(cus)
          }
        }
        else if (this.id == 41) {
          let size: number = +this.sizeBox.string
          let count: number = +this.countingBox.string
          this.frame = this.baseFrame;
          if (size == 1) {
            if (this.matrix[x][y] == 40)
              return
            cc.systemEvent.emit('REMOVENODE', { x: x, y: y, frame: this.baseFrame })
            this.matrix[x][y] = 40;
            cc.systemEvent.emit('REMOVENODE', { x: x, y: y, frame: this.baseFrame })
            let rec: Rectangle = { bottomLeft: { x: x, y: y }, topRight: { x: x, y: y } }
            let cus = cc.instantiate(this.customCan);
            cus.parent = this.levelMap;
            cus.getComponent(customBlockDesign).comfirmBearWidthAndHeight(rec, count)
            this.customBlockList.push([[rec.bottomLeft.x, rec.bottomLeft.y], [rec.topRight.x, rec.topRight.y], count, "custom_can"])
            this.customBlockNodeList.push(cus)
          } else {
            if (x + 2 > 8 || y + 2 > 8) { return }
            for (let i = x; i < x + 2; i++) {
              for (let j = y; j < y + 2; j++) {
                if (this.matrix[i][j] == 40) {
                  return
                }
              }
            }
            for (let i = x; i < x + 2; i++) {
              for (let j = y; j < y + 2; j++) {
                this.matrix[i][j] = 40
                cc.systemEvent.emit('REMOVENODE', { x: i, y: j, frame: this.baseFrame })
              }
            }
            let rec: Rectangle = { bottomLeft: { x: x, y: y }, topRight: { x: x + 1, y: y + 1 } }
            let cus = cc.instantiate(this.customCan);
            cus.parent = this.levelMap;
            cus.getComponent(customBlockDesign).comfirmBearWidthAndHeight(rec, count)
            this.customBlockList.push([[rec.bottomLeft.x, rec.bottomLeft.y], [rec.topRight.x, rec.topRight.y], count, "custom_can"])
            this.customBlockNodeList.push(cus)
          }
        }

        cc.systemEvent.emit('CHANGENODE', { x: eventData.x, y: eventData.y, img: this.frame, isGrass: isGrass, isBubble: isBubble, isNormal });
        break;
      case PHASE.REMOVE:
        this.matrix[x][y] = -2;
        this.bubbleMatrix[x][y] = -2;
        this.grassMatrix[x][y] = -2;

        cc.systemEvent.emit('REMOVENODE', { x: x, y: y, frame: this.baseFrame })
        break;
    }
  }

  swapToAdd() {
    this.phase = PHASE.ADD;
    this.phaseText.string = "PHASE: ADD"
  }
  swapToRemove() {
    this.phase = PHASE.REMOVE;
    this.phaseText.string = "PHASE: REMOVE"
  }
  startDragging(eventData) {
    if (this.id == 28) {
      if (this.grassMatrix[eventData.x][eventData.y] > -2) {
        this.startPoint.x = eventData.x;
        this.startPoint.y = eventData.y;
      }
      else {
        this.startPoint.x = -1;
        this.startPoint.y = -1;
      }
    }
  }
  endDragging(eventData) {
    if (this.startPoint.y == -1 || this.startPoint.x == -1 || this.id != 28)
      return;
    let temp = this.grassMatrix[this.startPoint.x][this.startPoint.y];
    //check all tile is grass 2
    let endPoint: Point = { x: eventData.x, y: eventData.y };
    console.log(this.startPoint)
    console.log(endPoint)
    let rec: Rectangle = {
      bottomLeft: {
        x: this.startPoint.x > endPoint.x ? endPoint.x : this.startPoint.x, y: this.startPoint.y > endPoint.y ? endPoint.y : this.startPoint.y
      }, topRight: {
        x: this.startPoint.x > endPoint.x ? this.startPoint.x : endPoint.x, y: this.startPoint.y > endPoint.y ? this.startPoint.y : endPoint.y
      }
    }
    for (let i = this.startPoint.x; i <= endPoint.x; i++) {
      for (let j = this.startPoint.y; j <= endPoint.y; j++) {
        if (this.grassMatrix[i][j] != temp) {
          return
        }
      }
    }
    let sq = cc.instantiate(this.squirrel);
    this.squirrelList.push(sq)

    console.log(rec)
    sq.getComponent(squirrelDesign).comfirmBearWidthAndHeight(rec);
    sq.parent = this.levelMap;
    console.log(sq.position)
    this.squirrelSquare.push([[this.startPoint.x, this.startPoint.y], [endPoint.x, endPoint.y]])
  }
  removeSquirrel() {
    if (this.squirrelList.length <= 0)
      return;
    let lastSq = this.squirrelList.pop();
    this.squirrelSquare.pop();
    lastSq.destroy();
  }

  removeCustom() {
    if (this.customBlockNodeList.length <= 0) {
      return;
    }
    let lastCustom = this.customBlockNodeList.pop();

    lastCustom.destroy();
    let pos = this.customBlockList.pop();
    for (let i = pos[0][0]; i <= pos[1][0]; i++)
      for (let j = pos[0][1]; j <= pos[1][1]; j++) {
        this.matrix[i][j] = -2;
      }
  }
  showMatrix() {
    let index = 1;
    let grassRectangles1 = this.findLargestRectangles(this.grassMatrix, index);
    grassRectangles1.forEach(element => {
      let bottomLeft = element.bottomLeft
      let topRight = element.topRight;
      this.grassSquare.push([[bottomLeft.x, bottomLeft.y], [topRight.x, topRight.y], index])
    });
    index = 2;
    grassRectangles1 = this.findLargestRectangles(this.grassMatrix, index);
    grassRectangles1.forEach(element => {
      let bottomLeft = element.bottomLeft
      let topRight = element.topRight;
      this.grassSquare.push([[bottomLeft.x, bottomLeft.y], [topRight.x, topRight.y], index])
    });
    let bubbleRectangles = this.findLargestRectangles(this.bubbleMatrix, 1);
    bubbleRectangles.forEach(element => {
      let bottomLeft = element.bottomLeft
      let topRight = element.topRight;
      this.bubbleSquare.push([[bottomLeft.x, bottomLeft.y], [topRight.x, topRight.y], 1])
    })
    let score = [];
    this.scoreStandard.forEach(element => {
      score.push(element.string)
    });
    let obj = {
      mapList: this.matrix,
      step: this.step.string,
      targetList: this.targetList,
      scoreStandard: score,
      customBLocks: this.customBlockList,
      grassList: this.grassSquare,
      stoneList: this.squirrelSquare,
      bubbleList: this.bubbleSquare
    }
    let jsonString = JSON.stringify(obj);
    jsonString = jsonString.replace(/\"/g, '')
    let a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(jsonString)], { type: 'application/json' }));
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
  }
  findLargestRectangles(matrix: number[][], id: number): Rectangle[] {
    const rectangles: Rectangle[] = [];
    const rows = matrix.length;
    const cols = matrix[0].length;

    // Kiểm tra xem từ điểm (i, j) có thể tạo hình chữ nhật không
    const canFormRectangle = (i: number, j: number, k: number, l: number): boolean => {
      for (let m = i; m <= k; m++) {
        for (let n = j; n <= l; n++) {
          if (matrix[m][n] != id) {
            return false;
          }
        }
      }
      return true;
    };

    // Duyệt qua ma trận để tìm các hình chữ nhật lớn nhất
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (matrix[i][j] == id) {
          let maxK = i, maxL = j;
          // Tìm hình chữ nhật lớn nhất có thể từ điểm (i, j)
          for (let k = i; k < rows; k++) {
            for (let l = j; l < cols; l++) {
              if (canFormRectangle(i, j, k, l)) {
                maxK = k; maxL = l;
              } else {
                break; // Nếu không thể mở rộng thêm, dừng việc tìm kiếm
              }
            }
          }
          rectangles.push({ bottomLeft: { x: maxK, y: j }, topRight: { x: i, y: maxL } });
          // Đánh dấu các ô đã được sử dụng trong hình chữ nhật lớn nhất
          for (let m = i; m <= maxK; m++) {
            for (let n = j; n <= maxL; n++) {
              matrix[m][n] = -2; // Cập nhật giá trị để tránh tìm lại
            }
          }
        }
      }
    }
    //duyet lai rectangles cho dung:
    for (let i = 0; i < rectangles.length; i++) {
      if (rectangles[i].bottomLeft.x > rectangles[i].topRight.x) {
        let swap = rectangles[i].bottomLeft.x;
        rectangles[i].bottomLeft.x = rectangles[i].topRight.x;
        rectangles[i].topRight.x = swap;
      }
      if (rectangles[i].bottomLeft.y > rectangles[i].topRight.y) {
        let swap = rectangles[i].bottomLeft.y;
        rectangles[i].bottomLeft.y = rectangles[i].topRight.y;
        rectangles[i].topRight.y = swap;
      }
    }
    return rectangles;
  }

  addemptyTarget() {
    let tar = cc.instantiate(this.targetControlPre);
    tar.parent = this.targetPos
    tar.getComponent(targetControl).setView(this.targetNode.length)
    tar.setPosition(0, -this.targetNode.length * 180);
    this.targetNode.push(tar);
  }
  addTarget(eventData) {
    this.targetList[eventData.idTarget] = [eventData.id, eventData.count];
  }
  removeLastTarget() {
    if (this.targetNode.length > 0) {
      let tar = this.targetNode.pop();
      tar.destroy();
    }
  }
}

enum PHASE {
  ADD = 0,
  REMOVE = 1,
}
type grassModified = [number[], number[], number];
type squirrelModified = [number[], number[]]
type Point = { x: number; y: number };
type customBlockModified = [number[], number[], number, string]
export type Rectangle = { bottomLeft: Point; topRight: Point };