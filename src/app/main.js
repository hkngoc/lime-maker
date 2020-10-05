import React, { Component, Fragment } from 'react';
import autobind from 'autobind-decorator';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { firestoreConnect } from 'react-redux-firebase';
import _ from 'lodash';

import {
  mapStateToProps as defaultMapStateToProps,
  mapFirestoreToProps as defaultMapFirestoreToProps
}  from './utils/mapToProps';

// import withFirestore from './utils/withFirestore';
import * as SettingsActionCreators from './actions/settings';
import * as RunningActionCreators from './actions/running';

import ContentWrap from './components/ContentWrap';
import Footer from './components/Footer';
import Icons from './components/Icons';
import CommandPalette from './components/CommandPalette';
import AddLibrary from './components/AddLibrary';
import Settings from './components/Settings';
import ImportLocalWork from './components/ImportLocalWork';
import Loading from './components/Loading';

import './styles.scss';
import './styles.css';

@autobind
class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      superLoading: false
    }
  }

  componentDidUpdate(prevProps) {
    const { limes, auth: { uid }, opened } = this.props;

    let id = opened;
    if (!!id) {
      const current = _.get(limes, id);
      if (!current) {
        id = null;
      }
    }
    const keys = _.keys(limes);
    if (!id && keys.length > 0) {
      id = limes[keys[0]].id;
    }

    if (!!id && id != opened) {
      const { dispatch } = this.props;

      const action = SettingsActionCreators.update(!!uid ? "lastSyncOpened" : "lastOpened", id);
      dispatch(action);
    }
  }

  onInvokeCommandPalette() {
    this.refs.commands.refs.cmd.handleOpenModal();
  }

  onOpenProfile(id) {
    const { dispatch, auth: { uid }, opened } = this.props;
    const action = SettingsActionCreators.update(!!uid ? "lastSyncOpened" : "lastOpened", id);
    dispatch(action);
  }

  onCompare(lime) {
    const { dispatch } = this.props;
    dispatch(RunningActionCreators.update("limeCompare", lime));
    dispatch(RunningActionCreators.update("compare", true));
  }

  onCloseDiff() {
    const { dispatch } = this.props;
    dispatch(RunningActionCreators.update("limeCompare", null));
    dispatch(RunningActionCreators.update("compare", false));
  }

  onUserFirstLogged() {
    const { auth: { uid }, lLimes } = this.props;

    this.refs.setting.handleClose()

    if (!!uid) {
      if (_.keys(lLimes).length > 0) {
        this.refs.local.handleShow();
      } else {
        this.refs.local.importDefault();
      }
    }
  }

  async onDropLime([file]) {
    try {
      // setState loading true
      this.setState({
        superLoading: true
      });
      await this.refs.commands.handleDropAcceptFile(file);
      // show success toast
    } catch (e) {
      // show error toast
    } finally {
      // setState loading true
      this.setState({
        superLoading: false
      });
    }
  }

  onTonOfLoading(status) {
    this.setState({
      superLoading: status
    });
  }

  render() {
    const { limes, current, auth, authorized, opened } = this.props;
    const restProps = { limes, current, auth, authorized, opened };
    const { superLoading } = this.state;

    return (
      <Fragment>
        <CommandPalette
          ref="commands"
          onRequestAddLibrary={() => this.refs.lib.handleShow()}
          onOpenProfile={this.onOpenProfile}
          onCompare={this.onCompare}
          onTonOfLoading={this.onTonOfLoading}
          { ...restProps }
        />
        <div className="main-container">
          {
            current && !superLoading ? (
              <ContentWrap
                ref="content"
                onInvokeCommandPalette={() => this.refs.commands.refs.cmd.handleOpenModal()}
                onCloseDiff={this.onCloseDiff}
                onDropLime={this.onDropLime}
                { ...restProps }
              />
            ) : (
              <Loading>
                <div/>
              </Loading>
            )
          }
          <Footer
            onRequestSetting={() => this.refs.setting.handleShow()}
            onRequestCommandPalette={() => this.refs.commands.refs.cmd.handleOpenModal()}
            onRequestOpen={() => this.refs.commands.handleSelectProfile("onOpenProfile")}
            onRequestFork={() => this.refs.commands.handleSelectProfile("onForkProfile")}
            { ...restProps }
          />
        </div>
        <Icons/>
        {
          current && (
            <AddLibrary
              ref="lib"
              onLibUpdated={() => this.refs.content.updateFrame("all")}
              { ...restProps }
            />
          )
        }
        <Settings
          ref="setting"
          onUserFirstLogged={this.onUserFirstLogged}
          authorized={authorized}
        />
        <ImportLocalWork
          ref="local"
          { ...restProps }
        />
      </Fragment>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const { limes: lLimes } = state;
  const { limes, auth, authorized, opened } = defaultMapStateToProps(state, ownProps);
  const current = limes[opened];

  return {
    limes,
    lLimes,
    auth,
    authorized,
    opened,
    current
  }
};

export default compose(
  // withFirestore({ forwardRef: true }),
  connect(mapStateToProps, null, null, { pure: false, forwardRef: true }),
  firestoreConnect(defaultMapFirestoreToProps)
)(Main);
