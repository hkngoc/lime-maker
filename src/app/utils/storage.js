export default {
  getItem: function getItem(key) {
    // console.log(`get ${key}`);
    return new Promise(function (resolve, reject) {
      chrome.storage.local.get(key, function (value) {
        if (chrome.runtime.lastError == null) {
          // Chrome Storage returns the value in an Object of with its original key. Unwrap the
          // value from the returned Object to match the `getItem` API.
          try {
            resolve(JSON.parse(value[key]));
          } catch {
            reject();
          }
        } else {
          reject();
        }
      });
    });
  },
  removeItem: function removeItem(key) {
    return new Promise(function (resolve, reject) {
      chrome.storage.local.remove(key, function () {
        if (chrome.runtime.lastError == null) {
          resolve();
        } else {
          reject();
        }
      });
    });
  },
  setItem: function setItem(key, value) {
    // console.log(`save ${key}`);
    // console.log(value);
    return new Promise(function (resolve, reject) {
      chrome.storage.local.set({ [key]: JSON.stringify(value)}, function () {
        if (chrome.runtime.lastError == null) {
          resolve();
        } else {
          reject();
        }
      });
    });
  }
};
