import React from 'react';
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';

const Loading = (props) => {
  const { children } = props;
  return (
    <BlockUi blocking={true}>
      { children }
    </BlockUi>
  )
};

export default Loading;
