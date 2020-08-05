import React, { Component } from 'react';
import autobind from 'autobind-decorator';
import Split from 'split.js';

@autobind
export default class ReactSplit extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { children, gutter, ...rest } = this.props;
    let options = rest;
    options.gutter = (index, direction) => {
      let gutterElement;

      if (gutter) {
        gutterElement = gutter(index, direction);
      } else {
        gutterElement = document.createElement('div');
        gutterElement.className = "gutter gutter-" + direction;
      }

      // eslint-disable-next-line no-underscore-dangle
      gutterElement.__isSplitGutter = true;
      return gutterElement
    };

    this.split = Split(this.parent.children, options);
  }

  componentDidUpdate(prevProps) {
    let this$1 = this;
    const {
      children,
      minSize,
      sizes,
      collapsed,
      ...rest
    } = this.props;

    const {
      minSize: prevMinSize,
      sizes: prevSizes,
      collapsed: prevCollapsed
    } = prevProps;

    let options = rest;

    const otherProps = [
      'expandToMin',
      'gutterSize',
      'gutterAlign',
      'snapOffset',
      'dragInterval',
      'direction',
      'cursor',
      'layoutmode'
    ];

    let needsRecreate = otherProps
      .map(prop => this$1.props[prop] !== prevProps[prop])
      .reduce((accum, same) => accum || same, false);

    // Compare minSize when both are arrays, when one is an array and when neither is an array
    if (Array.isArray(minSize) && Array.isArray(prevMinSize)) {
      let minSizeChanged = false;

      minSize.forEach((minSizeI, i) => {
          minSizeChanged = minSizeChanged || minSizeI !== prevMinSize[i];
      });

      needsRecreate = needsRecreate || minSizeChanged;
    } else if (Array.isArray(minSize) || Array.isArray(prevMinSize)) {
      needsRecreate = true;
    } else {
      needsRecreate = needsRecreate || minSize !== prevMinSize;
    }

    // Destroy and re-create split if options changed
    if (needsRecreate) {
      options.minSize = minSize;
      options.sizes = sizes || this.split.getSizes();
      this.split.destroy(true, true);
      options.gutter = (index, direction, pairB) => {
        return pairB.previousSibling;
      };

      this.split = Split(Array.from(this.parent.children).filter((element) => !element.__isSplitGutter), options);
    } else if (sizes) {
      // If only the size has changed, set the size. No need to do this if re-created.
      let sizeChanged = false;

      sizes.forEach((sizeI, i) => {
        sizeChanged = sizeChanged || sizeI !== prevSizes[i];
      });

      if (sizeChanged) {
        // eslint-disable-next-line react/destructuring-assignment
        this.split.setSizes(this.props.sizes);
      }

      // Collapse after re-created or when collapsed changed.
      if (Number.isInteger(collapsed) && (collapsed !== prevCollapsed || needsRecreate)) {
        this.split.collapse(collapsed);
      }
    }
  }

  componentWillUnmount() {
    this.split.destroy();
    delete this.split;
  }

  render() {
    let this$1 = this;
    const {
      sizes,
      minSize,
      expandToMin,
      gutterSize,
      gutterAlign,
      snapOffset,
      dragInterval,
      direction,
      cursor,
      gutter,
      elementStyle,
      gutterStyle,
      onDrag,
      onDragStart,
      onDragEnd,
      collapsed,
      children,
      ...rest
    } = this.props;

    return (
      React.createElement('div', Object.assign({},
        { ref: function (parent) {
            this$1.parent = parent;
        } }, rest),
        children
      )
    )
  }
}
