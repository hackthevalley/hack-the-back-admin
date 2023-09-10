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
  const [code, setCode] = useState('');
  const [info, setInfo] = useState(null);
  const [question, setQuestion] = useState('T-Shirt Size');
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
        toast.success(data.message, { id: toastId });
      } catch (error) {
        toast.error(error.data.fallbackMessage, { id: toastId });
        return;
      }
      setCode(result.text);
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
          <QrReader
            constraints={{ facingMode: 'environment' }}
            onResult={handleScan}
            scanDelay={200} // ms
          />
          {info && (
            <>
              <Grid rowGap={2} templateColumns="1fr 1fr">
                <GridItem colSpan={2}>
                  <Text textAlign="center" fontSize={12} color="lime">
                    Scanned code: {code} ({info.user.fullName})
                  </Text>
                </GridItem>
                <GridItem colSpan={1} colStart={2}>
                  {/* garbage but good enough */}
                  <Select value={question} onChange={(event) => setQuestion(event.target.value)}>
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
                    textAlign="right"
                    value={info.answers.find((item) => question === item.question).answer}
                  />
                </GridItem>
                <GridItem colSpan={1}>
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
