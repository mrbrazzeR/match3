const { ccclass, property } = cc._decorator;

@ccclass
export default class colorLimitBlock extends cc.Component {
    id: number;
    targetId:number;
    
    set(id: number, target:number) {
        this.id = id;
        this.targetId=target;
    }

    choose(){
       let fr= this.getComponent(cc.Sprite).spriteFrame;
        cc.systemEvent.emit('COLORLIMIT',{id:this.id+1,frame:fr,targetId:this.targetId})
    }
}