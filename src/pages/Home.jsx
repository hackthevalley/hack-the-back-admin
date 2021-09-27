// import { useGet } from 'restful-react';
import { Link } from 'react-router-dom';

import { Box, Flex, Heading, HStack, Spacer, Stat, StatNumber } from '@chakra-ui/react';

import DashboardContent from '../components/DashboardContent';

export default function DashboardHome() {
  // const { data: user } = useGet({
  //   path: '/api/account/users/me',
  // });

  return (
    <DashboardContent title="Hello there, !">
      <HStack spacing={8}>
        <Box as={Link} to="/users" p={5} shadow="md" borderWidth="1px" flex="1" borderRadius="md">
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
        <Box as={Link} to="/apps" p={5} shadow="md" borderWidth="1px" flex="1" borderRadius="md">
          <Flex>
            <Box>
              <Heading fontSize="xl">Applications</Heading>
            </Box>
          </Flex>
        </Box>
      </HStack>
    </DashboardContent>
  );
}
