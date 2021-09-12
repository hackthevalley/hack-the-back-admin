import { lazy } from 'react';
import { CgBell, CgHome, CgList, CgUserList } from 'react-icons/cg';

import DashboardLayout from './components/DashboardLayout';
import Login from './pages/login';

export const dashboardLinks = [
  {
    to: '/',
    label: 'Home',
    icon: CgHome,
    exact: true,
  },
  {
    to: '/users',
    label: 'Users',
    icon: CgUserList,
  },
  {
    to: '/comms',
    label: 'Communication Center',
    icon: CgBell,
  },
  {
    to: '/apps',
    label: 'Hacker Apps',
    icon: CgList,
  },
];

const dashboardComponent = (LazyComponent) => () =>
  (
    <DashboardLayout routes={dashboardLinks} withAuth>
      <LazyComponent />
    </DashboardLayout>
  );

export default [
  {
    path: '/login',
    component: Login,
    exact: true,
  },
  {
    path: '/users',
    component: dashboardComponent(lazy(() => import('./pages/Users'))),
    exact: true,
  },
  {
    path: '/users/:id',
    component: dashboardComponent(lazy(() => import('./pages/UserDetails'))),
    exact: true,
  },
  {
    path: '/comms',
    component: dashboardComponent(lazy(() => import('./pages/Communications'))),
    exact: true,
  },
  {
    path: '/apps',
    component: dashboardComponent(lazy(() => import('./pages/Applications'))),
    exact: true,
  },
  {
    path: '/apps/:id',
    component: dashboardComponent(lazy(() => import('./pages/ApplicationDetails'))),
    exact: true,
  },
  {
    path: '/',
    component: dashboardComponent(lazy(() => import('./pages/Home'))),
    exact: true,
  },
];
