import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';

import firebase from 'firebase';
import { StyledFirebaseAuth } from 'react-firebaseui';

import Author from './Author';

@autobind
class Auth extends Component {
  uiConfig() {
    return {
      signInFlow: "popup",
      signInOptions: [{
        provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        customParameters: {
          auth_type: "reauthenticate"
        }
      }, {
        provider: firebase.auth.GithubAuthProvider.PROVIDER_ID,
        customParameters: {
          prompt: "select_account"
        }
      }, {
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        customParameters: {
          prompt: "select_account"
        }
      }],
      callbacks: {
        signInSuccessWithAuthResult: (result) => {
          const { user: { uid } = { uid: null} } = result;
          const { onUserFirstLogged } = this.props;

          if (uid && onUserFirstLogged) {
            setTimeout(() => {
              onUserFirstLogged();
            }, 1000);
          }

          // Avoid redirects after sign-in.
          return false;
        }
      }
    };
  }

  render() {
    const { authorized } = this.props;

    return(
      <div>
        {
          authorized ? (
            <Author/>
          ) : (
            <StyledFirebaseAuth
              uiCallback={ui => ui.disableAutoSignIn()}
              uiConfig={this.uiConfig()}
              firebaseAuth={firebase.auth()}
            />
          )
        }
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { firestoreState: { data: { sLimes } } } = state;

  return {
    sLimes
  }
};

export default connect(mapStateToProps, null, null, { pure: false, forwardRef: true })(Auth);
