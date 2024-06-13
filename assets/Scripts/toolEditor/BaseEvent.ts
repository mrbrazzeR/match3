const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseEvent {
    listeners = {};
    constructor() { }

    public addEventListener(type: string, callback: Function, target: Object) {
        if (!(type in this.listeners)) {
            this.listeners[type] = [];
        }
        this.listeners[type].push({ target, callback });
    }

    public removeEventListener(type: string, callback: Function, target: Object) {
        if (!(type in this.listeners)) {
            return;
        }
        let stack = this.listeners[type];
        for (let i = 0, l = stack.length; i < l; i++) {
            if (stack[i].target === target && stack[i].callback === callback) {
                stack.splice(i, 1);
                return;
            }
        }
    }

    public dispatchEvent(type: string, data: any = null) {
        let event = new cc.Event.EventCustom(type, true);
        event.detail = data;

        if (!(event.type in this.listeners)) {
            return true;
        }
        let stack = this.listeners[event.type].slice();

        for (let i = 0, l = stack.length; i < l; i++) {
            stack[i].callback.call(stack[i].target, data);
        }

    }

}