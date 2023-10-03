import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { QrReader } from 'react-qr-reader';
import { useMutate } from 'restful-react';

import {
  Button,
  Text,
  Grid,
  GridItem,
  Modal,
  ModalContent,
  ModalOverlay,
  Select,
  Input,
} from '@chakra-ui/react';

export default function Scanner() {
  const duplicates = new Set();
  const [info, setInfo] = useState(null);
  const [count, setCount] = useState(0);
  const [choice, setChoice] = useState('Email');
  const quickQuestions = ['Dietary Restrictions', 'T-Shirt Size'];
  const { mutate: scan } = useMutate({
    path: `/api/admin/qr/scan`,
    verb: 'POST',
  });
  const handleScan = async (result) => {
    if (result) {
      // dedup logic
      if (duplicates.has(result.text)) return;
      duplicates.add(result.text);
      const DEDUP_TIMEOUT_MS = 4000;
      setTimeout(() => duplicates.delete(result.text), DEDUP_TIMEOUT_MS);

      // admit
      const toastId = toast.loading('Admitting...');
      try {
        const data = await scan({ id: result.text });
        setInfo(data.body);
        setCount(data.scannedCount);
        toast.success(data.message, { id: toastId });
      } catch (error) {
        toast.error(error.data.fallbackMessage, { id: toastId });
      }
    }
  };

  const handleNext = () => {
    setInfo(null);
  };
  return (
    <>
      <Modal isOpen size="full">
        <ModalOverlay />
        <ModalContent>
          <Text textAlign="center">Total Scanned: {count} (Scan to update)</Text>
          <QrReader
            constraints={{ facingMode: 'environment' }}
            onResult={handleScan}
            scanDelay={200} // ms
            containerStyle={{
              maxWidth: '500px',
            }}
          />
          {info && (
            <>
              <Grid rowGap={2} padding="3" paddingTop="0" templateColumns="1fr 1fr 1fr">
                <GridItem colSpan={1} alignSelf="center">
                  <Text textAlign="center" fontSize="xs">
                    Name
                  </Text>
                </GridItem>
                <GridItem colSpan={2}>
                  <Input isDisabled value={info.user.fullName} />
                </GridItem>
                {quickQuestions.map((question) => (
                  <>
                    <GridItem colSpan={1} alignSelf="center">
                      <Text textAlign="center" fontSize="xs">
                        {question}
                      </Text>
                    </GridItem>
                    <GridItem colSpan={2}>
                      <Input
                        isDisabled
                        value={info.answers.find((item) => question === item.question).answer}
                      />
                    </GridItem>
                  </>
                ))}
                <GridItem colSpan={1}>
                  <Select value={choice} onChange={(event) => setChoice(event.target.value)}>
                    {info.answers.map((answer) => (
                      <option key={answer.id} value={answer.question}>
                        {answer.question}
                      </option>
                    ))}
                  </Select>
                </GridItem>
                <GridItem colSpan={2}>
                  <Input
                    isDisabled
                    value={info.answers.find((item) => choice === item.question).answer}
                  />
                </GridItem>
                <GridItem colSpan={1} colStart={2}>
                  <Button width="100%" onClick={handleNext}>
                    Scan next
                  </Button>
                </GridItem>
              </Grid>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
