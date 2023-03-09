export class ExternalWrapper {
    static getBlockAddress(externalsObj, param, action) {
        if (!!externalsObj && !!externalsObj.getBlockAddress) {
            const p = externalsObj.getBlockAddress(param);
    
            if (Number.isInteger(p)) {
                action(p);
            }
        }
    }

    static getNumericValueForRegRef(externalsObj, param, action) {
        if (!!externalsObj && !!externalsObj.getNumericValueForRegRef) {
            const p = externalsObj.getNumericValueForRegRef(param);
    
            if (Number.isInteger(p)) {
                action(p);
            }
        }
    }
}