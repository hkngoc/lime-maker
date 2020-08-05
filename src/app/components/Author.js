import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import { compose } from 'redux';
import { connect } from 'react-redux';
import firebase from 'firebase';

import { actionTypes } from 'redux-firestore'
import withFirestore from '../utils/withFirestore';

import {
  Form,
  Col,
  Button
} from 'react-bootstrap';

@autobind
class Author extends Component {
  async onSignOut() {
    const { fsDispatcher } = this.props;
    await firebase.logout();

    //https://github.com/prescottprue/redux-firestore/issues/114
    fsDispatcher({ type: actionTypes.CLEAR_DATA });
  }

  render() {
    const { auth: { email, displayName, photoURL } } = this.props;

    return (
      <div className="author">
        <img className="avatar" src={photoURL}/>
        <div className="mb-5 mt-5">
          <Form.Group>
            <Form.Row>
              <Form.Label column size="sm">Display Name</Form.Label>
              <Col className="switch-setting">
                <Form.Label column size="sm">{ displayName }</Form.Label>
              </Col>
            </Form.Row>
          </Form.Group>
          <Form.Group>
            <Form.Row>
              <Form.Label column size="sm">Email</Form.Label>
              <Col className="switch-setting">
                <Form.Label column size="sm">{ email }</Form.Label>
              </Col>
            </Form.Row>
          </Form.Group>
        </div>
        <Button
          variant="danger"
          onClick={this.onSignOut}
        >
          SignOut
        </Button>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { firebaseState: { auth } } = state;
  return {
    auth
  }
};

export default compose(
  withFirestore({ forwardRef: true, dispatcher: "fsDispatcher" }),
  connect(mapStateToProps, null, null, { pure: false, forwardRef: true }),
)(Author);
