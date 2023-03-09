// export class VDom {
//     static getElementById(instanceId, id) {
//         return document.getElementById(`${instanceId}_${id}`);
//     }

//     static getTextAreaElement(instanceId) {
//         return document.getElementById(`${instanceId}`);
//     }

//     static getCodeMirrorElement(instanceId) {
//         const e = VDom.getTextAreaElement(instanceId);
//         return !!e ? e.nextElementSibling : null;
//     }

//     // static getElementsByClassName
// }
export class VDom {
    getElementById(id) {
        return document.getElementById(`${this._instanceId}_${id}`);
    }

    getTextAreaElement() {
        return document.getElementById(`${this._instanceId}`);
    }

    getCodeMirrorElement() {
        const e = this.getTextAreaElement();
        return !!e ? e.nextElementSibling : null;
    }

    getElementsByClassName(classNames) {
        return this.getCodeMirrorElement().getElementsByClassName(classNames);
    }

    constructor(instanceId) {
        this._instanceId = instanceId;
    }
}