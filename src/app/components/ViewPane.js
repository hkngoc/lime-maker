import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import _ from 'lodash';
import rdiff from 'recursive-diff';

import {
  computeHtml,
  computeStyle,
  computeJavascript,
  getCompleteHtml,
  writeFile
} from '../utils/computes';

@autobind
export default class ViewPane extends Component {
  componentDidMount() {
    this.update("all");
  }

  componentDidUpdate(prevProps) {
    const { current: prev } = prevProps;
    const { current: next } = this.props;

    let diff = rdiff.getDiff(prev, next);
    diff = _(diff)
      .map(item => {
        const { path, ...rest } = item;
        return {
          path: _.join(path, "."),
          ...rest
        }
      })
      // .flatten()
      .value();

    if (_.findIndex(diff, item =>
      item.path.includes("mode") ||
      item.path.includes("externalLibs") ||
      item.path.includes("source.javascript") ||
      item.path.includes("source.html") ||
      item.path.includes("id")
    ) >= 0) {
      this.update("all");
    } else if (_.findIndex(diff, item => item.path.includes("source.style")) >= 0) {
      this.update("style");
    }
  }

  update(updateMode) {
    const { current, setting } = this.props;

    switch(updateMode) {
      case "style":
        this.updateStyle(current);
        break;
      case "html":
      case "javascript":
      case "all":
        this.writeHtml(current, setting);
        break;
    }
  }

  async updateStyle(lime) {
    let {
      source: {
        style: styleSource
      },
      mode: {
        style: styleMode
      }
    } = lime;

    styleSource = await computeStyle(styleSource, styleMode);
    this.frame.contentDocument.querySelector('#lime-style').textContent = styleSource || '';
  }

  async writeHtml(lime, setting) {
    let {
      source: {
        html: htmlSource,
        style: styleSource,
        javascript: jsSource
      },
      mode: {
        html: htmlMode,
        style: styleMode,
        javascript: jsMode
      },
      externalLibs: {
        javascript: jsLibs,
        style: styleLibs
      },
      id
    } = lime;

    htmlSource = await computeHtml(htmlSource, htmlMode);
    styleSource = await computeStyle(styleSource, styleMode);
    jsSource = await computeJavascript(jsSource, jsMode, setting);

    let blobjs = new Blob([jsSource], { type: 'text/plain;charset=UTF-8' });
    await writeFile(`script_${id}.js`, blobjs);

    let contents = getCompleteHtml(htmlSource, styleSource, jsSource, jsLibs, styleLibs, `script_${id}.js`);

    let blob = new Blob([contents], { type: 'text/plain;charset=UTF-8' });
    await writeFile(`preview_${id}.html`, blob);
    let src = `filesystem:${location.origin}/temporary/preview_${id}.html`;
    this.frame.src = src;
  }

  render() {
    return (
      <iframe
        ref={el => (this.frame = el)}
        id="demo-frame"
        frameBorder="0"
        allowFullScreen
      />
    );
  }
}
