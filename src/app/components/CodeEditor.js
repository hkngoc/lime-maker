import React, { Component, Fragment } from 'react';
import autobind from 'autobind-decorator';
// import { compose } from 'redux';
import { connect } from 'react-redux';
import MonacoEditor, { MonacoDiffEditor } from 'react-monaco-editor';
import Dropzone from 'react-dropzone';

import {
  mapStateToProps as defaultMapStateToProps
}  from '../utils/mapToProps';
import { LANGUAGE } from '../utils/modes';

import monokai from 'monaco-themes/themes/Monokai.json';

/**
 * CtrlCmd: 2048
 * Shift: 1024
 * Alt: 512
 * WinCtrl: 256
 */
@autobind
class CodeEditor extends Component {
  constructor(props){
    super(props);
    this.state = {
      code: "",
      origin: null,
      originId: null
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { current, mode, onDiff } = nextProps;
    const { id, source: { [mode]: code = "" } } = current;

    const { origin: oldOrigin, originId } = prevState;
    if (originId != id || oldOrigin != code) {
      return {
        code,
        origin: code,
        originId: id
      }
    } else {
      return null;
    }
  }

  editorDidMount(editor, monaco) {
    // console.log(editor, monaco);
    // Ctrl+S
    editor.addCommand(2048 | 49, this.onSave);
    // Ctrl+Shift+P
    editor.addCommand(2048 | 1024 | 46, this.onInvokeCommandPalette);
    monaco.editor.defineTheme("monokai", monokai);

    this.editor = editor;
    this.restoreViewState();
  }

  restoreViewState() {
    const { current: { viewState, title }, mode, running: { compare } } = this.props;

    if (compare) {
      return;
    }

    // clear editor undo/redo history
    // https://github.com/microsoft/monaco-editor/issues/686
    const cm = this.editor.getModel()._commandManager;
    if (cm) {
      cm.past = [];
      cm.future = [];
    }

    const indention = _.get(this.props, "setting.editor.options.indention", 2);
    this.editor.getModel().updateOptions({
      tabSize: indention
    });


    if (viewState && viewState[mode]) {
      let state = viewState[mode];
      if (typeof(state) === "string") {
        try {
          state = JSON.parse(state);
        } catch(e) {
          console.error(e);
        }
      }
      try {
        this.editor.restoreViewState(state);
      } catch(e) {
        console.error(e);
      }
    } else {
      this.editor.restoreViewState(null);
    }
  }

  componentDidUpdate(prevProps) {
    this.checkDiff();
    const { current: { id: prevId } } = prevProps;
    const { current: { id: nextId } } = this.props;

    if (prevId != nextId) {
      this.restoreViewState();
    }
  }

  async onSave() {
    const { onSaveSource, mode, onDiff } = this.props;

    if (onSaveSource) {
      const { running: { compare: diff } } = this.props;
      const model = this.editor.getModel();
      const value = diff ? model.modified.getValue() : model.getValue();
      const viewState = diff ? {} : this.editor.saveViewState();

      await onSaveSource(mode, value, JSON.stringify(viewState));
    }

    if (onDiff) {
      onDiff(false);
    }
  }

  onInvokeCommandPalette() {
    const { onInvokeCommandPalette } = this.props;
    if (onInvokeCommandPalette) {
      onInvokeCommandPalette();
    }
  }

  checkDiff() {
    const { origin, code } = this.state;
    const { onDiff, diffState } = this.props;
    if (onDiff) {
      const newState = origin != code;
      if (newState != diffState) {
        onDiff(newState);
      }
    }
  }

  onChange(newValue, e) {
    this.setState({ code: newValue }, () => this.checkDiff());
  }

  getAcceptFormat() {
    const { authorized } = this.props;

    if (authorized) {
      return [
        "application/json"
      ];
    } else {
      return [
        "application/json",
        "zip",
        "application/octet-stream",
        "application/zip",
        "application/x-zip",
        "application/x-zip-compressed"
      ];
    }
  }

  render() {
    const {
      mode,
      setting: {
        editor: {
          theme,
          options: {
            fontSize,
            renderWhitespace,
            wordWrap,
            minimap
          }
        },
      },
      running: {
        compare: diff,
        limeCompare
      },
      current,
      onDropLime
    } = this.props;
    const { type, source: { [mode]: sourceCode = "" }, mode: { [mode]: language } } = current;
    const { code = "" } = this.state;

    const Editor = diff ? MonacoDiffEditor : MonacoEditor;
    const sourceCompare = diff ? limeCompare.source[mode] : "";

    return (
      <Dropzone
        onDropAccepted={onDropLime}
        multiple={false}
        noClick={true}
        noKeyboard={true}
        accept={this.getAcceptFormat()}
      >
        {({getRootProps, getInputProps}) => (
          <div
            className="dropzone"
            {
              ...getRootProps()
            }
          >
            <input {...getInputProps()} />
            <Editor
              language={LANGUAGE[language]}
              editorDidMount={this.editorDidMount}
              theme={theme}
              original={sourceCompare}
              value={code}
              onChange={this.onChange}
              options={{
                automaticLayout: true,
                fontSize: fontSize,
                wordWrap: "off",
                renderWhitespace: renderWhitespace,
                fontLigatures: true,
                mouseWheelZoom: false,
                smoothScrolling: true,
                scrollBeyondLastLine: false,
                minimap: minimap,
                enableSplitViewResizing: false,
                // originalEditable: true,
                readOnly: type == "Limehub"
              }}
            />
          </div>
        )}
      </Dropzone>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { setting, running } = state;

  return {
    setting,
    running
  }
};

export default connect(mapStateToProps, null, null, { pure: false, forwardRef: true })(CodeEditor);
