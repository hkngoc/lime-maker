export function update(key, value) {
  return { type: 'UPDATE_SETTING', props: { key, value } };
}

export function toggle(key) {
  return { type: 'TOGGLE_SETTING', props: { key } };
}

export function updateLayout(props) {
  return { type: 'UPDATE_SETTING_LAYOUT', props }
}