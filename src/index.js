import React from 'react';
import ReactDOM from 'react-dom';

import App from './app';

ReactDOM.render(
  <App/>,
  document.getElementById('root')
);

// init sass worker
window.sass = new Sass();
