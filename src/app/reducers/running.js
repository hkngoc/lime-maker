import _ from 'lodash';

const initialState = {
  diff: {
    html: false,
    style: false,
    javascript: false,
  },
  compare: false,
  limeCompare: null
};

const actionsMap = {
  ['UPDATE_RUNNING'](state, action) {
    let newState = _.cloneDeep(state);

    const { props: { key, value } } = action;
    _.set(newState, key, value);

    return newState;
  }
};

export default function running(state = initialState, action) {
  const reduceFn = actionsMap[action.type];
  if (!reduceFn) return state;
  return reduceFn(state, action);
}
