import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { useGet } from 'restful-react';

import DashboardContent from '../components/DashboardContent';

export default function ApplicationDetails() {
  const location = useLocation();
  const history = useHistory();
  const { id } = useParams();
  const { data, loading, error } = useGet(`/api/admin/forms/hacker_application/responses/${id}`);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
      history.replace(`/login?redirect=${location.pathname}`);
    }
  }, [error, history, location]);

  if (error) return null;

  // eslint-disable-next-line no-console
  console.log(data);

  return (
    <DashboardContent title="owo" isLoading={loading}>
      uwu
    </DashboardContent>
  );
}
