import PropTypes from 'prop-types';
import { Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';

import DashboardLayout from './Layout';
import routes from './routes';

export default function Dashboard({ base = '' }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardLayout>
        <Switch>
          {routes.map((route, index) => (
            <Route
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              component={route.component}
              path={base + route.path}
            />
          ))}
        </Switch>
      </DashboardLayout>
    </Suspense>
  );
}

Dashboard.propTypes = {
  base: PropTypes.string,
};
