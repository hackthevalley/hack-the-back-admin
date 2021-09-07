import PropTypes from 'prop-types';

import { Button, HStack, VStack, Text, Box, useColorModeValue } from '@chakra-ui/react';

import routes from './routes';

export default function DashboardLayout({ children }) {
  const navBg = useColorModeValue('gray.200', 'gray.900');

  return (
    <HStack w="100%" minH="100%" align="stretch">
      <VStack bg={navBg} align="stretch" p="4" width="16rem">
        <Text px="4" py="2" fontWeight="bold" textAlign="start">
          Hack The Back
        </Text>
        {routes.map((route) => (
          <Button
            leftIcon={<route.icon />}
            justifyContent="start"
            key={route.label}
            variant="ghost"
            fontSize="14"
            isFullWidth
          >
            {route.label}
          </Button>
        ))}
      </VStack>
      <Box p="6" flexGrow="1">
        {children}
      </Box>
    </HStack>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
};
