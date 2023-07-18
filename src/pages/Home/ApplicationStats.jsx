import { Link } from 'react-router-dom';
import { useGet } from 'restful-react';

import { Box, Flex, Heading, Spacer, Spinner, Stat, StatNumber } from '@chakra-ui/react';

export default function ApplicationStats() {
  const { data: hackerApps } = useGet({
    path: '/api/admin/forms/hacker_application/responses/overview',
  });
  const { data: accepted } = useGet({
    path: '/api/admin/forms/hacker_application/responses?applicant__status=ACCEPTED_INVITE',
  });
  const { data: waiting } = useGet({
    path: '/api/admin/forms/hacker_application/responses?applicant__status=WAITLISTED',
  });

  let appCount = 0; // Counter for number of total applications

  return (
    <>
      {hackerApps && accepted && waiting ? (
        <Box as={Link} to="/apps" p={5} shadow="md" borderWidth="1px" flex="1" borderRadius="md">
          <Flex>
            <Box>
              <Heading fontSize="xl">Applications</Heading>
            </Box>
            <Spacer />
            <Box>
              <Stat>
                {hackerApps.overview.forEach((i) => {
                  appCount += i.count;
                })}
                <StatNumber fontSize="md">{appCount} total</StatNumber>
              </Stat>
              <Stat>
                {accepted.count !== 1 ? (
                  <StatNumber fontSize="md">{accepted.count} accepted invites</StatNumber>
                ) : (
                  <StatNumber fontSize="md">{accepted.count} accepted invite</StatNumber>
                )}
              </Stat>
              <Stat>
                <StatNumber fontSize="md">{waiting.count} waitlisted</StatNumber>
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
