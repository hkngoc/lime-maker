import _ from 'lodash';

const initialState = {
  layout: {
    layoutMode: 1,
    mainSplitSizes: [50, 50],
    codeSplitSizes: [ 33.33, 33.33, 33.33],
  },
  editor: {
    theme: "monokai",
    options: {
      fontSize: 15,
      tabSize: 2,
      wordWrap: "off",
      renderWhitespace: "all",
      indention: 2,
      minimap: {
        enabled: true,
        maxColumn: 120,
        renderCharacters: true,
        scale: 1,
        showSlider: "mouseover",
        side: "right"
      }
    }
  },
  general: {
    loop_protect: {
      enabled: false,
      timeout: 100
    }
  },
  lastOpened: null,
  lastSyncOpened: null
};

const actionsMap = {
  ['UPDATE_SETTING'](state, action) {
    let newState = _.cloneDeep(state);
    const { props: { key, value } } = action;
    _.set(newState, key, value);

    return newState;
  },
  ['TOGGLE_SETTING'](state, action) {
    let newState = _.cloneDeep(state);
    const { props: { key } } = action;
    const value = _.get(newState, key);
    _.set(newState, key, !value);

    return newState;
  },
  ['UPDATE_SETTING_LAYOUT'](state, action) {
    let newState = _.cloneDeep(state);
    const { props } = action;
    newState.layout = {
      ...newState.layout,
      ...props
    }

    return newState;
  }
};


export default function setting(state = initialState, action) {
  const reduceFn = actionsMap[action.type];
  if (!reduceFn) return state;
  return reduceFn(state, action);
}
