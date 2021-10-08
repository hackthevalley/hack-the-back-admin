import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { Heading, ButtonGroup, Button, Select } from '@chakra-ui/react';

import { APPLICATION_STATUSES } from '../../utils/constants';
import SimplifiedModal from '../SimplifiedModal';

export default function UpdateApplicationStatusModal({ initStatus, disclosure, onUpdate }) {
  const [status, setStatus] = useState(initStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setStatus(initStatus);
  }, [initStatus, disclosure.isOpen]);

  return (
    <SimplifiedModal
      disclosure={disclosure}
      onClose={() => setStatus(initStatus)}
      header={
        <Heading as="h3" fontSize="xl" mt="2">
          Update Application Status
        </Heading>
      }
      footer={
        <ButtonGroup>
          <Button onClick={disclosure.onClose} type="button">
            Cancel
          </Button>
          <Button
            isLoading={isUpdating}
            onClick={(e) => {
              setIsUpdating(true);
              e.preventDefault();
              onUpdate(status, initStatus)
                .then(() => disclosure.onClose())
                .catch((err) => toast.error(err.data.detail.fieldErrors[0].message))
                .finally(() => setIsUpdating(false));
              disclosure.onClose();
              return false;
            }}
            type="button"
          >
            Update Status
          </Button>
        </ButtonGroup>
      }
    >
      <Select
        placeholder="Select a status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        {Object.entries(APPLICATION_STATUSES).map(([key, { label }]) => (
          <option value={key} key={key}>
            {label}
          </option>
        ))}
      </Select>
    </SimplifiedModal>
  );
}

UpdateApplicationStatusModal.propTypes = {
  disclosure: SimplifiedModal.propTypes.disclosure,
  onUpdate: PropTypes.func.isRequired,
  initStatus: PropTypes.string,
};
