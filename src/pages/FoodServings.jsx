import { useEffect, useState } from 'react';
import { useGet } from 'restful-react';

import {
  Box,
  Flex,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react';

export default function FoodServings() {
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMeals, setSelectedMeals] = useState('');
  const [nowServing, setNowServing] = useState('');
  const [alert, setAlert] = useState({ isVisible: false, message: '' });

  const { data: allFoodData } = useGet({
    path: '/api/admin/food',
    verb: 'GET',
  });

  useEffect(() => {
    if (allFoodData) {
      const { allFood, currentMeal } = allFoodData;
      const meal = allFood.filter((food) => food.id === currentMeal[0]);
      if (meal.length === 0) {
        setNowServing('No meal currently being served!');
        return;
      }
      const mealString = `Now Serving: Day ${meal[0].day} ${meal[0].name}`;
      setNowServing(mealString);
    }
  }, [allFoodData]);

  const handleDayChange = (day) => {
    setSelectedDay(day);
  };

  const handleMealChange = (meal) => {
    setSelectedMeals(meal);
  };

  const handleSubmit = () => {
    if (selectedDay && selectedMeals) {
      setAlert({
        isVisible: true,
        message: `You selected Day ${selectedDay} ${selectedMeals}`,
      });
      console.log('day', selectedDay, 'meal', selectedMeals);
    } else {
      setAlert({
        isVisible: true,
        message: 'Please select both a day and a meal before updating.',
      });
    }

    setTimeout(() => {
      setAlert({ ...alert, isVisible: false });
    }, 5000);
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, isVisible: false });
  };

  const renderMealOptions = () => {
    switch (selectedDay) {
      case '1':
        return (
          <RadioGroup value={selectedMeals} onChange={(value) => handleMealChange(value)}>
            <Stack direction="column">
              <Radio value="lunch">Lunch</Radio>
              <Radio value="dinner">Dinner</Radio>
            </Stack>
          </RadioGroup>
        );
      case '2':
        return (
          <RadioGroup value={selectedMeals} onChange={(value) => handleMealChange(value)}>
            <Stack direction="column">
              <Radio value="breakfast">Breakfast</Radio>
              <Radio value="lunch">Lunch</Radio>
              <Radio value="dinner">Dinner</Radio>
            </Stack>
          </RadioGroup>
        );
      case '3':
        return (
          <RadioGroup value={selectedMeals} onChange={(value) => handleMealChange(value)}>
            <Stack direction="column">
              <Radio value="breakfast">Breakfast</Radio>
              <Radio value="lunch">Lunch</Radio>
            </Stack>
          </RadioGroup>
        );
      default:
        return <Text>Please select a day first.</Text>;
    }
  };

  return (
    <Flex direction="column" gap={6}>
      <Heading as="h1" size="xl" mb={6}>
        Food Servings
      </Heading>
      <Box flex="1" borderWidth="1px" borderRadius="lg" boxShadow="md" p={6}>
        <Box>
          <Heading as="h2" size="lg" mb={4}>
            {nowServing}
          </Heading>
        </Box>
        <Box>
          <Heading as="h2" size="md" mb={7}>
            Selected Meal:
            {selectedDay ? ` Day ${selectedDay} ${selectedMeals}` : ' No option selected'}
          </Heading>
        </Box>
        <Box mb={6}>
          <Heading as="h2" size="md" mb={4}>
            Select Day
          </Heading>
          <RadioGroup value={selectedDay} onChange={handleDayChange}>
            <Stack direction="column">
              <Radio value="1">Day 1</Radio>
              <Radio value="2">Day 2</Radio>
              <Radio value="3">Day 3</Radio>
            </Stack>
          </RadioGroup>
        </Box>

        <Box mb={6}>
          <Heading as="h2" size="md" mb={4}>
            Choose a Meal
          </Heading>
          {renderMealOptions()}
        </Box>

        {/* Update Button */}
        <Button colorScheme="green" mt={4} onClick={handleSubmit}>
          Update
        </Button>

        {/* Alert Box */}
        {alert.isVisible && (
          <Alert status={selectedDay && selectedMeals ? 'success' : 'error'} mt={4}>
            <AlertIcon />
            <AlertTitle>{selectedDay && selectedMeals ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
            <CloseButton position="absolute" right="8px" top="8px" onClick={handleCloseAlert} />
          </Alert>
        )}
      </Box>
    </Flex>
  );
}
