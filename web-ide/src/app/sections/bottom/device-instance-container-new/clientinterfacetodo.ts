export const CLIENTINTERFACETODOJS = "/**\n * @param {number} ioPortIndex\n*/\nfunction _iod_create_html_interface(ioPortIndex) {\n    var _IODI_IOEVTTYPE_PORT_CLIENTBUFFERSIZE = 'clientbuffersize';\n    var _IODI_IOEVTTYPE_PORT_CLIENTREADABLELENGTH = 'clientreadablelength';\n    var _IODI_IOEVTTYPE_PORT_CLIENTWRITABLELENGTH = 'clientwritablelength';\n    var _IODI_IOEVTTYPE_PORT_FLUSHASCLIENT = 'flushasclient';\n    var _IODI_IOEVTTYPE_PORT_CLEARASCLIENT = 'clearasclient';\n    var _IODI_IOEVTTYPE_PORT_READASCLIENT = 'readasclient';\n    var _IODI_IOEVTTYPE_PORT_WRITEASCLIENT = 'writeasclient';\n    var _IODI_IOEVTTYPE_BUS_GETPORTSTATUS = 'getportstatus';\n\n    var _IODI_CLIENT_TO_HOST_EVENT_TYPE = 'iodi_c2h';\n    var _IODI_HOST_TO_CLIENT_EVENT_TYPE = 'iodi_h2c';\n    var _IODI_RESTRICTED_ARG_NAMES_LWR = ['eventid', 'ioeventtype', 'ioportindex'];\n\n    /** @type {{[eventId:number]:{resolver:(v:any)=>void,startTime:number}}} */\n    var __iodi_pending_events = {};\n    \n    var __iodi_nextEventId = 1;\n    function _iodi_assignEventId() {\n        var __iodi_aid = __iodi_nextEventId;\n        if (__iodi_nextEventId < Number.MAX_SAFE_INTEGER - 1) {\n            __iodi_nextEventId++;\n        } else {\n            __iodi_nextEventId = 0;\n        }\n        return __iodi_aid;\n    }\n\n    function _iodi_execEventCycle(ioEventType, additionalArgs) {\n        return new Promise(function (resolve, reject) {\n            try {\n                var __iodi_eec_eventId = _iodi_assignEventId();\n                var __iodi_execEventCycle_detail = {\n                    eventId: __iodi_eec_eventId,\n                    ioEventType: ioEventType,\n                    ioPortIndex: ioPortIndex\n                };\n\n                var __iodi_execEventCycle_additionalArgKeys = !!additionalArgs ? Object.keys(additionalArgs) : [];\n                if (__iodi_execEventCycle_additionalArgKeys.length > 0) {\n                    for (var _i = 0; _i < __iodi_execEventCycle_additionalArgKeys.length; _i++) {\n                        var __iodi_execEventCycle_additionalArg_currentKey = __iodi_execEventCycle_additionalArgKeys[_i];\n                        if (_IODI_RESTRICTED_ARG_NAMES_LWR.includes(__iodi_execEventCycle_additionalArg_currentKey.toLowerCase())) {\n                            throw new Error(`restricted arg name: ${__iodi_execEventCycle_additionalArg_currentKey}`);\n                        } else {\n                            __iodi_execEventCycle_detail[__iodi_execEventCycle_additionalArg_currentKey] = additionalArgs[__iodi_execEventCycle_additionalArg_currentKey];\n                        }\n                    }\n                }\n\n                var __iodi_execEventCycle_evt = new CustomEvent(_IODI_CLIENT_TO_HOST_EVENT_TYPE, {\n                    detail: __iodi_execEventCycle_detail\n                });\n\n                __iodi_pending_events[__iodi_eec_eventId] = {\n                    resolver: resolve,\n                    startTime: Date.now()\n                };\n\n                document.dispatchEvent(__iodi_execEventCycle_evt);\n            } catch (exc) {\n                reject(exc.message || 'execEventCycle exception');\n            }\n        });\n    }\n\n    var _iodi_interface = {\n        getClientBufferSize: function () {\n            return new Promise(function (resolve, reject) {\n                _iodi_execEventCycle(_IODI_IOEVTTYPE_PORT_CLIENTBUFFERSIZE).then(function (data) {\n                    resolve(Number.parseInt(data));\n                }).catch(function (err) {\n                    reject(err);\n                });\n            });\n        },\n        getClientReadableLength: function () {\n            return new Promise(function (resolve, reject) {\n                _iodi_execEventCycle(_IODI_IOEVTTYPE_PORT_CLIENTREADABLELENGTH).then(function (data) {\n                    resolve(Number.parseInt(data));\n                }).catch(function (err) {\n                    reject(err);\n                });\n            });\n        },\n        getClientWritableLength: function () {\n            return new Promise(function (resolve, reject) {\n                _iodi_execEventCycle(_IODI_IOEVTTYPE_PORT_CLIENTWRITABLELENGTH).then(function (data) {\n                    resolve(Number.parseInt(data));\n                }).catch(function (err) {\n                    reject(err);\n                });\n            });\n        },\n        readAsClient: function () {\n            return new Promise(function (resolve, reject) {\n                _iodi_execEventCycle(_IODI_IOEVTTYPE_PORT_READASCLIENT).then(function (data) {\n                    resolve(Number.parseInt(data));\n                }).catch(function (err) {\n                    reject(err);\n                });\n            });\n        },\n        writeAsClient: function (b) {\n            return new Promise(function (resolve, reject) {\n                var __iodi_writeAsClientParam = b.toString();\n                _iodi_execEventCycle(_IODI_IOEVTTYPE_PORT_WRITEASCLIENT, {\n                    value: __iodi_writeAsClientParam\n                }).then(function (data) {\n                    resolve(data === 'true');\n                }).catch(function (err) {\n                    reject(err);\n                });\n            });\n        },\n        flushAsClient: function () {\n            return new Promise(function (resolve, reject) {\n                _iodi_execEventCycle(_IODI_IOEVTTYPE_PORT_FLUSHASCLIENT).then(function (data) {\n                    resolve(data === 'true');\n                }).catch(function (err) {\n                    reject(err);\n                });\n            });\n        },\n        clearAsClient: function () {\n            return new Promise(function (resolve, reject) {\n                _iodi_execEventCycle(_IODI_IOEVTTYPE_PORT_CLEARASCLIENT).then(function (data) {\n                    resolve(data === 'true');\n                }).catch(function (err) {\n                    reject(err);\n                });\n            });\n        },\n        getPortStatus: function () {\n            return new Promise(function (resolve, reject) {\n                _iodi_execEventCycle(_IODI_IOEVTTYPE_BUS_GETPORTSTATUS).then(function (data) {\n                    resolve(data);\n                }).catch(function (err) {\n                    reject(err);\n                });\n            });\n        }\n    }\n\n    document.addEventListener(_IODI_HOST_TO_CLIENT_EVENT_TYPE, function (event) {\n        if (!!__iodi_pending_events[event.detail.eventId]) {\n            try {\n                __iodi_pending_events[event.detail.eventId].resolver(event.detail.responseText);\n                delete __iodi_pending_events[event.detail.eventId];\n            } catch (exc) { }\n        }\n    });\n\n    window.setTimeout(function () {\n        var _iodi_ready_ind = document.createElement('div');\n        _iodi_ready_ind.id = '$device-ready-ind';\n        document.body.appendChild(_iodi_ready_ind);\n    }, 500);\n\n    return _iodi_interface;\n}\n\nif (!!globalThis && !!globalThis.exports) {\n    exports._iod_create_html_interface = _iod_create_html_interface;\n}"