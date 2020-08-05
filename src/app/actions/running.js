export function update(key, value) {
  return { type: 'UPDATE_RUNNING', props: { key, value } };
}
