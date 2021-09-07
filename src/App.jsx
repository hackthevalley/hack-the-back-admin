import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react';

import { AuthProvider } from './components/Authentication';
import Dashboard from './pages/dashboard';
import LoginPage from './pages/login';

const theme = extendTheme({
  config: {
    initialColorMode: 'system',
    useSystemColorMode: true,
  },
  styles: {
    global: {
      'html, body, #root': {
        height: '100%',
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
            <Route path="/" exact>
              Main statistics and shortcuts here: Activities, users, hacker applications, etc...
            </Route>
            <Route path="/login" exact>
              <LoginPage />
            </Route>
            <Route path="/dash" component={Dashboard} />
          </Switch>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
