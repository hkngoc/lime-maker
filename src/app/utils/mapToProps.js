import _ from 'lodash';
import { isLoaded, isEmpty } from 'react-redux-firebase';

const mapLime = (limes) => {
  return _(limes)
    .map((v, k) => ({
      id: k,
      ...v
    }))
    .filter(o => {
      const { id, ...rest } = o;
      return rest && _.keys(rest).length > 0;
    })
    .keyBy("id")
    .value();
};

export const mapStateToProps = (state, ownProps) => {
  const {
    limes: { _persist, ...limes },
    firebaseState: { auth },
    firestoreState: { data: { sLimes } },
    setting: {
      lastOpened,
      lastSyncOpened
    }
  } = state;

  const uid = _.get(auth, "uid");
  const profiles = mapLime(!!uid ? sLimes : limes);
  const keys = _.keys(profiles);

  let opened = !!uid ? lastSyncOpened : lastOpened
  if (!!opened && !_.get(profiles, opened)) {
    opened = null;
  }

  if (!opened && keys.length > 0) {
    opened = profiles[keys[0]].id;
  }

  return {
    limes: profiles,
    auth,
    authorized: isLoaded(auth) && !isEmpty(auth),
    opened
  }
};

export const mapFirestoreToProps = (props) => {
  const uid = _.get(props, "auth.uid");

  if (!!uid) {
    return [{
      collection: `users/${uid}/limes`,
      storeAs: "sLimes"
    }];
  }

  return [];
};

// export mapStateToProps;
// export  mapFirestoreToProps;
