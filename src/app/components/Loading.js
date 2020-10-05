import React from 'react';
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';

const Loading = (props) => {
  const { children, blocking = true } = props;
  return (
    <BlockUi tag="div" blocking={blocking}>
      { children }
    </BlockUi>
  )
};

export default Loading;
