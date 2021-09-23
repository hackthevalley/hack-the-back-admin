import React from 'react';
import ReactDOM from 'react-dom';
import { RestfulProvider } from 'restful-react';

import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <RestfulProvider
      base={process.env.REACT_APP_HTB_API}
      requestOptions={() => {
        const token = localStorage.getItem('auth-token');
        if (!token) return {};

        return {
          headers: {
            Authorization: `JWT ${token}`,
            accept: 'application/json',
          },
        };
      }}
    >
      <App />
    </RestfulProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
