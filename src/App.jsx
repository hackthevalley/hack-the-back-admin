import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react';

import { AuthProvider } from './components/Authentication';
import routes from './routes';

const theme = extendTheme({
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true,
  },
  styles: {
    global: {
      'html, body, #root': {
        height: '100%',
        maxHeight: '100vh',
        overflow: 'hidden',
      },
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <AuthProvider>
        <Router>
          <Switch>
            {routes.map(({ label, icon, ...routeProps }) => (
              // eslint-disable-next-line react/jsx-props-no-spreading
              <Route {...routeProps} key={routeProps.path + routeProps.exact} />
            ))}
          </Switch>
        </Router>
      </AuthProvider>
      <Toaster />
    </ChakraProvider>
  );
}

export default App;
