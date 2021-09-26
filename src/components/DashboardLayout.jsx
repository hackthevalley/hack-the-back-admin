import PropTypes from 'prop-types';
import { Fragment, Suspense } from 'react';
import { CgLogOut } from 'react-icons/cg';
import { NavLink, Redirect, useLocation, useHistory, useRouteMatch } from 'react-router-dom';

import { Button, HStack, VStack, Text, Box, useColorModeValue } from '@chakra-ui/react';

import { Protected, useUser } from './Authentication';

export default function DashboardLayout({ routes, withAuth, children }) {
  const navBg = useColorModeValue('gray.200', 'gray.900');
  const Component = withAuth ? Protected : Fragment;
  const location = useLocation();
  const match = useRouteMatch();
  const { logout } = useUser();
  const history = useHistory();
  const componentProps = {
    ...(withAuth && {
      fallback: <Redirect to="/login" />,
    }),
  };

  return (
    <HStack w="100%" minH="100%" maxH="100%" align="stretch">
      <VStack bg={navBg} align="stretch" p="4" width="16rem" flexShrink="0">
        <Text px="4" py="2" fontWeight="bold" textAlign="start">
          Hack The Back
        </Text>
        {routes.map((route) => {
          const isMatch = route.exact ? route.to === match.path : match.path.startsWith(route.to);

          return (
            <Button
              variant={isMatch ? 'solid' : 'ghost'}
              leftIcon={<route.icon />}
              justifyContent="start"
              key={route.label}
              fontSize="14"
              to={route.to}
              as={NavLink}
              isFullWidth
            >
              {route.label}
            </Button>
          );
        })}
        <Button
          marginTop="auto !important"
          leftIcon={<CgLogOut />}
          justifyContent="start"
          onClick={() => {
            logout();
            history.push(`/login?redirect=${location.pathname}`);
          }}
          fontSize="14"
          isFullWidth
        >
          Logout
        </Button>
      </VStack>
      <Box p="6" py="10" flexGrow="1" minW="1px" overflow="auto">
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...componentProps}>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </Component>
      </Box>
    </HStack>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
  routes: PropTypes.arrayOf(
    PropTypes.shape({
      to: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      icon: PropTypes.func.isRequired,
      exact: PropTypes.bool,
    })
  ),
  withAuth: PropTypes.bool,
};
