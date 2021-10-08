import { useGet } from 'restful-react';

import { Box, Center, Heading, HStack, Spinner, StackDivider, VStack } from '@chakra-ui/react';

import DashboardContent from '../../components/DashboardContent';
import DonutGraph from '../../components/DonutGraph';
import ApplicationStats from './ApplicationStats';
import UserStats from './UserStats';

export default function DashboardHome() {
  const { data: admin } = useGet({
    path: '/api/account/users/me',
  });
  const { data: hackerApps } = useGet({
    path: '/api/admin/forms/hacker_application/responses/overview',
  });

  const responseData = []; // Hacker application response counts
  const responseLabels = []; // Hacker application response labels

  return (
    <>
      {admin && hackerApps ? (
        <DashboardContent title={`Hello there, ${admin.firstName}!`}>
          <VStack divider={<StackDivider />} spacing={8} align="stretch">
            <Box>
              <HStack spacing={8}>
                <UserStats />
                <ApplicationStats />
              </HStack>
            </Box>
            <Box>
              <Center>
                {hackerApps.overview.forEach((i) => {
                  responseData.push(i.count);
                  responseLabels.push(i.status);
                })}
                {responseData.length !== 0 ? (
                  <DonutGraph responseData={responseData} responseLabels={responseLabels} />
                ) : (
                  <Spinner />
                )}
              </Center>
            </Box>
          </VStack>
        </DashboardContent>
      ) : (
        <Heading>Loading...</Heading>
      )}
    </>
  );
}
