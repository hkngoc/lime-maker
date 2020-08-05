export function addLime(lime) {
  return { type: 'ADD_LIME', props: lime };
}

export function forkLime(id) {
  return { type: 'FORK_LIME', id };
}

export function removeLime(id) {
  return { type: 'REMOVE_LIME', id };
}

export function update(id, key, value) {
  return { type: 'UPDATE_LIME', props: { id, key, value } };
}
