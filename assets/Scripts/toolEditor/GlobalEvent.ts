import BaseEvent from "./BaseEvent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GlobalEvent extends BaseEvent {
    private static event: GlobalEvent;

    static instance(): GlobalEvent {
        if (!GlobalEvent.event) {
            GlobalEvent.event = new GlobalEvent();
        }

        return GlobalEvent.event;
    }

    static SAVE_DATA: string = "SAVE_DATA";
    static ISDRAGGING: boolean=false;

}