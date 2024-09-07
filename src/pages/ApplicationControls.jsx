import { useEffect, useState } from 'react';
import { useGet, useMutate } from 'restful-react';

import {
  Box,
  Flex,
  Heading,
  Input,
  FormControl,
  FormLabel,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react';

import CountdownTimer from '../components/CountdownTimer';

export default function ApplicationControls() {
  const [eventDate, setEventDate] = useState('');
  const [appId, setappId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [alert, setAlert] = useState({ type: '', message: '', isVisible: false });

  const { mutate: control } = useMutate({
    path: `/api/admin/app-controls/${appId}`,
    verb: 'PATCH',
  });

  const { data: eventData } = useGet({
    path: '/api/admin/app-controls',
    verb: 'GET',
  });

  useEffect(() => {
    if (eventData) {
      setEventDate(eventData.startAt);
      setappId(eventData.id);
    }
  }, [eventData]);

  const handleSubmit = async () => {
    if (startDate && endDate) {
      setAlert({
        type: 'success',
        message: 'The dates have been submitted successfully.',
        isVisible: true,
      });

      try {
        await control({
          start_at: new Date(startDate).toISOString(),
          end_at: new Date(endDate).toISOString(),
        });
      } catch (error) {
        setAlert({
          type: 'error',
          message: 'Please fill in all dates before submitting.',
          isVisible: true,
        });
      }
    } else {
      setAlert({
        type: 'error',
        message: 'Please fill in all dates before submitting.',
        isVisible: true,
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, isVisible: false });
  };

  return (
    <Flex
      className="application-controls"
      p={4}
      width="100%"
      maxWidth="1200px"
      direction={{ base: 'column', md: 'row' }}
      gap={4}
    >
      <Box flex="1" borderWidth="1px" borderRadius="lg" boxShadow="md" p={4} mr={6}>
        <Heading as="h1" size="lg" mb={6}>
          Application Controls
        </Heading>
        <Flex direction="column" gap={4}>
          <FormControl id="start-date" mt={4}>
            <FormLabel fontSize="md" fontWeight="bold">
              Start Date
            </FormLabel>
            <Input
              type="date"
              name="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </FormControl>
          <FormControl id="end-date" mt={4}>
            <FormLabel fontSize="md" fontWeight="bold">
              End Date
            </FormLabel>
            <Input
              type="date"
              name="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </FormControl>
          <Button colorScheme="green" mt={4} onClick={handleSubmit}>
            Submit
          </Button>
          {alert.isVisible && (
            <Alert status={alert.type} mt={4} borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>{alert.type === 'success' ? 'Success!' : 'Error'}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Box>
              <CloseButton onClick={handleCloseAlert} position="absolute" right="8px" top="8px" />
            </Alert>
          )}
        </Flex>
      </Box>
      <Box
        flex="1"
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="md"
        p={4}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CountdownTimer date={new Date(eventDate)} />
      </Box>
    </Flex>
  );
}
