import React, { Component, Fragment } from 'react';
import autobind from 'autobind-decorator';
import { compose } from 'redux';
import { connect } from 'react-redux';

import withFirestore from '../utils/withFirestore';
import _ from 'lodash';

import {
  Form,
  Button,
  ButtonGroup,
  ButtonToolbar
} from 'react-bootstrap';

import {
  mapStateToProps as defaultMapStateToProps
}  from '../utils/mapToProps';

import * as SettingsActionCreators from '../actions/settings';
import * as LimesActionCreators from '../actions/limes';

@autobind
class Footer extends Component {
  constructor(props){
    super(props);
    this.state = {
      title: "",
      origin: null,
      originId: null
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { current = {} } = nextProps;
    const { id, title } = current;

    const { origin: oldOrigin, originId } = prevState;
    if (originId != id || oldOrigin != title) {
      return {
        title,
        origin: title,
        originId: id
      }
    } else {
      return null;
    }
  }

  layoutBtnClickhandler(layoutId) {
    let { dispatch } = this.props;

    if (layoutId === 5) {
      let action = SettingsActionCreators.updateLayout({
        layoutMode: 5,
        mainSplitSizes: [0, 100]
      });
      dispatch(action);
      return;
    }

    let action = SettingsActionCreators.update(`layout.layoutMode`, layoutId);
    dispatch(action);
  }

  componentDidUpdate() {
    const { title } = this.state;
    this.domTitle(title);
  }

  onChange(e) {
    this.setState({ title: e.target.value });
    this.domTitle(e.target.value);
  }

  async updateTitle(e) {
    const { dispatch, opened, authorized, firestore, auth: { uid } } = this.props;
    if (authorized) {
      try {
        await firestore.update({
          collection: 'users',
          doc: uid,
          subcollections: [{
            collection: "limes",
            doc: opened
          }]
        }, {
          title: e.target.value,
          updatedAt: firestore.FieldValue.serverTimestamp()
        });
      } catch(e) {
        console.error(e);
      }
    } else {
      let action = LimesActionCreators.update(opened, `title`, e.target.value);
      dispatch(action);
    }
  }

  domTitle(title) {
    document.title = `Lime - ${title}`;
  }

  render() {
    const {
      onRequestSetting,
      onRequestOpen,
      onRequestFork,
      onRequestCommandPalette,
      authorized,
      auth: { email, photoURL} = { photoURL: "" }
    } = this.props;
    const { title } = this.state;

    return (
      <div id="footer" className="footer">
        <div className="footer__left">
          <a className="reference">
            <svg>
              <use xlinkHref="#logo-icon"/>
            </svg>
          </a>
          <span className="lime-maker-with-tag">Lime &copy;</span>
          <div className="separator">
            <svg>
              <use xlinkHref="#separate-icon"/>
            </svg>
          </div>
          <button
            className="reference"
            title="Command Palette"
            onClick={onRequestCommandPalette}
          >
            <svg>
              <use xlinkHref="#command-palette"/>
            </svg>
          </button>
          <button
            className="reference"
            title="Open Lime"
            onClick={onRequestOpen}
          >
            <svg>
              <use xlinkHref="#open"/>
            </svg>
          </button>
          <button
            className="reference"
            title="Fork Lime"
            onClick={onRequestFork}
          >
            <svg>
              <use xlinkHref="#fork"/>
            </svg>
          </button>
          <div className="separator">
            <svg>
              <use xlinkHref="#separate-icon"/>
            </svg>
          </div>
          <Form.Control
            id="titleInput"
            size="sm"
            type="text"
            className="item-title-input bg-dark text-white border-0 rounded-0"
            autoComplete="off"
            spellCheck={false}
            value={title || ""}
            onChange={this.onChange}
            onBlur={this.updateTitle}
          />
        </div>
        <div className="footer__right">
          <button
            id="layoutBtn1"
            onClick={this.layoutBtnClickhandler.bind(this, 1)}
            className="mode-btn"
            title="Switch to layout with preview on right"
          >
            <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
              <use xlinkHref="#mode-icon" />
            </svg>
          </button>
          <button
            onClick={this.layoutBtnClickhandler.bind(this, 2)}
            id="layoutBtn2"
            className="mode-btn"
            title="Switch to layout with preview on bottom"
          >
            <svg viewBox="0 0 100 100">
              <use xlinkHref="#mode-icon"/>
            </svg>
          </button>
          <button
            onClick={this.layoutBtnClickhandler.bind(this, 3)}
            id="layoutBtn3"
            className="mode-btn"
            title="Switch to layout with preview on left"
          >
            <svg viewBox="0 0 100 100" style={{ transform: "rotate(90deg)" }}>
              <use xlinkHref="#mode-icon"/>
            </svg>
          </button>
          <button
            onClick={this.layoutBtnClickhandler.bind(this, 5)}
            id="layoutBtn4"
            className="mode-btn hint--top-left hint--rounded"
            title="Switch to full screen preview"
          >
            <svg viewBox="0 0 100 100">
              <rect x="0" y="0" width="100" height="100" />
            </svg>
          </button>
          {
            authorized && (
              <Fragment>
                <div className="separator">
                  <svg>
                    <use xlinkHref="#separate-icon"/>
                  </svg>
                </div>
                <img className="footer-avatar" title={email} src={photoURL}/>
              </Fragment>
            )
          }
          <div className="separator">
            <svg>
              <use xlinkHref="#separate-icon"/>
            </svg>
          </div>
          <button
            onClick={onRequestSetting}
            className="mode-btn"
          >
            <svg viewBox="0 0 100 100">
              <use xlinkHref="#settings-icon"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }
}

export default compose(
  withFirestore({ forwardRef: true }),
  connect(null, null, null, { pure: false, forwardRef: true }),
)(Footer);
