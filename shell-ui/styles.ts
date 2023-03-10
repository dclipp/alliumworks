export const CSS = '/* You can add global styles to this file, and also import other style files */\n'
+ '.col {\n'
+ '  display: inline-block;\n'
+ '}\n'
+ '.col.left {\n'
+ '  float: left;\n'
+ '}\n'
+ '.col.right {\n'
+ '  float: right;\n'
+ '}\n'
+ '\n'
+ 'button.icon-btn {\n'
+ '  cursor: pointer;\n'
+ '  background: none;\n'
+ '  border: none;\n'
+ '  outline: none;\n'
+ '  color: #3b4238;\n'
+ '  opacity: 0.8;\n'
+ '}\n'
+ 'button.icon-btn:not(:disabled):hover {\n'
+ '  opacity: 1;\n'
+ '}\n'
+ '\n'
+ '.container-row {\n'
+ '  width: 100%;\n'
+ '  min-height: 1em;\n'
+ '  display: inline-block;\n'
+ '  border-top: 1px solid #3b4238;\n'
+ '}\n'
+ '\n'
+ '.no-show {\n'
+ '  display: none;\n'
+ '}\n'
+ '\n'
+ 'sui-input-area .input-area {\n'
+ '  width: 100%;\n'
+ '  height: calc((1.5 * var(--shell-ui-font-size)) + 2px);\n'
+ '}\n'
+ 'sui-input-area .input-area .completions-toggle-column {\n'
+ '  width: 1.5em;\n'
+ '}\n'
+ 'sui-input-area .input-area .history-toggle-column {\n'
+ '  width: 1.5em;\n'
+ '}\n'
+ 'sui-input-area .input-area .field-column {\n'
+ '  width: calc(100% - 3em);\n'
+ '  transform: translateY(-0.5em);\n'
+ '  vertical-align: middle;\n'
+ '}\n'
+ 'sui-input-area .input-area .field-column .input-container {\n'
+ '  position: relative;\n'
+ '  width: 100%;\n'
+ '}\n'
+ 'sui-input-area .input-area .field-column .input-container input {\n'
+ '  width: 100%;\n'
+ '  font-family: var(--shell-ui-font-family);\n'
+ '  font-size: var(--shell-ui-font-size);\n'
+ '  margin: 0;\n'
+ '  border: none;\n'
+ '  background: none;\n'
+ '  outline: none;\n'
+ '  position: absolute;\n'
+ '  left: 0;\n'
+ '}\n'
+ 'sui-input-area .input-area .field-column .input-container input.editable {\n'
+ '  z-index: 0;\n'
+ '}\n'
+ 'sui-input-area .input-area .field-column .input-container input.suggestions {\n'
+ '  z-index: -1;\n'
+ '  color: darkgray;\n'
+ '}\n'
+ 'sui-input-area .input-area .field-column .input-container input:focus {\n'
+ '  border-bottom: 1px solid gold;\n'
+ '}\n'
+ '\n'
+ 'sui-output-area .output-area {\n'
+ '  overflow-y: auto;\n'
+ '  height: calc(var(--shell-ui-max-height) - ((2 * var(--shell-ui-font-size)) + 4px) - ((2 * var(--shell-ui-font-size)) + 2px));\n'
+ '}\n'
+ 'sui-output-area .output-area .log-entry {\n'
+ '  font-family: var(--shell-ui-font-family);\n'
+ '  font-size: var(--shell-ui-font-size);\n'
+ '  line-height: calc(var(--shell-ui-font-size) + 2px);\n'
+ '  width: 100%;\n'
+ '}\n'
+ 'sui-output-area .output-area .log-entry .icon-column {\n'
+ '  width: 1.5ch;\n'
+ '}\n'
+ 'sui-output-area .output-area .log-entry .message-column {\n'
+ '  width: calc(100% - 1.5ch);\n'
+ '}\n'
+ '\n'
+ 'sui-popover-list .popover-list {\n'
+ '  width: 100%;\n'
+ '  position: relative;\n'
+ '  bottom: calc(2 * ((1.5 * var(--shell-ui-font-size)) + 2px));\n'
+ '  left: 0;\n'
+ '  min-height: calc((1.5 * var(--shell-ui-font-size)) + 2px);\n'
+ '  font-size: var(--shell-ui-font-size);\n'
+ '  font-family: var(--shell-ui-font-family);\n'
+ '  background-color: burlywood;\n'
+ '}\n'
+ 'sui-popover-list .popover-list ul {\n'
+ '  list-style: none;\n'
+ '  margin: 0;\n'
+ '  padding: 0;\n'
+ '}\n'
+ 'sui-popover-list .popover-list ul li[data-has-children=true] .caret-icon-container .icon.no-children {\n'
+ '  display: none;\n'
+ '}\n'
+ 'sui-popover-list .popover-list ul li[data-has-children=true].expanded .caret-icon-container .icon.collapsed {\n'
+ '  display: none;\n'
+ '}\n'
+ 'sui-popover-list .popover-list ul li[data-has-children=true]:not(.expanded) .caret-icon-container .icon.expanded {\n'
+ '  display: none;\n'
+ '}\n'
+ 'sui-popover-list .popover-list ul li[data-has-children=false] .caret-icon-container .icon:not(.no-children) {\n'
+ '  display: none !important;\n'
+ '}\n'
+ 'sui-popover-list .popover-list ul li .caret-icon-container .icon {\n'
+ '  width: 1.5ch;\n'
+ '  padding-right: 4px;\n'
+ '}\n'
+ 'sui-popover-list .popover-list ul li .caret-icon-container .icon.clickable {\n'
+ '  cursor: pointer;\n'
+ '}\n'
+ 'sui-popover-list .popover-list .popover-column {\n'
+ '  display: inline-block;\n'
+ '}\n'
+ 'sui-popover-list .popover-list .popover-column .item-text:empty {\n'
+ '  display: none;\n'
+ '}\n'
+ 'sui-popover-list .popover-list .popover-column .item-text.bold {\n'
+ '  font-weight: bold;\n'
+ '}\n'
+ 'sui-popover-list .popover-list.fixed-height {\n'
+ '  height: calc((5 * var(--shell-ui-font-size)) + 2px);\n'
+ '  overflow-y: scroll;\n'
+ '  margin-top: calc(-2 * ((1.5 * var(--shell-ui-font-size)) + 2px));\n'
+ '}\n'
+ '\n'
+ 'sui-toolbar .toolbar {\n'
+ '  width: 100%;\n'
+ '  height: calc(var(--shell-ui-font-size) * 1.75);\n'
+ '}\n'
+ 'sui-toolbar .toolbar .icon-btn {\n'
+ '  vertical-align: sub;\n'
+ '}\n'
+ 'sui-toolbar .toolbar select {\n'
+ '  vertical-align: sub;\n'
+ '}\n'
+ '\n'
+ 'sui-container .container {\n'
+ '  max-height: var(--shell-ui-max-height);\n'
+ '  overflow: hidden;\n'
+ '}\n'