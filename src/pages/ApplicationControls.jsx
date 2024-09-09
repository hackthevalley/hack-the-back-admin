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
  const [eventDetails, setEventDetails] = useState({
    date: null,
    isVisible: false,
    action: 'HTV Applications are CLOSED!',
  });
  const [appId, setappId] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [alert, setAlert] = useState({ type: '', message: '', isVisible: false });

  const { mutate: control } = useMutate({
    path: `/api/admin/app-controls/${appId}`,
    verb: 'PATCH',
  });

  const { data: eventData } = useGet({
    path: '/api/admin/app-controls',
    verb: 'GET',
  });

  const timerMessageCheck = (start, end) => {
    const currentDate = new Date();
    if (currentDate < start) {
      setEventDetails({
        date: start,
        isVisible: true,
        action: 'HTV Applications Opens in ...',
      });
    } else if (currentDate >= start && currentDate < end) {
      setEventDetails({
        date: end,
        isVisible: true,
        action: 'HTV Applications Closes in ...',
      });
    } else {
      setEventDetails({
        date: null,
        isVisible: false,
        action: 'HTV Applications are CLOSED!',
      });
    }
  };

  useEffect(() => {
    if (eventData) {
      setappId(eventData.id);
      const start = new Date(eventData.startAt);
      const end = new Date(eventData.endAt);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
      timerMessageCheck(start, end);
    }
  }, [eventData]);

  const handleSubmit = async () => {
    if (startDate && endDate) {
      try {
        await control({
          start_at: new Date(startDate).toISOString(),
          end_at: new Date(endDate).toISOString(),
        });

        const start = new Date(startDate);
        const end = new Date(endDate);
        timerMessageCheck(start, end);

        setAlert({
          type: 'success',
          message: 'The dates have been submitted successfully.',
          isVisible: true,
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
              Start Date (yyyy-mm-dd)
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
              End Date (yyyy-mm-dd)
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
        {eventDetails.isVisible ? (
          <CountdownTimer date={new Date(eventDetails.date)} action={eventDetails.action} />
        ) : (
          <Heading as="h1" size="xl" mb={3}>
            {eventDetails.action}
          </Heading>
        )}
      </Box>
    </Flex>
  );
}
