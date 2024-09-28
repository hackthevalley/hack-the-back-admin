import { useEffect, useState } from 'react';
import { useGet, useMutate } from 'restful-react';

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
  const [selectedMeal, setSelectedMeal] = useState('');
  const [nowServing, setNowServing] = useState('');
  const [requestedFoodId, setRequestedFoodId] = useState('');
  const [alert, setAlert] = useState({ isVisible: false, message: '' });

  const { data: allFoodData } = useGet({
    path: '/api/admin/food',
    verb: 'GET',
  });

  const { mutate: servingSwitch } = useMutate({
    path: `/api/admin/food/${requestedFoodId}`,
    verb: 'PATCH',
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
    setSelectedMeal(meal);
    const data = allFoodData.allFood.filter(
      (food) => food.day === parseInt(selectedDay, 10) && food.name === meal
    );
    setRequestedFoodId(data[0].id);
  };

  const handleSubmit = async () => {
    if (selectedDay && selectedMeal) {
      try {
        // Update the backend
        await servingSwitch();

        setAlert({
          type: 'success',
          isVisible: true,
          message: `You selected Day ${selectedDay} ${selectedMeal}`,
        });
      } catch (error) {
        console.log(error);
        setAlert({
          type: 'error',
          isVisible: true,
          message: 'There was an error updating the food servings.',
        });
      }
    } else {
      setAlert({
        type: 'error',
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
          <RadioGroup value={selectedMeal} onChange={(value) => handleMealChange(value)}>
            <Stack direction="column">
              <Radio value="lunch">Lunch</Radio>
              <Radio value="dinner">Dinner</Radio>
            </Stack>
          </RadioGroup>
        );
      case '2':
        return (
          <RadioGroup value={selectedMeal} onChange={(value) => handleMealChange(value)}>
            <Stack direction="column">
              <Radio value="breakfast">Breakfast</Radio>
              <Radio value="lunch">Lunch</Radio>
              <Radio value="dinner">Dinner</Radio>
            </Stack>
          </RadioGroup>
        );
      case '3':
        return (
          <RadioGroup value={selectedMeal} onChange={(value) => handleMealChange(value)}>
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
            {selectedDay ? ` Day ${selectedDay} ${selectedMeal}` : ' No option selected'}
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
          <Alert status={selectedDay && selectedMeal ? 'success' : 'error'} mt={4}>
            <AlertIcon />
            <AlertTitle>{selectedDay && selectedMeal ? 'Success' : 'Error'}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
            <CloseButton position="absolute" right="8px" top="8px" onClick={handleCloseAlert} />
          </Alert>
        )}
      </Box>
    </Flex>
  );
}
