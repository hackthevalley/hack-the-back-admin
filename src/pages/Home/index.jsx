import { useGet } from 'restful-react';

import { Heading, HStack } from '@chakra-ui/react';

import DashboardContent from '../../components/DashboardContent';
import ApplicationStats from './ApplicationStats';
import UserStats from './UserStats';

export default function DashboardHome() {
  const { data: admin } = useGet({
    path: '/api/account/users/me',
  });

  return (
    <>
      {admin ? (
        <DashboardContent title={`Hello there, ${admin.firstName}!`}>
          <HStack spacing={8}>
            <UserStats />
            <ApplicationStats />
          </HStack>
        </DashboardContent>
      ) : (
        <Heading>Loading...</Heading>
      )}
    </>
  );
}
