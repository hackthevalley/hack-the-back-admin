import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import { Box, Flex, Heading, Text } from '@chakra-ui/react';

const padNum = (num) => (num.toString().length === 1 ? `0${num}` : num.toString());

export default function CountdownTimer({ date }) {
  const [remainingTime, setRemainingTime] = useState({
    months: '0',
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  useEffect(() => {
    if (!date || date.getTime() < new Date().getTime()) return () => {};
    const updateRemainingTime = setInterval(() => {
      const now = new Date().getTime();
      const difference = date.getTime() - now;

      setRemainingTime({
        months: Math.floor(difference / (1000 * 60 * 60 * 24 * 30)).toString(),
        days: padNum(Math.floor((difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24))),
        hours: padNum(Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
        minutes: padNum(Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))),
        seconds: padNum(Math.floor((difference % (1000 * 60)) / 1000)),
      });
    }, 1000);

    return () => clearInterval(updateRemainingTime);
  }, [date]);

  return (
    <Box textAlign="center" color="white">
      <Heading as="h1" size="xl" mb={3}>
        Hack the Valley 9 is in ...
      </Heading>
      <Flex justify="center" align="center" wrap="wrap" fontSize="4xl" textAlign="center">
        {remainingTime.months !== '0' && (
          <Box w="24" mx="1" my="4" p="2" bg="white" color="black" borderRadius="lg">
            <Text fontFamily="mono">{remainingTime.months}</Text>
            <Text fontFamily="mono" textTransform="uppercase" fontSize="sm">
              Months
            </Text>
          </Box>
        )}
        {remainingTime.days !== '00' && (
          <Box w="24" mx="1" my="4" p="2" bg="white" color="black" borderRadius="lg">
            <Text fontFamily="mono">{remainingTime.days}</Text>
            <Text fontFamily="mono" textTransform="uppercase" fontSize="sm">
              Days
            </Text>
          </Box>
        )}
        {remainingTime.hours !== '00' && (
          <Box w="24" mx="1" my="4" p="2" bg="white" color="black" borderRadius="lg">
            <Text fontFamily="mono">{remainingTime.hours}</Text>
            <Text fontFamily="mono" textTransform="uppercase" fontSize="sm">
              Hours
            </Text>
          </Box>
        )}
        {remainingTime.minutes !== '00' && (
          <Box w="24" mx="1" my="4" p="2" bg="white" color="black" borderRadius="lg">
            <Text fontFamily="mono">{remainingTime.minutes}</Text>
            <Text fontFamily="mono" textTransform="uppercase" fontSize="sm">
              Minutes
            </Text>
          </Box>
        )}
        {remainingTime.seconds !== '00' && (
          <Box w="24" mx="1" p="2" bg="white" color="black" borderRadius="lg">
            <Text fontFamily="mono">{remainingTime.seconds}</Text>
            <Text fontFamily="mono" textTransform="uppercase" fontSize="sm">
              Seconds
            </Text>
          </Box>
        )}
      </Flex>
    </Box>
  );
}

CountdownTimer.propTypes = {
  date: PropTypes.instanceOf(Date),
};
