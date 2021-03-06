import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { ChakraProvider } from '@chakra-ui/react';

import LoginPage from './pages/login';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Switch>
          <Route path="/" exact>
            Main statistics and shortcuts here: Activities, users, hacker applications, etc...
          </Route>
          <Route path="/login" exact>
            <LoginPage />
          </Route>
        </Switch>
      </Router>
    </ChakraProvider>
  );
}

export default App;
