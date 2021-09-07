import { lazy } from 'react';
import { CgHome } from 'react-icons/cg';

export default [
  {
    path: '/',
    label: 'Home',
    icon: CgHome,
    component: lazy(() => import('./Home')),
  },
];
