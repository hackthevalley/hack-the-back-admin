import { PropTypes } from 'prop-types';
import { useMutate } from 'restful-react';

import { MenuItem, useDisclosure } from '@chakra-ui/react';

import UpdateApplicationStatusModal from '../../components/modals/UpdateApplicationStatus';

export default function UpdateApplicationStatus({ status, onUpdate, id }) {
  const { mutate } = useMutate({
    path: `/api/admin/forms/hacker_application/responses/batch_status_update`,
    verb: 'POST',
  });
  const disclosure = useDisclosure();
  return (
    <>
      <MenuItem onClick={disclosure.onOpen}>Change Status</MenuItem>
      <UpdateApplicationStatusModal
        disclosure={disclosure}
        initStatus={status}
        onUpdate={async (newStatus) => {
          await mutate({
            status: newStatus,
            responses: [id],
          });
          onUpdate(newStatus);
        }}
      />
    </>
  );
}

UpdateApplicationStatus.propTypes = {
  onUpdate: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  status: PropTypes.string,
};
