/* eslint-disable react/jsx-props-no-spreading */
import { Form, Formik, Field } from 'formik';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { CgMail, CgLock } from 'react-icons/cg';
import { useHistory } from 'react-router-dom';
import { useMutate } from 'restful-react';

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
} from '@chakra-ui/react';

import { validateRequiredEmail, validateRequiredPassword } from '../utils/validators';
import { useUser } from './Authentication';

export default function Login({ next }) {
  const history = useHistory();
  const { mutate: basicAuth } = useMutate({
    path: '/api/account/auth/token/create/basic',
    verb: 'POST',
  });
  const { login } = useUser();

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      onSubmit={async (values) => {
        const loadingToast = toast.loading('Signing in...');
        try {
          const jwt = await basicAuth(values);
          toast.dismiss(loadingToast);
          try {
            await login(jwt.token);
            toast.success('Signed in');
            history.push(next);
          } catch (err) {
            toast.error(err.message);
          }
        } catch (err) {
          toast.dismiss(loadingToast);
          if (err.status === 400 && err.data && err.data.nonFieldErrors) {
            toast.error(err.data.nonFieldErrors[0]);
          } else {
            toast.error('Unexpected error. Try again later.');
          }
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <Field name="email" validate={validateRequiredEmail}>
            {({ field, form }) => (
              <FormControl isInvalid={form.errors.email && form.touched.email}>
                <FormLabel htmlFor="email">Email address</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <CgMail />
                  </InputLeftElement>
                  <Input {...field} type="email" autoFocus isRequired />
                </InputGroup>
                <FormErrorMessage>{form.errors.email}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <Field name="password" validate={validateRequiredPassword}>
            {({ field, form }) => (
              <FormControl mt={4} isInvalid={form.errors.password && form.touched.password}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <CgLock />
                  </InputLeftElement>
                  <Input {...field} type="password" isRequired />
                </InputGroup>
                <FormErrorMessage>{form.errors.password}</FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <Button mt={5} type="submit" isLoading={isSubmitting} loadingText="Signing in">
            Sign In
          </Button>
        </Form>
      )}
    </Formik>
  );
}

Login.propTypes = {
  next: PropTypes.string,
};
