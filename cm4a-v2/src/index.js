function initModule() {
    window.tracer = new Tracer(true, false, true);
    window.cm = new CModule(CodeMirror, 'code', 'obj1', {
      sourceMap: 'TODO',
      library: textLibrary
    }, window.tracer);

    window.cm.control.on.ready(() => {
      console.log('Ready callback');
    });
    window.cm.control.on.contentChanged((objName, changes) => {
      console.log('contentChanged callback');
    });
    window.cm.control.on.breakpointToggled((objName, lineIndex, isBpSet) => {
      console.log(`breakpointToggled callback: ${objName} ${lineIndex} ${isBpSet}`);
    });
  }

function lsfa(docsStyle, codeMirrorStyle, customStyle) {
    const iframe = document.createElement('iframe');
    // iframe.srcdoc = 

    let SDJK = '';
    SDJK = SDJK.replace('@@@DOCS_STYLE@@@', '<style>' + docsStyle + '</style>');
    SDJK = SDJK.replace('@@@CM_STYLE@@@', '<style>' + codeMirrorStyle + '</style>');
    SDJK = SDJK.replace('@@@CUSTOM_STYLE@@@', '<style>' + customStyle + '</style>');

    SDJK = SDJK.replace('@@@CMR_SCRIPT@@@', '<script>' + cmrScript + '</script>');
    SDJK = SDJK.replace('@@@UTILS_SCRIPT@@@', '<script>' + utilsScript + '</script>');
    SDJK = SDJK.replace('@@@TXTLIB_SCRIPT@@@', '<script>' + txtLibScript + '</script>');
    SDJK = SDJK.replace('@@@ALLIUM_SCRIPT@@@', '<script>' + alliumScript + '</script>');
    SDJK = SDJK.replace('@@@DBG_SCRIPT@@@', '<script>' + dbgScript + '</script>');
    SDJK = SDJK.replace('@@@PPVR_SCRIPT@@@', '<script>' + ppvrScript + '</script>');
    SDJK = SDJK.replace('@@@CMD_SCRIPT@@@', '<script>' + cmdScript + '</script>');

//     @@@DOCS_STYLE@@@
// @@@CM_STYLE@@@
// @@@CUSTOM_STYLE@@@

// @@@CMR_SCRIPT@@@
// @@@UTILS_SCRIPT@@@
// @@@TXTLIB_SCRIPT@@@
// @@@ALLIUM_SCRIPT@@@
// @@@DBG_SCRIPT@@@
// @@@PPVR_SCRIPT@@@
// @@@CMD_SCRIPT@@@
}