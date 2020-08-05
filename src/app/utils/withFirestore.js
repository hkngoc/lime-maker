import React from 'react';
import hoistStatics from 'hoist-non-react-statics';
import { ReactReduxFirebaseContext, ReduxFirestoreContext } from 'react-redux-firebase';

const getDisplayName = (Component) => {
  if (typeof Component === 'string') {
    return Component;
  }

  if (!Component) {
    return undefined;
  }

  return Component.displayName || Component.name || 'Component';
}

const wrapDisplayName = (BaseComponent, hocName) => {
  return `${hocName}(${getDisplayName(BaseComponent)})`;
}

const withFirestore = ({ forwardRef = false, dispatcher = 'dispatch' }) => {
  const wrapWithFirestore = (WrappedComponent) => {
    const WithFirestore = (props) => {
      const { forwardedRef, ...wrapperProps } = props;

      return (
        <ReactReduxFirebaseContext.Consumer>
          {(firebase) => (
            <ReduxFirestoreContext.Consumer>
              {(firestore) => (
                <WrappedComponent
                  firestore={firestore}
                  firebase={firebase}
                  {...{
                    [dispatcher]: firebase.dispatch
                  }}
                  ref={forwardedRef}
                  {...wrapperProps}
                />
              )}
            </ReduxFirestoreContext.Consumer>
          )}
        </ReactReduxFirebaseContext.Consumer>
      )
    };

    const displayName = wrapDisplayName(WrappedComponent, 'withFirestore');
    WithFirestore.displayName = displayName;
    WithFirestore.wrappedComponent = WrappedComponent;

    if (forwardRef) {
      const forwarded = React.forwardRef((props, ref) => {
        return <WithFirestore {...props} forwardedRef={ref} />
      });

      forwarded.displayName = displayName;
      forwarded.WrappedComponent = WrappedComponent;
      return hoistStatics(forwarded, WrappedComponent);
    }

    return hoistStatics(WithFirestore, WrappedComponent);
  };

  return wrapWithFirestore;
};

export default withFirestore;
