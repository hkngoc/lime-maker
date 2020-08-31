
import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import { compose } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';

import SplitPane from './ReactSplit';

import withFirestore from '../utils/withFirestore';

import * as LimesActionCreators from '../actions/limes';
import * as SettingsActionCreators from '../actions/settings';
import CodePane from './CodePane';
import ViewPane from './ViewPane';

import {
  MODE_INDEX,
  DIM_OPPOSITE
} from '../utils/modes';

@autobind
class ContentWrap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transition: false
    }
  }

  renderElementStyle(dim, size, gutSize) {
    let isString = function (v) { return typeof v === 'string' || v instanceof String; };

    let style = {};

    if (!isString(size)) {
      style[dim] = `calc(${size}% - ${gutSize}px)`;
      style[DIM_OPPOSITE[dim]] = null;
    } else {
      style[dim] = size;
      style[DIM_OPPOSITE[dim]] = null;
    }

    return style
  }

  renderGutterStyle(dim, gutSize) {
    let style = {};
    style[dim] = (gutSize + "px");
    style[DIM_OPPOSITE[dim]] = null;

    return style;
  }

  refreshEditor() {
    ['html', 'style', 'javascript'].forEach(type => {
      this.refs[type].refs.codeEditor.editor.layout();
    });
  }

  async onSaveSource(mode, newValue, viewState) {
    const { dispatch, opened, auth: { uid }, authorized, firestore, running: { diff: {[mode]: diffState } } } = this.props;

    if (mode == "html" || mode == "style" || mode == "javascript") {
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
            source: {
              [mode]: newValue
            },
            viewState: {
              [mode]: viewState
            }
          }, {
            merge: true
          });
        } catch(e) {
          console.error(e);
        }
      } else {
        dispatch(LimesActionCreators.update(opened, `source.${mode}`, newValue));
        dispatch(LimesActionCreators.update(opened, `viewState.${mode}`, viewState));
      }
      if (!diffState) {
        this.updateFrame(mode);
      }
    } else {
      // this.updateFrame("all");
    }
  }

  updateFrame(mode) {
    this.refs.iframe.update(mode);
  }

  restoreViewState() {
    ['html', 'style', 'javascript'].forEach(type => {
      this.refs[type].refs.codeEditor.restoreViewState();
    });
  }

  // componentDidUpdate(prevProps) {
  //   if (prevProps.current.id != this.props.current.id) {
  //     this.updateFrame("all");
  //   }
  // }

  onModeRequireLoaded(mode) {
    this.onSaveSource("all");
  }

  onDragEnd(which, sizes) {
    let { dispatch, setting: { layout: { layoutMode } } } = this.props;

    if (layoutMode === 3 && which == "mainSplitSizes") {
      sizes.reverse();
    }

    let action = SettingsActionCreators.update(`layout.${which}`, sizes);
    dispatch(action);
    this.refreshEditor();
  }

  onTransitionEnd() {
    this.setState({ transition: false });
    this.refreshEditor();
  }

  toggleCodeWrapCollapse(mode) {
    this.setState({ transition: true });

    let {
      setting: {
        layout: {
          codeSplitSizes
        }
      },
      dispatch
    } = this.props;
    let size = codeSplitSizes[MODE_INDEX[mode]];

    if (size == 100 || size == 0) {
      let action = SettingsActionCreators.update(`layout.codeSplitSizes`, [33.33, 33.33, 33.33]);
      dispatch(action);
    } else {
      let base = [0, 0, 0];
      base[MODE_INDEX[mode]] = 100.0;

      let action = SettingsActionCreators.update(`layout.codeSplitSizes`, base);
      dispatch(action);
    }
  }

  render() {
    const {
      setting: {
        layout: {
          layoutMode,
          mainSplitSizes,
          codeSplitSizes
        },
        general,
      },
      onInvokeCommandPalette,
      onCloseDiff,
      current,
      opened,
      authorized,
      auth
    } = this.props;
    const restProps = { current, auth, authorized, opened };
    const { transition } = this.state;

    const mainDirection = layoutMode === 2 ? 'vertical' : 'horizontal';
    const codeDirection = (layoutMode === 2 || layoutMode === 4) ? 'horizontal' : 'vertical';

    return (
      <SplitPane
        className={`content-wrap flex flex-grow layout-${layoutMode}`}
        gutterSize={layoutMode === 5 ? 0 : 4}
        minSize={layoutMode === 5 ? 0 : 150}
        sizes={mainSplitSizes}
        direction={mainDirection}
        gutterStyle={this.renderGutterStyle}
        elementStyle={this.renderElementStyle}
        onDragEnd={this.onDragEnd.bind(this, 'mainSplitSizes')}
        layoutmode={layoutMode}
      >
        <SplitPane
          className={`code-side`}
          gutterSize={4}
          sizes={codeSplitSizes}
          minSize={32}
          direction={codeDirection}
          gutterStyle={this.renderGutterStyle}
          elementStyle={this.renderElementStyle}
          onDragEnd={this.onDragEnd.bind(this, 'codeSplitSizes')}
          layoutmode={layoutMode}
        >
          <CodePane
            ref="html"
            mode="html"
            isMinimized={codeSplitSizes[0] == 0}
            isMaximized={codeSplitSizes[0] == 100}
            onSaveSource={this.onSaveSource}
            onCollapse={this.toggleCodeWrapCollapse}
            onTransitionEnd={this.onTransitionEnd}
            onInvokeCommandPalette={onInvokeCommandPalette}
            onCloseDiff={onCloseDiff}
            transition={transition}
            { ... restProps }
          />
          <CodePane
            ref="style"
            mode="style"
            isMinimized={codeSplitSizes[1] == 0}
            isMaximized={codeSplitSizes[1] == 100}
            onSaveSource={this.onSaveSource}
            onModeRequireLoaded={this.onModeRequireLoaded}
            onCollapse={this.toggleCodeWrapCollapse}
            onTransitionEnd={this.onTransitionEnd}
            onInvokeCommandPalette={onInvokeCommandPalette}
            onCloseDiff={onCloseDiff}
            transition={transition}
            { ... restProps }
          />
          <CodePane
            ref="javascript"
            mode="javascript"
            isMinimized={codeSplitSizes[2] == 0}
            isMaximized={codeSplitSizes[2] == 100}
            onSaveSource={this.onSaveSource}
            onCollapse={this.toggleCodeWrapCollapse}
            onTransitionEnd={this.onTransitionEnd}
            onInvokeCommandPalette={onInvokeCommandPalette}
            onCloseDiff={onCloseDiff}
            transition={transition}
            { ... restProps }
          />
        </SplitPane>
        <div
          id="js-demo-side"
          className="demo-side"
        >
          <ViewPane
            ref="iframe"
            current={current}
            setting={{ ...general }}
          />
        </div>
      </SplitPane>
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

export default compose(
  withFirestore({ forwardRef: true }),
  connect(mapStateToProps, null, null, { pure: false, forwardRef: true }),
)(ContentWrap);
