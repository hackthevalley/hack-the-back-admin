import { useGet } from 'restful-react';

import { Box, Flex, Heading, HStack, Spacer, Stat, StatNumber } from '@chakra-ui/react';

import DashboardContent from '../components/DashboardContent';

export default function DashboardHome() {
  const { data: user } = useGet({
    path: '/api/account/users/me',
  });

  return (
    <DashboardContent title={`Hello there, ${user.firstName}!`}>
      <HStack spacing={8}>
        <Box p={5} shadow="md" borderWidth="1px" flex="1" borderRadius="md">
          <Flex>
            <Box>
              <Heading fontSize="xl">Users</Heading>
            </Box>
            <Spacer />
            <Box>
              <Stat>
                <StatNumber fontSize="md">$45</StatNumber>
              </Stat>
            </Box>
          </Flex>
        </Box>
        <Box p={5} shadow="md" borderWidth="1px" flex="1" borderRadius="md">
          <Heading fontSize="xl">Applications</Heading>
        </Box>
      </HStack>
    </DashboardContent>
  );
}
