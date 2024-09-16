import { lazy } from 'react';
import { CgBell, CgController, CgBowl, CgHome, CgList, CgUserList } from 'react-icons/cg';

import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';

export const dashboardLinks = [
  {
    to: '/',
    label: 'Home',
    icon: CgHome,
    exact: true,
  },
  {
    to: '/apps',
    label: 'Hacker Apps',
    icon: CgList,
  },
  {
    to: '/app-controller',
    label: 'App Controller',
    icon: CgController,
  },
  {
    to: '/food-servings',
    label: 'Food Servings',
    icon: CgBowl,
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
    path: '/app-controller',
    component: dashboardComponent(lazy(() => import('./pages/ApplicationControls'))),
    exact: true,
  },
  {
    path: '/food-servings',
    component: dashboardComponent(lazy(() => import('./pages/FoodServings'))),
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
