import React, { Fragment, Component, useState } from 'react';
import autobind from 'autobind-decorator';
import { compose } from 'redux';
import { connect } from 'react-redux';
import Textarea from 'react-textarea-autosize';
import _ from 'lodash';

import {
  Modal
} from 'react-bootstrap';

import withFirestore from '../utils/withFirestore';
import * as LimesActionCreators from '../actions/limes';

@autobind
class AddLibrary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      javascript: "",
      style: "",
      originJS: null,
      originCSS: null,
      originId: null
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { current = {} } = nextProps;
    const { id, externalLibs: { javascript = "", style = "" } = { javascript: "", style: "" } } = current;

    const { originJS: oldOriginJS, originCSS: oldOriginCSS, originId } = prevState;
    if (originId != id || oldOriginJS != javascript || oldOriginCSS != style) {
      return {
        javascript,
        style,
        originJS: javascript,
        originCSS: style,
        originId: id
      }
    } else {
      return null;
    }
  }

  handleClose() {
    this.setState({
      show: false
    })
  }

  handleShow() {
    this.setState({
      show: true
    })
  }

  onChange(type, e) {
    this.setState({ [type]: e.target.value });
  }

  async updateLib(type, e) {
    const {
      dispatch,
      onLibUpdated,
      opened,
      firestore,
      authorized, auth: { uid }
    } = this.props;

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
          externalLibs: {
            [type]: e.target.value
          }
        }, {
          merge: true
        });
      } catch(e) {
        console.error(e);
      }
    } else {
      let action = LimesActionCreators.update(opened, `externalLibs.${type}`, e.target.value);
      dispatch(action);
    }

    if (onLibUpdated) {
      onLibUpdated();
    }
  }

  render() {
    const { show, javascript, style } = this.state;

    return(
      <Modal
        show={show}
        onHide={this.handleClose}
        scrollable
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Library</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Note: You can load external scripts only from following domains:
            <li>localhost</li>
            <li>https://ajax.googleapis.com</li>
            <li>https://code.jquery.com</li>
            <li>https://cdnjs.cloudflare.com</li>
            <li>https://unpkg.com</li>
            <li>https://maxcdn.com</li>
            <li>https://cdn77.com</li>
            <li>https://maxcdn.bootstrapcdn.com</li>
            <li>https://cdn.jsdelivr.net/</li>
            <li>https://rawgit.com</li>
            <li>https://wzrd.in</li>
          </p>
          <p className="mt-0 help-text">Put each library in new line</p>
          <h5 className="mb-2">Javascript</h5>
          <Textarea
            className='form-control mb-5'
            style={{resize: 'vertical'}}
            autoComplete="off"
            spellCheck={false}
            value={javascript}
            onChange={this.onChange.bind(this, "javascript")}
            onBlur={this.updateLib.bind(this, "javascript")}
          />
          <h5 className="mb-2">Style</h5>
          <Textarea
            className='form-control'
            style={{resize: 'vertical'}}
            autoComplete="off"
            spellCheck={false}
            value={style}
            onChange={this.onChange.bind(this, "style")}
            onBlur={this.updateLib.bind(this, "style")}
          />
        </Modal.Body>
      </Modal>
    );
  }
}

export default compose(
  withFirestore({ forwardRef: true }),
  connect(null, null, null, { pure: false, forwardRef: true }),
)(AddLibrary);
