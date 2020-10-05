import _ from 'lodash';
import blankTemplate from '../templates/template-blank.json';
import reactTemplate from '../templates/template-react.json';

const initialState = {
  0: {
    ...reactTemplate,
    current: true,
    id: 0
  }
};

const actionsMap = {
  ['ADD_LIME'](state, action) {
    let limes = _.cloneDeep(state);

    let id = _(limes).values().reduce((maxId, profile) => Math.max(profile.id, maxId), -1) + 1;

    action.nextId = id;
    return {
      [id]: {
        ...action.props,
        id,
        lastModified: Date.now()
      },
      ...limes
    };

    // reset profile
    // action.props.id = 0;
    // return [];
    // return initialState;
  },
  ['REMOVE_LIME'](state, action) {
    let limes = _.cloneDeep(state);
    const { id } = action;

    limes = _.omit(limes, [id]);

    // if (_.keys(limes).length <= 0) {
    //   const nextId = _(state).values().reduce((maxId, profile) => Math.max(profile.id, maxId), -1) + 1;
    //   action.nextId = nextId;
    //   limes = {
    //     [nextId]: {
    //       ...blankTemplate,
    //       id: nextId,
    //       lastModified: Date.now()
    //     }
    //   };
    // }

    return limes;
  },
  ['UPDATE_LIME'](state, action) {
    let limes = _.cloneDeep(state);
    const { props: { id, key, value } } = action;

    if (limes[id]) {
      _.set(limes[id], key, value);
      _.set(limes[id], "lastModified", Date.now());
    }

    return limes;
  }
};

export default function limes(state = initialState, action) {
  const reduceFn = actionsMap[action.type];
  if (!reduceFn) return state;
  return reduceFn(state, action);
}
