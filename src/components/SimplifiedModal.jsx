import PropTypes from 'prop-types';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';

export default function SimplifiedModal({
  disclosure,
  onClose = () => {},
  footer,
  header,
  children,
  ...props
}) {
  return (
    <Modal
      isOpen={disclosure.isOpen}
      onClose={async () => {
        await onClose();
        disclosure.onClose();
      }}
    >
      <ModalOverlay />
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <ModalContent {...props}>
        <ModalHeader>{header}</ModalHeader>
        <ModalBody>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </Modal>
  );
}

SimplifiedModal.propTypes = {
  disclosure: PropTypes.shape({
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
  }).isRequired,
  onClose: PropTypes.func,
  header: PropTypes.node,
  footer: PropTypes.node,
  children: PropTypes.node.isRequired,
};
