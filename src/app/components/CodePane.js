import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import { compose } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';

import withFirestore from '../utils/withFirestore';
import * as LimesActionCreators from '../actions/limes';
import * as RunningActionCreators from '../actions/running';

import CodeEditor from './CodeEditor';

import {
  MODES,
  MODE_DISABLE
} from '../utils/modes';

import {
  loadJs
} from '../utils/computes';

@autobind
class CodePane extends Component {
  componentDidMount() {
    const { mode, current } = this.props;
    this.handleModeRequire(_.get(current, `mode.${mode}`));
  }

  async handleModeRequire(mode) {
    if (mode == "sass") {
      if (!window.sass) {
        console.log("load sass executor");
        await loadJs("libs/sass.js");
        window.sass = new Sass("libs/sass.worker.js");
        console.log("load sass done");

        const { onModeRequireLoaded } = this.props;
        if (onModeRequireLoaded) {
          onModeRequireLoaded(mode);
        }
      }
    }
  }

  async codeModeChangeHandler(e) {
    const { mode, dispatch, firestore, opened, authorized, auth: { uid } } = this.props;
    const value = e.target.value;

    if (authorized) {
      try {
        await firestore.set({
          collection: "users",
          doc: uid,
          subcollections: [{
            collection: "limes",
            doc: opened
          }]
        }, {
          mode: {
            [mode]: value
          }
        }, {
          merge: true
        });
      } catch(e) {
        console.error(e);
      }
    } else {
      let action = LimesActionCreators.update(opened, `mode.${mode}`, value);
      dispatch(action);
    }

    this.handleModeRequire(value);
  }

  collapseBtnHandler() {
    const { mode, onCollapse } = this.props;
    if (onCollapse) {
      this.props.onCollapse(mode);
    }
  }

  onDiff(state) {
    const { mode, dispatch } = this.props;
    let action = RunningActionCreators.update(`diff.${mode}`, state);
    dispatch(action);
  }

  render() {
    const {
      onTransitionEnd,
      onInvokeCommandPalette,
      onSaveSource,
      current,
      mode,
      isMinimized,
      isMaximized,
      setting,
      onCloseDiff,
      transition,
      running,
      ...rest
    } = this.props;
    const { diff: { [mode]: diffState = false }, compare: diff }= running;

    return (
      <div
        className={`code-wrap monaco-editor-background ${isMinimized ? "is-minimized" : ""} ${transition ? "on-transition" : ""}`}
        onTransitionEnd={onTransitionEnd}
      >
        <div
          className="js-code-wrap__header code-wrap__header"
          title="Double click to toggle code pane"
          onDoubleClick={this.collapseBtnHandler}
        >
          <label className="btn-group code-wrap-label" dropdow="true" title="Click to change">
            <span className="code-wrap__header-label">
              {MODES[mode].find(item => item.value == _.get(current, `mode.${mode}`)).label}
            </span>
            <span className="caret"/>
            <select
              data-type="html"
              className="js-mode-select hidden-select"
              onChange={this.codeModeChangeHandler}
              value={_.get(current, `mode.${mode}`)}
            >
              {
                MODES[mode].map(item => {
                  return (
                    <option key={item.value} value={item.value} disabled={MODE_DISABLE[mode][item.value]}>{item.label}</option>
                  )
                })
              }
            </select>
          </label>
          <div className="code-wrap__header-right-options">
            {
              diffState && (
                <span><strong>*</strong></span>
              )
            }
            {
              diff && (
                <a
                  className="code-wrap__header-btn "
                  title="Close compare"
                  onClick={onCloseDiff}
                >
                  <svg>
                    <use xlinkHref="#merge" />
                  </svg>
                </a>
              )
            }
            <a
              className="code-wrap__header-btn "
              title="Format code"
              disabled={true}
            >
              <svg>
                <use xlinkHref="#code-brace-icon" />
              </svg>
            </a>
            <a
              className="js-code-collapse-btn code-wrap__header-btn"
              title="Toggle code pane"
              onClick={this.collapseBtnHandler}
            >
              <svg>
                <use xlinkHref={isMaximized ? "#collapse-btn" : "#expand-btn"} />
              </svg>
            </a>
          </div>
        </div>
        <CodeEditor
          ref="codeEditor"
          mode={mode}
          onInvokeCommandPalette={onInvokeCommandPalette}
          onSaveSource={onSaveSource}
          onDiff={this.onDiff}
          diffState={diffState}
          current={current}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { running } = state;

  return {
    running
  }
};

export default compose(
  withFirestore({ forwardRef: true }),
  connect(mapStateToProps, null, null, { pure: false, forwardRef: true }),
)(CodePane);
