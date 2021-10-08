import { Link } from 'react-router-dom';
import { useGet } from 'restful-react';

import { Box, Flex, Heading, Spacer, Spinner, Stat, StatNumber } from '@chakra-ui/react';

export default function UserStats() {
  const { data: listUsers } = useGet({
    path: '/api/admin/account/users',
  });
  const { data: listStaff } = useGet({
    path: '/api/admin/account/users?is_staff=true',
  });
  const { data: listHackers } = useGet({
    path: '/api/admin/account/users?is_staff=false',
  });

  return (
    <>
      {listUsers && listStaff && listHackers ? (
        <Box as={Link} to="/users" p={5} shadow="md" borderWidth="1px" flex="1" borderRadius="md">
          <Flex>
            <Box>
              <Heading fontSize="xl">Users</Heading>
            </Box>
            <Spacer />
            <Box>
              <Stat>
                <StatNumber fontSize="md">{listUsers.count} total</StatNumber>
              </Stat>
              <Stat>
                <StatNumber fontSize="md">
                  {listStaff.count} {listStaff.count > 1 ? 'admins' : 'admin'}
                </StatNumber>
              </Stat>
              <Stat>
                <StatNumber fontSize="md">
                  {listHackers.count} {listHackers.count > 1 ? 'hackers' : 'hacker'}
                </StatNumber>
              </Stat>
            </Box>
          </Flex>
        </Box>
      ) : (
        <Spinner />
      )}
    </>
  );
}
