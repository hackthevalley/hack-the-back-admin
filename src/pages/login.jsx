/* eslint-disable react/jsx-props-no-spreading */
import { Redirect } from 'react-router-dom';

import { Flex, Container, Box, Heading } from '@chakra-ui/react';

import { useUser } from '../components/Authentication';
import Login from '../components/Login';

export default function LoginPage() {
  const { isAuthenticated } = useUser();

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <Flex minW="100%" minH="100%" justifyContent="center" alignItems="center">
      <Container py={10}>
        <Box padding={7} width="100%">
          <Heading as="h1" size="md" cursor="default" mb={4}>
            Sign in to view admin dashboard
          </Heading>
          <Login next="/" />
        </Box>
      </Container>
    </Flex>
  );
}
