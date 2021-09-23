import PropTypes from 'prop-types';

import {
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  AccordionIcon,
  Heading,
  Text,
  Code,
  Kbd,
} from '@chakra-ui/react';

export default function ServerErrorPrompt({ error }) {
  return (
    <Alert status="error" p="6" alignItems="flex-start">
      <AlertIcon mr="6" />
      <VStack w="100%" align="stretch">
        <AlertTitle>{error.message}</AlertTitle>
        <AlertDescription>
          <Accordion allowToggle>
            <AccordionItem border="none">
              <AccordionButton display="flex" justifyContent="space-between">
                Show full error message (So dev can debug this)
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel px="4" pt="2" pb="0">
                <Heading as="h3" size="sm" my="2">
                  Server Response
                </Heading>
                <Code>{JSON.stringify(error)}</Code>
                <Text fontSize="sm" mt="1">
                  Open the console (<Kbd>Shift/Option</Kbd> + <Kbd>CTRL/⌘</Kbd> + <Kbd>J</Kbd>), and
                  take a picture of this screen. tyvm owo
                </Text>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </AlertDescription>
      </VStack>
    </Alert>
  );
}

ServerErrorPrompt.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string,
  }).isRequired,
};
