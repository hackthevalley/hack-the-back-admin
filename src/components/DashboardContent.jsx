import PropTypes from 'prop-types';

import { Container, Heading, VStack, Skeleton } from '@chakra-ui/react';

const LoadingTemplate = (
  <VStack align="stretch" spacing="8">
    {new Array(5).fill(0).map((_, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <Skeleton h="2rem" key={index} />
    ))}
  </VStack>
);

export default function DashboardContent({ children, title, isLoading }) {
  return (
    <Container maxW="container.lg" ml="0">
      <Heading mb="8">{title}</Heading>
      {isLoading ? LoadingTemplate : children}
    </Container>
  );
}

DashboardContent.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
  isLoading: PropTypes.bool,
};
