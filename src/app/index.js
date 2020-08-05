import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { ReactReduxFirebaseProvider } from "react-redux-firebase";

import { persistor, store, rrfProps } from './firestore';
import Main from './main';
import Loading from './components/Loading';

const LoadingView = () => {
  return (
    <Loading>
      <div/>
    </Loading>
  )
};
const App = () => {
  return (
    <Provider store={store}>
      <ReactReduxFirebaseProvider {...rrfProps}>
        <PersistGate loading={<LoadingView/>} persistor={persistor}>
          <Main/>
        </PersistGate>
      </ReactReduxFirebaseProvider>
    </Provider>
  );
};

export default App;
