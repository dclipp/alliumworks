var IO_HTML_INTERFACE = 'function _iod_create_html_interface(d){var t="computerstatechanged",i="deviceremoved",r="presentationareachanged",o="movedtoseparatewindow",c="movedtomainwindow",l=["eventid","ioeventtype","ioportindex"],v={},m=1;var u={},a=1;function s(e){var n=a;return a<Number.MAX_SAFE_INTEGER-1?a++:a=0,e+n.toString()}function f(s,f){return new Promise(function(e,n){try{var t=((a=m)<Number.MAX_SAFE_INTEGER-1?m++:m=0,a),i={eventId:t,ioEventType:s,ioPortIndex:d},r=f?Object.keys(f):[];if(0<r.length)for(var o=0;o<r.length;o++){var c=r[o];if(l.includes(c.toLowerCase()))throw new Error(`restricted arg name: ${c}`);i[c]=f[c]}var u=new CustomEvent("iodi_c2h",{detail:i});v[t]={resolver:e,startTime:Date.now()},document.dispatchEvent(u)}catch(e){n(e.message||"execEventCycle exception")}var a})}var e={getClientBufferSize:function(){return new Promise(function(n,t){f("clientbuffersize").then(function(e){n(Number.parseInt(e))}).catch(function(e){t(e)})})},getClientReadableLength:function(){return new Promise(function(n,t){f("clientreadablelength").then(function(e){n(Number.parseInt(e))}).catch(function(e){t(e)})})},getClientWritableLength:function(){return new Promise(function(n,t){f("clientwritablelength").then(function(e){n(Number.parseInt(e))}).catch(function(e){t(e)})})},readAsClient:function(){return new Promise(function(n,t){f("readasclient").then(function(e){n("client read",Number.parseInt(e))}).catch(function(e){t(e)})})},writeAsClient:function(e){return new Promise(function(n,t){f("writeasclient",{value:e.toString()}).then(function(e){n("true"===e)}).catch(function(e){t(e)})})},flushAsClient:function(){return new Promise(function(n,t){f("flushasclient").then(function(e){n("true"===e)}).catch(function(e){t(e)})})},clearAsClient:function(){return new Promise(function(n,t){f("clearasclient").then(function(e){n("true"===e)}).catch(function(e){t(e)})})},writeToLog:function(t){new Promise(function(e,n){f("writetolog",{message:t}).then(function(){e()}).catch(function(e){n(e)})}).then(function(){})},writeSessionData:function(e){return new Promise(function(n,t){f("writesessiondata",{sessionData:e}).then(function(e){n("true"===e)}).catch(function(e){t(e)})})},getPortStatus:function(){return new Promise(function(n,t){f("getportstatus").then(function(e){n(e)}).catch(function(e){t(e)})})},computerStateChanged:function(e){var n=s(t);return u[n]={eventType:t,cb:e},{remove:function(){u[n]&&delete u[n]}}},deviceRemoved:function(e){var n=s(i);return u[n]={eventType:i,cb:e},{remove:function(){u[n]&&delete u[n]}}},presentationAreaChanged:function(e){var n=s(r);return u[n]={eventType:r,cb:e},{remove:function(){u[n]&&delete u[n]}}},movedToSeparateWindow:function(e){var n=s(o);return u[n]={eventType:o,cb:e},{remove:function(){u[n]&&delete u[n]}}},movedToMainWindow:function(e){var n=s(c);return u[n]={eventType:c,cb:e},{remove:function(){u[n]&&delete u[n]}}},publicInterface:{restoreSessionData:function(e){return $IOPI_HANDLE_RESTORE_SESSION?$IOPI_HANDLE_RESTORE_SESSION(e):Promise.resolve(!0)},restorePersistentData:function(e){return $IOPI_HANDLE_INIT_INSTANCE?$IOPI_HANDLE_INIT_INSTANCE(e):Promise.resolve(!0)},beginDetach:function(){return $IOPI_CHECK_PENDING_DATA_STATE?$IOPI_CHECK_PENDING_DATA_STATE():Promise.resolve(!1)},finishDetachSavePersistent:function(){return $IOPI_HANDLE_PRE_DETACH_SAVE?$IOPI_HANDLE_PRE_DETACH_SAVE():Promise.resolve(null)},saveSessionData:function(){return new Promise(function(n,t){$IOPI_GET_SESSION_DATA?$IOPI_GET_SESSION_DATA().then(function(e){n(e)}).catch(function(e){t(e)}):n(null)})}}};return document.addEventListener("iodi_h2c",function(e){if(v[e.detail.eventId])try{v[e.detail.eventId].resolver(e.detail.responseText),delete v[e.detail.eventId]}catch(e){}}),document.addEventListener("iodi_lnr",function(e){for(var n=Object.keys(u),t=0;t<n.length;t++){var i=u[n[t]];i.eventType===e.detail.listenerEventType&&i.cb(e.detail.callbackData)}}),window.setTimeout(function(){var e=document.createElement("div");e.id="$device-ready-ind",document.body.appendChild(e)},500),e}'