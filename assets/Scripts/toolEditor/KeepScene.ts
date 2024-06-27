const { ccclass, property } = cc._decorator;

@ccclass
export default class keepScene extends cc.Component {

    @property (cc.Node)
    designNode:cc.Node=null;

    @property(cc.Node)
    header:cc.Node=null;

    protected onLoad(): void {
        cc.game.addPersistRootNode(this.node)
        cc.systemEvent.on("TESTLEVEL",this.testLevel,this)
    }

    testLevel(eventData){
        this.designNode.active=false;
        this.header.active=true;
        cc.systemEvent.emit("SETUPLEVEL",eventData)
        console.log("test new level", eventData)
    }
    finishTest(){
        this.designNode.active=true;
        this.header.active=false;
    }
}