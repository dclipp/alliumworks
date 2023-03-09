function awGetProp(selector) {
    try {
        var gpNavCurrent = window.navigator;
        for (var gpIndex = 0; gpIndex < selector.length; gpIndex++) {
            gpNavCurrent = gpNavCurrent[selector[gpIndex]];
        }
        return gpNavCurrent.toString();
    } catch (e) {
        return '';
    }
}

function awGetNavInfo() {
    var awGetInfo_userAgent = awGetProp(['userAgent']).replace(/ /g, '').replace(/Mozilla/gi, '#M').replace(/\.NET/gi, '#N');
    var awGetInfo_onLine = awGetProp(['onLine']);
    var awGetInfo_deviceMemory = awGetProp(['deviceMemory']);
    var awGetInfo_effectiveType = awGetProp(['connection', 'effectiveType']);
    var awGetInfo_connectionSpeed = awGetProp(['connectionSpeed']);
    var awGetInfo_connection = awGetInfo_effectiveType || awGetInfo_connectionSpeed;
    var awGetInfo_platform = awGetProp(['platform']);
    var awGetInfo_language = awGetProp(['language']);

    var awGetInfoStr = '{' + (awGetInfo_userAgent.length > 160 ? awGetInfo_userAgent.substring(0, 160) : awGetInfo_userAgent) + '}'
        + '{' + (awGetInfo_onLine ? '1' : '0') + '}'
        + '{' + awGetInfo_deviceMemory + '}'
        + '{' + awGetInfo_connection + '}'
        + '{' + awGetInfo_platform + '}'
        + '{' + awGetInfo_language + '}'
    return awGetInfoStr;
}