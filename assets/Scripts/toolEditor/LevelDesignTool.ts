import blockDesign from "./blockDesign";
import colorLimitControl from "./colorLimitControl";
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

  @property(cc.Node)
  colorLimitPos: cc.Node = null;
  @property(cc.Prefab)
  colorLimitPre: cc.Prefab = null;

  @property(cc.EditBox)
  levelText: cc.EditBox = null;


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

  private colorLimitList: number[] = [];
  private colorNode: cc.Node[] = [];

  frameNode: cc.Node[] = [];
  mapNode: cc.Node[][] = [];
  private frame: cc.SpriteFrame;
  private id: number;
  private phase: PHASE;
  private startPoint: Point = null;
  score: number[] = [];
  tempAvatar: number = 0;
  tempCan: number = 0;
  tempLevel: string = "";
  cacheLevel: any[] = [];
  curLevel: number = 0;
  tempStep: number = 0;
  jsonLevel:cc.JsonAsset=null;
  onLoad() {
    this.startPoint = { x: -1, y: -1 };
    cc.systemEvent.on('BLOCKCLICK', this.getBlock, this);
    cc.systemEvent.on('LEVELNODECLICK', this.changeNode, this);
    cc.systemEvent.on('STARTDRAGGING', this.startDragging, this)
    cc.systemEvent.on('ENDDRAGGING', this.endDragging, this)
    cc.systemEvent.on('SAVE', this.addTarget, this)
    cc.systemEvent.on('COLORLIMIT', this.addColorLimit, this)
    this.phase = PHASE.ADD;
    this.readDataFromJson();
  }

  protected start(): void {
    let index = 0;
    for (let i = 0; i < 45; i++) {
      //normal tile
      if (i >= 0 && i <= 12) {
        var b = cc.instantiate(this.block);
        b.getComponent(blockDesign).changeStoneNum(i);
        let row = index % 10;
        let col = Math.floor(index / 10);
        b.parent = this.spawnPosition;
        b.setPosition(row * 73, col * 73)
        b.setContentSize(70, 70)
        index++;
        this.frameNode.push(b)
      }
      //Various special types
      else if (i >= 20) {
        var b = cc.instantiate(this.block);
        b.getComponent(blockDesign).changeStoneNum(i);
        let row = index % 10;
        let col = Math.floor(index / 10);
        b.parent = this.spawnPosition;
        b.setPosition(row * 73, col * 73)
        b.setContentSize(70, 70)
        index++;
        this.frameNode.push(b)
      }
    }

    //setup
    this.mapNode = Array(9).fill(null).map(() => Array(9).fill(null));
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        var n = cc.instantiate(this.levelNode);
        n.parent = this.levelMap;
        n.setPosition(i * 75, j * 75);
        n.getComponent(levelNode).setPos(i, j)
        this.mapNode[j][i] = n;
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
            if (this.customBlockList[temp][3] == "custom_can") {
              this.tempCan -= 9;
            }
            else {
              this.tempAvatar--;
            }
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
          this.bubbleMatrix[x][y] = -2;
          isNormal = true;
        }
        else if (this.id >= 20 && this.id <= 39 && this.id != 38 && this.id != 28) {
          //main view block
          this.matrix[eventData.x][eventData.y] = this.id;
          this.bubbleMatrix[x][y] = -2;
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
            if (this.matrix[x][y] == 40 || this.matrix[x][y] == 41)
              return

            cc.systemEvent.emit('REMOVENODE', { x: x, y: y, frame: this.baseFrame })
            this.matrix[x][y] = 40;
            let rec: Rectangle = { bottomLeft: { x: x, y: y }, topRight: { x: x, y: y } }
            let cus = cc.instantiate(this.customAvatar);
            cus.parent = this.levelMap;
            cus.getComponent(customBlockDesign).comfirmBearWidthAndHeight(rec, count)
            this.customBlockList.push([[rec.bottomLeft.x, rec.bottomLeft.y], [rec.topRight.x, rec.topRight.y], count, "custom_avarta"])
            this.customBlockNodeList.push(cus)
            this.tempAvatar++;
          } else {
            if (x > 7 || y > 7) { return }
            for (let i = x; i < x + 2; i++) {
              for (let j = y; j < y + 2; j++) {
                if (this.matrix[i][j] == 41 || this.matrix[i][j] == 40) {
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
            this.tempAvatar++;
          }
        }
        else if (this.id == 41) {
          let size: number = +this.sizeBox.string
          let count: number = +this.countingBox.string
          this.frame = this.baseFrame;
          if (size == 1) {
            if (this.matrix[x][y] == 40 || this.matrix[x][y] == 41)
              return
            cc.systemEvent.emit('REMOVENODE', { x: x, y: y, frame: this.baseFrame })
            this.matrix[x][y] = 41;
            cc.systemEvent.emit('REMOVENODE', { x: x, y: y, frame: this.baseFrame })
            let rec: Rectangle = { bottomLeft: { x: x, y: y }, topRight: { x: x, y: y } }
            let cus = cc.instantiate(this.customCan);
            cus.parent = this.levelMap;
            if (count != 9) count = 9;
            cus.getComponent(customBlockDesign).comfirmBearWidthAndHeight(rec, count)
            this.customBlockList.push([[rec.bottomLeft.x, rec.bottomLeft.y], [rec.topRight.x, rec.topRight.y], count, "custom_can"])
            this.customBlockNodeList.push(cus)
            this.tempCan += 9;
          } else {
            if (x > 7 || y > 7) { return }
            for (let i = x; i < x + 2; i++) {
              for (let j = y; j < y + 2; j++) {
                if (this.matrix[i][j] == 41 || this.matrix[i][j] == 40) {
                  return
                }
              }
            }
            for (let i = x; i < x + 2; i++) {
              for (let j = y; j < y + 2; j++) {
                this.matrix[i][j] = 41
                cc.systemEvent.emit('REMOVENODE', { x: i, y: j, frame: this.baseFrame })
              }
            }
            let rec: Rectangle = { bottomLeft: { x: x, y: y }, topRight: { x: x + 1, y: y + 1 } }
            let cus = cc.instantiate(this.customCan);
            cus.parent = this.levelMap;
            if (count != 9) count = 9;
            cus.getComponent(customBlockDesign).comfirmBearWidthAndHeight(rec, count)
            this.customBlockList.push([[rec.bottomLeft.x, rec.bottomLeft.y], [rec.topRight.x, rec.topRight.y], count, "custom_can"])
            this.customBlockNodeList.push(cus)
            this.tempCan += 9
          }
        }
        else if (this.id == 42) {
          this.matrix[eventData.x][eventData.y] = this.id;
          isNormal = true;
        }

        cc.systemEvent.emit('CHANGENODE', { x: eventData.x, y: eventData.y, img: this.frame, isGrass: isGrass, isBubble: isBubble, isNormal });
        break;
      case PHASE.REMOVE:
        if (this.id == 40 || this.id == 41) { return }
        this.matrix[x][y] = -2;
        this.bubbleMatrix[x][y] = -2;
        this.grassMatrix[x][y] = -2;

        cc.systemEvent.emit('REMOVENODE', { x: x, y: y, frame: this.baseFrame })
        break;
    }
  }
  testAdd() {
    let cus = cc.instantiate(this.customCan);
    cus.parent = this.levelMap;
    let rec: Rectangle = { bottomLeft: { x: 1, y: 1 }, topRight: { x: 1, y: 1 } }
    cus.getComponent(customBlockDesign).comfirmBearWidthAndHeight(rec, 9)
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
    sq.getComponent(squirrelDesign).comfirmBearWidthAndHeight(rec);
    sq.parent = this.levelMap;
    this.squirrelSquare.push([[rec.bottomLeft.x, rec.bottomLeft.y], [rec.topRight.x, rec.topRight.y]])
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
    if (pos[3] == "custom_avarta") {
      this.tempAvatar--;
    }
    if (pos[3] == "custom_can") {
      this.tempCan -= 9
    }
    for (let i = pos[0][0]; i <= pos[1][0]; i++)
      for (let j = pos[0][1]; j <= pos[1][1]; j++) {
        this.matrix[i][j] = -2;
      }
  }
  loadMatrix() {
    this.curLevel = +this.levelText.string
    let existLevel = this.cacheLevel[this.curLevel];
    //clear object instantiate
    this.removeObject();
    if (existLevel) {
      //exist level
      console.log("load")
      let lv = JSON.parse(JSON.stringify(this.cacheLevel[this.curLevel]));
      this.matrix = lv.mapList;
      this.tempStep = lv.step;
      this.targetList = lv.targetList;
      this.score = lv.scoreStandard;
      this.colorLimitList = lv.colorLimit;
      this.customBlockList = lv.customBlocks;
      this.grassSquare = lv.grassList;
      this.squirrelSquare = lv.stoneList;
      this.bubbleSquare = lv.bubbleList;
      //render
      this.grassMatrix = Array(9).fill(null).map(() => Array(9).fill(-2));
      this.bubbleMatrix = Array(9).fill(null).map(() => Array(9).fill(-2));
      this.renderSingleNode();
      this.renderGrassNode();
      this.renderBubbleNode();
      this.renderSquirrelNode();
      this.renderCustomNode();
      this.renderTargetNode();
      this.renderColorNode();
      this.renderStepAndScore();
    }
    else {
      //reset tile
      this.matrix = Array(9).fill(null).map(() => Array(9).fill(-2));
      this.grassMatrix = Array(9).fill(null).map(() => Array(9).fill(-2));
      this.bubbleMatrix = Array(9).fill(null).map(() => Array(9).fill(-2));
      this.removeObject();
      this.renderSingleNode()
      this.tempStep = 0;
      this.targetList = [];
      this.score = [];
      this.colorLimitList = [];
      this.customBlockList = [];
      this.grassSquare = [];
      this.squirrelSquare = [];
      this.bubbleSquare = []
    }
  }
  removeObject() {
    //remove squirrel
    this.squirrelList.forEach(element => {
      element.destroy();
    });
    this.squirrelList = [];
    //remove custom
    this.customBlockNodeList.forEach(element => {
      element.destroy();
    });
    this.customBlockNodeList = [];
    //remove target
    this.targetNode.forEach(element => {
      element.destroy();
    });
    this.targetNode = [];
    //remove color limit
    this.colorNode.forEach(element => {
      element.destroy();
    });
    this.colorNode = [];
  }
  renderSingleNode() {
    for (let i = 0; i < 9; i++)
      for (let j = 0; j < 9; j++) {
        //normal node:
        if (this.matrix[i][j] == 40 || this.matrix[i][j] == 41) {
          continue
        }
        else {
          //get frame
          this.frameNode.forEach(element => {
            let e = element.getComponent(blockDesign);
            if (e._stoneType == this.matrix[i][j]) {
              let view = e.view.getComponent(cc.Sprite).spriteFrame
              this.mapNode[i][j].getComponent(levelNode).setFrame(view)
            }
            else if (this.matrix[i][j] == -2) {
              this.mapNode[i][j].getComponent(levelNode).setFrame(this.baseFrame)
            }
          });
        }
      }
  }
  renderBubbleNode() {
    this.bubbleSquare.forEach(element => {
      for (let i = element[0][0]; i <= element[1][0]; i++) {
        for (let j = element[0][1]; j <= element[1][1]; j++) {
          this.bubbleMatrix[i][j] = 1
          this.mapNode[i][j].getComponent(levelNode).setBubble(true)
          this.bubbleMatrix[i][j] = 1;
        }
      }
    });
  }
  renderGrassNode() {
    this.grassSquare.forEach(element => {
      for (let i = element[0][0]; i <= element[1][0]; i++) {
        for (let j = element[0][1]; j <= element[1][1]; j++) {
          this.grassMatrix[i][j] = element[2]
          if (element[2] == 1) {
            this.frameNode.forEach(node => {
              let e = node.getComponent(blockDesign);
              if (e._stoneType == 12) {
                let view = e.view.getComponent(cc.Sprite).spriteFrame
                this.mapNode[i][j].getComponent(levelNode).setGrass(true, view)
              }
            });
          }
          if (element[2] == 2) {
            this.frameNode.forEach(node => {
              let e = node.getComponent(blockDesign);
              if (e._stoneType == 11) {
                let view = e.view.getComponent(cc.Sprite).spriteFrame
                this.mapNode[i][j].getComponent(levelNode).setGrass(true, view)
              }
            });
          }
        }
      }
    })
  }
  renderSquirrelNode() {
    this.squirrelSquare.forEach(element => {
      let rec: Rectangle = { bottomLeft: { x: element[0][0], y: element[0][1] }, topRight: { x: element[1][0], y: element[1][1] } }
      let sq = cc.instantiate(this.squirrel);
      this.squirrelList.push(sq)
      sq.getComponent(squirrelDesign).comfirmBearWidthAndHeight(rec);
      sq.parent = this.levelMap;
    });
  }
  renderCustomNode() {
    this.customBlockList.forEach(element => {
      let rec: Rectangle = { bottomLeft: { x: element[0][0], y: element[0][1] }, topRight: { x: element[1][0], y: element[1][1] } }
      if (element[3] == "custom_avarta") {
        let cus = cc.instantiate(this.customAvatar);
        cus.parent = this.levelMap;
        cus.getComponent(customBlockDesign).comfirmBearWidthAndHeight(rec, element[2])
        this.customBlockNodeList.push(cus)
      }
      else {
        let cus = cc.instantiate(this.customCan);
        cus.parent = this.levelMap;
        cus.getComponent(customBlockDesign).comfirmBearWidthAndHeight(rec, element[2])
        this.customBlockNodeList.push(cus)
      }
    });
  }
  renderTargetNode() {
    this.targetList.forEach(element => {
      let tar = cc.instantiate(this.targetControlPre);
      tar.parent = this.targetPos
      tar.getComponent(targetControl).setView(this.targetNode.length)
      tar.getComponent(targetControl).setExistId(element[0], element[1])
      tar.setPosition(0, -this.targetNode.length * 180);
      this.targetNode.push(tar);
    });
  }
  renderColorNode() {
    this.colorLimitList.forEach(element => {
      let tar = cc.instantiate(this.colorLimitPre);
      tar.parent = this.colorLimitPos
      tar.getComponent(colorLimitControl).setView(this.colorNode.length)
      tar.getComponent(colorLimitControl).setExistColor(element)
      tar.setPosition(0, -this.colorNode.length * 80);
      this.colorNode.push(tar);
    });
  }
  renderStepAndScore() {
    for (let i = 0; i < this.scoreStandard.length; i++) {
      this.scoreStandard[i].string = this.score[i].toString();
    }
    this.step.string = this.tempStep.toString()
  }
  testMatrix() {
    let index = 1;
    this.grassSquare = [];
    this.bubbleSquare = [];
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
    this.score = [];
    this.scoreStandard.forEach(element => {
      this.score.push(+element.string)
    });
    //avarta
    if (this.tempAvatar > 0) {
      let index = this.targetList.findIndex(item => item[0] === 40);
      if (index !== -1) {
        this.targetList[index][1] = this.tempAvatar
      } else {
        this.targetList.push([40, this.tempAvatar])
      }
    }
    //can
    if (this.tempCan > 0) {
      let index = this.targetList.findIndex(item => item[0] === 41);
      if (index !== -1) {
        this.targetList[index][1] = this.tempCan
      } else {
        this.targetList.push([41, this.tempCan])
      }
    }
    this.tempStep = +this.step.string;
    let obj = {
      mapList: this.matrix,
      step: this.tempStep,
      targetList: this.targetList,
      scoreStandard: this.score,
      colorLimit: this.colorLimitList,
      customBlocks: this.customBlockList,
      grassList: this.grassSquare,
      stoneList: this.squirrelSquare,
      bubbleList: this.bubbleSquare
    }
    cc.systemEvent.emit("TESTLEVEL", obj)
  }
  saveMatrix() {
    let index = 1;
    this.grassSquare = [];
    this.bubbleSquare = [];
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
    this.score = [];
    this.scoreStandard.forEach(element => {
      this.score.push(+element.string)
    });
    //avarta
    if (this.tempAvatar > 0) {
      let index = this.targetList.findIndex(item => item[0] === 40);
      if (index !== -1) {
        this.targetList[index][1] = this.tempAvatar
      }
      else {
        this.targetList.push([40, this.tempAvatar])
      }
    }
    //can
    if (this.tempCan > 0) {
      let index = this.targetList.findIndex(item => item[0] === 41);
      if (index !== -1) {
        this.targetList[index][1] = this.tempCan
      }
      else {
        this.targetList.push([41, this.tempCan])
      }
    }
    this.tempStep = +this.step.string;
    let obj = {
      mapList: this.matrix,
      step: this.tempStep,
      targetList: this.targetList,
      scoreStandard: this.score,
      colorLimit: this.colorLimitList,
      customBlocks: this.customBlockList,
      grassList: this.grassSquare,
      stoneList: this.squirrelSquare,
      bubbleList: this.bubbleSquare
    }
    this.cacheLevel[this.curLevel] = obj;
  }
  removeMatrix(){
    this.cacheLevel.splice(this.curLevel,1);
    this.matrix = Array(9).fill(null).map(() => Array(9).fill(-2));
    this.grassMatrix = Array(9).fill(null).map(() => Array(9).fill(-2));
    this.bubbleMatrix = Array(9).fill(null).map(() => Array(9).fill(-2));
    this.removeObject();
    this.renderSingleNode()
    this.tempStep = 0;
    this.targetList = [];
    this.score = [];
    this.colorLimitList = [];
    this.customBlockList = [];
    this.grassSquare = [];
    this.squirrelSquare = [];
    this.bubbleSquare = []
  }
  saveToFile() {
    let jsonString = JSON.stringify(this.cacheLevel);
    const removedBackslashesString = jsonString.replace(/\\/g, '');
    let modifiedString = removedBackslashesString.replaceAll("custom_avarta", "'custom_avarta'");
    modifiedString = modifiedString.replaceAll("custom_can", "'custom_can'")
    this.tempLevel = modifiedString;
    this.jsonLevel.json=modifiedString;
    let a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([this.jsonLevel.json], { type: 'application/json' }));
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
    if (eventData.id == 41)
      this.targetList[eventData.idTarget] = [eventData.id, this.tempCan];
    else if (eventData.id == 40) {
      if (eventData.count > this.tempAvatar)
        this.targetList[eventData.idTarget] = [eventData.id, this.tempAvatar];
    }
    else { this.targetList[eventData.idTarget] = [eventData.id, eventData.count]; }
  }
  removeLastTarget() {
    if (this.targetNode.length > 0) {
      let tar = this.targetNode.pop();
      tar.destroy();
    }
    while (this.targetList.length > this.targetNode.length) { this.targetList.pop(); }
  }
  addColorLimit(eventData) {
    this.colorLimitList[eventData.targetId] = eventData.id;
  }

  addemptyColor() {
    let tar = cc.instantiate(this.colorLimitPre);
    tar.parent = this.colorLimitPos
    tar.getComponent(colorLimitControl).setView(this.colorNode.length)
    tar.setPosition(0, -this.colorNode.length * 80);
    this.colorNode.push(tar);
  }
  removeLastColor() {
    if (this.colorNode.length > 0) {
      this.colorLimitList.pop();
      let tar = this.colorNode.pop();
      tar.destroy();
    }
  }
  readDataFromJson() {
    cc.assetManager.loadBundle("Data", (err, bundle) => {
      if (err) {
        // reject("Failed to load data bundle: ${err}");
        console.log("err")
        return;
      }
      bundle.load("LevelData", cc.JsonAsset, (err, data: cc.JsonAsset) => {
        if (err) {
            console.log("err")
        }
        else {
          console.log(data)
          this.cacheLevel=data.json
          this.jsonLevel=data;
        }
      })
    })
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