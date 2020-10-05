import _ from 'lodash';
import JSZip from 'jszip';

export default async function importLime(accept = "application/json") {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.accept = `accept="${accept}"`;
    document.body.appendChild(input);

    input.addEventListener('change', (event) => {
      const file = event.target.files[0];

      resolve(file);
    });

    input.click();
  });
}

const PATH = [
  "title",
  "externalLibs.javascript",
  "externalLibs.style",
  "mode.html",
  "mode.style",
  "mode.javascript",
  "source.html",
  "source.style",
  "source.javascript"
];

export const checkLime = (json) => {
  for (const path of PATH) {
    if (!_.has(json, path)) {
      return false;
    }
  }

  return true;
}

export const extractLime = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = JSON.parse(e.target.result);
      resolve(result);
    }
    reader.onerror = (e) => {
      reject(e);
    }
    reader.readAsText(file);
  });
}

export const trimLime = (json) => {
  return _.pick(json, PATH);
}


export const removeFolder = async (size, path, mode = window.PERSISTENT) => {
  console.log("removeRecursively remove old folder");

  return new Promise((resolve, reject) => {
    return window.webkitRequestFileSystem(
      mode,
      size,
      (fs) => {
        fs.root.getDirectory(
          path,
          {create: false},
          directoryEntry => {
            directoryEntry.removeRecursively(
              () => resolve(),
              (e) => reject(e)
            );
          },
          (e) => {
            console.error(e);
            reject(e);
          }
        );
      },
      (e) => {
        console.error(e);
        reject("webkitRequestFileSystemFail");
      }
    );
  });
}

export const extractLimehub = async (file, id) => {
  const realPath = (path) => {
    const index = path.indexOf("/");
    if (index >= 0) {
      return path.substring(index + 1);
    }

    return path;
  }

  const uncompressedSize = (files) => {
    let size = 0;
    for (const path of _.keys(files)) {
      const file = files[path];

      if (!file.dir) {
        size += file._data.uncompressedSize;
      }
    }

    return size;
  }

  const parsePath = (path) => {
    const index = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
    if (index >= 0) {
      return {
        path: path.substring(0, index),
        name: path.substring(index + 1)
      }
    } else {
      return { path: "", name: path };
    }
  }

  const writeFile = async (paths, size, blob, mode = window.PERSISTENT) => {
    const write = async (entry, filename) => {
      return new Promise((resolve, reject) => {
        entry.getFile(
          filename,
          {create: true},
          fileEntry => {
            fileEntry.createWriter(fileWriter => {
              fileWriter.onwriteend = () => {
                resolve();
              }
              fileWriter.onerror = (e) => {
                console.log(e);
                reject("writeFail");
              }

              fileWriter.write(blob);
            }, (e) => {
              console.log(e);
              reject("createWriterFail");
            });
          }, (e) => {
            console.log(e);
            reject("createWriterFail");
          }
        );
      });
    }

    const getChild = async (entry, folder) => {
      return new Promise((resolve, reject) => {
        entry.getDirectory(
          folder, 
          { create: true},
          (nextEntry) => {
            resolve(nextEntry);
          },
          (e) => {
            console.log(e);
            reject(e);
          }
        )
      });
    }

    const travel = async (entry, paths) => {
      if (paths.length == 1) {
        const [ filename ] = paths;
        // write file
        return await write(entry, filename);
      } else {
        // create folder
        // travel to child
        const [ folder, ...childs] = paths;
        const childEntry = await getChild(entry, folder);
        return await travel(childEntry, childs);
      }
    }

    return new Promise((resolve, reject) => {
      return window.webkitRequestFileSystem(
        mode,
        size,
        async (fs) => {
          await travel(fs.root, paths);
          resolve();
        },
        (e) => {
          console.log(e);
          reject("webkitRequestFileSystemFail");
        }
      );
    });
  }

  const { files } = await JSZip.loadAsync(file);
  const totalSize = uncompressedSize(files);

  try {
    await removeFolder(totalSize, id);
  } catch (e) {
    console.error(e);
  }

  try {
    for await(const path of _.keys(files)) {
      const file = files[path];

      if (!file.dir) {
        const real = realPath(path);
        const size = file._data.uncompressedSize;
        const blob = await file.async("blob");
        console.log(real);
        await writeFile([ id, ...real.split("/")], size, blob);
      }
    }
  } catch (e) {
    console.error(e);
  }
}
