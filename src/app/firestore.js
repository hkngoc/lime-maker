import { createFirestoreInstance } from "redux-firestore";
import { applyMiddleware, createStore, compose } from 'redux';
import { persistStore } from 'redux-persist';
import { getFirebase, getFirestore } from 'react-redux-firebase';
import { reduxFirestore } from 'redux-firestore';
// import thunk from 'redux-thunk';

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import rootReducer from './reducers';
import firebaseConfig from './firebase.json';

const rrfConfig = {
  userProfile: "users",
  useFirestoreForProfile: true,
};

firebase.initializeApp(firebaseConfig);
firebase.firestore();
// firebase.firestore().enablePersistence();

// const middlewares = applyMiddleware(
//   thunk.withExtraArgument(getFirebase)
// );

const enhancer = compose(
  // middlewares,
  reduxFirestore(firebase)
);

export const store = createStore(rootReducer, {}, enhancer);
export const persistor = persistStore(store);
export const rrfProps = {
  firebase,
  config: rrfConfig,
  dispatch: store.dispatch,
  createFirestoreInstance, //since we are using Firestore
};
