import PropTypes from 'prop-types';
import { useEffect } from 'react';

import { Box } from '@chakra-ui/react';

export default function Layout({ title, children }) {
  useEffect(() => {
    document.title = `${title} | Hack the Back Admin`;
  }, []);

  return (
    <Box bg="gray.50" h="100vh" w="100vw" p={5}>
      {children}
    </Box>
  );
}

Layout.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
};
