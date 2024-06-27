
const { ccclass, property } = cc._decorator;
@ccclass
export default class EditScene extends cc.Component {
    onLoad(){
      cc.game.addPersistRootNode(this.node)
    }

    
}