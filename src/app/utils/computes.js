import * as Babel from '@babel/standalone';
import protect from 'loop-protect';

async function computeHtml(code, mode) {
  // if (mode == "markdown") {
  //   if (window.marked) {
  //     let transplied = code;
  //     transplied = await window.marked(code);
  //     return Promise.resolve(transplied);
  //   }
  // } else if (mode == "pug") {
  //   if (window.jade) {
  //     let transplied = code;
  //     transplied = await window.jade.render(code);
  //     return Promise.resolve(transplied);
  //   }
  // }

  return Promise.resolve(code);
}

async function computeStyle(code, mode) {
  if (mode == "scss" || mode == "sass") {
    if (window.sass) {
      return new Promise((resolve, reject) => {
        let result = window.sass.compile(code, transplied => {
          const { status, text } = transplied;
          resolve(text);
        });
      });
    } else {
      console.log("ever load sass");
      return Promise.resolve(code);
    }
  } else {
    return Promise.resolve(code);
  }
}

async function computeJavascript(code, mode, setting) {
  if (mode == "es6") {
    let options = {
      presets: [
        ["env", { targets: { browsers: ["last 5 Chrome versions"] } }],
        "react"
      ],
      "plugins": [
        "transform-runtime"
      ]
    };
    const { loop_protect: { enabled, timeout } = { enabled: false, timeout: 100 } } = setting;
    // console.log(Babel);
    if (enabled) {
      Babel.registerPlugin('loopProtection', protect(timeout));
      options.plugins.push("loopProtection");
    } else {
      // unregister
    }

    const result = await Babel.transform(code, options);
    return Promise.resolve(result.code);
  }

  return Promise.resolve(code);
}

async function writeFile(name, blob) {
  let fileWritten = false;

  async function remove(fs, name) {
    return new Promise((resolve, reject) => {
      fs.root.getFile(
        name,
        {create: false},
        fileEntry => {
          fileEntry.remove(() => resolve());
        },
        error => {
          resolve();
        }
      );
    });
  }

  return new Promise((resolve, reject) => {
    return window.webkitRequestFileSystem(
      window.TEMPORARY,
      1024 * 1024 * 5,
      async (fs) => {
        await remove(fs, name);
        await fs.root.getFile(name, {create: true}, fileEntry => {
          fileEntry.createWriter(fileWriter => {
            fileWriter.onwriteend = () => {
              resolve();
            }
            fileWriter.onerror = () => reject("writeFail");

            fileWriter.write(blob);
          }, () => reject("createWriterFail"))
        });
      },
      () => reject("webkitRequestFileSystemFail")
    );
  })
}

function getCompleteHtml(htmlSource = '', styleSource = '', jsSource = '', jsLibs = '', styleLibs = '', scriptName) {
  let externalJs = jsLibs
    .split('\n')
    .filter(url => url)
    .map(url => {
      if (url.startsWith("libs")) {
        return `      <script src="${location.origin}/${url}"></script>`;
      }

      return `      <script src="${url}"></script>`;
    })
    .join('\n');

  let externalCss = styleLibs
    .split('\n')
    .filter(url => url)
    .map(url => {
      if (url.startsWith("libs")) {
        return `      <link rel="stylesheet" href="${location.origin}/${url}"></link>`;
      } else {
        return `      <link rel="stylesheet" href="${url}"></link>`;
      }
    })
    .join('\n');

  let content = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
${externalJs}
${externalCss}
    <style id="lime-style">
${styleSource.split('\n').map(line => `  ${line}`).join('\n')}
</style>
  </head>
  <body>
${htmlSource.split('\n').map(line => `    ${line}`).join('\n')}
    <script src="filesystem:${location.origin}/temporary/${scriptName}"></script>
  </body>
</html>
`;

  return content;
}

function loadJs(src) {
  return new Promise((resolve, reject) => {
    let ref = window.document.getElementsByTagName('script')[0];
    let script = window.document.createElement('script');
    script.src = src;
    script.async = true;
    ref.parentNode.insertBefore(script, ref);
    script.onload = () => resolve();
    script.onerror = () => reject();
  });
}

export {
  computeHtml,
  computeStyle,
  computeJavascript,
  getCompleteHtml,
  writeFile,
  loadJs
}
