import PropTypes from 'prop-types';
import { useGet } from 'restful-react';

import { Button } from '@chakra-ui/react';

export default function ViewResume({ pdfid }) {
  const {
    data: pdfdata,
    error,
    loading,
  } = useGet(`api/admin/forms/hacker_application/responses/files/${pdfid}/download`);

  if (loading) return <div>Loading...</div>; // You can replace this with a loading spinner or any other loading indicator.

  if (error || !pdfdata) return null;

  const handleViewResume = async () => {
    try {
      const blob = await pdfdata.blob(); // Wait for the Promise to resolve to the actual response data.
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL);
    } catch (err) {
      // handle error
    }
  };

  return <Button onClick={handleViewResume}>View Resume</Button>;
}

ViewResume.propTypes = { pdfid: PropTypes.string.isRequired };
