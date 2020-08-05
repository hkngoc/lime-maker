const MODES = {
  html: [{
    editor: "html",
    value: "html",
    label: "HTML"
  }, {
    editor: "markdown",
    value: "markdown",
    label: "MarkDown"
  }, {
    editor: "markdown",
    value: "pug",
    label: "Pug"
  }],
  style: [{
    editor: "css",
    value: "css",
    label: "CSS"
  }, {
    editor: "scss",
    value: "scss",
    label: "SCSS"
  }, {
    editor: "scss",
    value: "sass",
    label: "SASS"
  }, {
    editor: "less",
    value: "less",
    label: "LESS"
  }],
  javascript: [{
    editor: "javascript",
    value: "js",
    label: "JS"
  }, {
    editor: "coffee",
    value: "coffee",
    label: "CoffeeScript"
  }, {
    editor: "javascript",
    value: "es6",
    label: "ES6 (Babel)"
  }, {
    editor: "typescript",
    value: "typescript",
    label: "TypeScript"
  }],
}

const MODE_DISABLE = {
  html: {
    html: false,
    markdown: true,
    pug: true
  },
  style: {
    css: false,
    scss: false,
    sass: false,
    less: true
  },
  javascript: {
    js: false,
    coffee: true,
    es6: false,
    typescript: true
  }
}
const MODE_INDEX = {
  html: 0,
  style: 1,
  javascript: 2
}

const DIM_OPPOSITE = {
  height: "width",
  width: "height"
}

const LANGUAGE = {
  markdown: "markdown",
  pug: "markdown",
  css: "css",
  scss: "scss",
  sass: "scss",
  less: "less",
  js: "javascript",
  coffee: "coffee",
  es6: "javascript",
  typescript: "typescript"
}

export {
  MODES,
  MODE_INDEX,
  DIM_OPPOSITE,
  LANGUAGE,
  MODE_DISABLE
}
