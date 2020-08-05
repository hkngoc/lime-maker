import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import { firebaseReducer } from 'react-redux-firebase';
import { firestoreReducer } from "redux-firestore";
import mergeStrategy from 'redux-persist/lib/stateReconciler/hardSet';

import storage from '../utils/storage';

import setting from './setting';
import limes from './limes';
import running from './running';

export default combineReducers({
  setting: persistReducer({
    key: 'setting',
    storage: storage,
    keyPrefix: ''
  }, setting),
  limes: persistReducer({
    key: 'limes',
    storage: storage,
    keyPrefix: ''
  }, limes),
  firebaseState: persistReducer({
    key: 'firebase',
    storage: storage,
    stateReconciler: mergeStrategy
  }, firebaseReducer),
  firestoreState: persistReducer({
    key: 'firestore',
    storage: storage,
    stateReconciler: mergeStrategy
  }, firestoreReducer),
  running
});
