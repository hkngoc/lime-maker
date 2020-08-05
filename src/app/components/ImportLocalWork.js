import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import { compose } from 'redux';
import { connect } from 'react-redux';

import _ from 'lodash';
import {
  Modal,
  Form,
  Button
} from 'react-bootstrap';

import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';

import withFirestore from '../utils/withFirestore';
import * as LimeActionCreators from '../actions/limes';
import reactTemplate from '../templates/template-react.json';

@autobind
class ImportLocalWork extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
      working: false
    }
  }

  handleClose() {
    this.setState({
      show: false
    });

    this.importDefault();
  }

  handleShow() {
    this.setState({
      show: true
    })
  }

  async importDefault() {
    const { firestore, auth: { uid }, dispatch, sLimes } = this.props;

    if (_.keys(sLimes).length <= 0) {
      const template = reactTemplate;
      template.title = `Untitled ${new Date().toLocaleString()}`;

      await firestore.add({
        collection: "users",
        doc: uid,
        subcollections: [{
          collection: "limes"
        }]
      }, {
        ...template,
        createdAt: firestore.FieldValue.serverTimestamp()
      });
    }
  }

  async handleImport() {
    this.setState({ working: true });
    const { limes, firestore, auth: { uid }, dispatch, sLimes } = this.props;

    const limeToImport = _(limes)
      .filter(lime => this.refs[`ref_${lime.id}`].checked)
      .value();

    const remove = this.refs.remove.checked;

    if (limeToImport.length <= 0) {
      // add default
      await this.importDefault();
    } else {
      for await (let lime of limeToImport) {
        const { id, viewState, ...rest } = lime;

        await firestore.add({
          collection: "users",
          doc: uid,
          subcollections: [{
            collection: "limes"
          }]
        }, {
          ...rest,
          createdAt: firestore.FieldValue.serverTimestamp()
        });

        if (remove) {
          dispatch(LimeActionCreators.removeLime(id));
        }
      }
    }

    this.setState({ working: false });
    this.handleClose();
  }

  render() {
    const { limes } = this.props;
    const { show, working } = this.state;

    return (
      <BlockUi blocking={working}>
        <Modal
          show={show}
          onHide={this.handleClose}
          scrollable
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title><code>You have <strong>{limes.length} Local work</strong>. Do you want to import to your account?</code></Modal.Title>
          </Modal.Header>
          <Modal.Body className="setting-body">
            {
              limes.map(lime => {
                const { id, title } = lime;

                return (
                  <Form.Check
                    id={id}
                    key={id}
                    ref={`ref_${id}`}
                    type="checkbox"
                    label={ title }
                  />
                )
              })
            }
          </Modal.Body>
          <Modal.Footer>
            <div style={{ display: "flex", flex: 1 }}>
              <Form.Check
                id="remove"
                type="checkbox"
                ref="remove"
                label={<code>Also remove on local</code>}
                defaultValue={true}
              />
            </div>
            <Button variant="info" onClick={this.handleImport}>Import</Button>
            <Button variant="secondary" onClick={this.handleClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      </BlockUi>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const {
    limes: { _persist, ...limes },
    firestoreState: { data: { sLimes } },
  } = state;
  return {
    limes: _.map(limes),
    sLimes
  }
};

export default compose(
  withFirestore({ forwardRef: true }),
  connect(mapStateToProps, null, null, { pure: false, forwardRef: true })
)(ImportLocalWork);
