/* eslint-disable react/jsx-props-no-spreading */
import { Form, Formik, Field } from 'formik';
import toast from 'react-hot-toast';
import { CgMail, CgLock } from 'react-icons/cg';
import { useHistory, Redirect } from 'react-router-dom';
import { useMutate } from 'restful-react';

import {
  Flex,
  Container,
  Box,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
} from '@chakra-ui/react';

import { useUser } from '../components/Authentication';
import ServerErrorPrompt from '../components/ServerErrorPrompt';
import { validateRequiredEmail, validateRequiredPassword } from '../utils/validators';

export default function LoginPage() {
  const history = useHistory();
  const { mutate: basicAuth } = useMutate({
    path: '/api/account/auth/token/create/basic',
    verb: 'POST',
  });
  const { isAuthenticated, login } = useUser();

  // If user is already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <Flex minW="100%" minH="100%" justifyContent="center" alignItems="center">
      <Container py={10}>
        <Box padding={7} width="100%">
          <Heading as="h1" size="md" cursor="default">
            Sign in to view admin dashboard
          </Heading>
          <Formik
            initialValues={{ email: '', password: '' }}
            onSubmit={async (values, actions) => {
              const loadingToast = toast.loading('Signing in...');
              try {
                const jwt = await basicAuth(values);
                toast.dismiss(loadingToast);
                try {
                  await login(jwt.token);
                  toast.success('Signed in');
                  history.push('/');
                } catch (err) {
                  toast.error(err.message);
                }
              } catch (err) {
                toast.dismiss(loadingToast);
                if (err.status === 400 && err.data && err.data.nonFieldErrors) {
                  toast.error(err.data.nonFieldErrors[0]);
                } else {
                  actions.setStatus({ error: err });
                }
              }
            }}
          >
            {({ isSubmitting, status }) => (
              <Form>
                {status && status.error != null && (
                  <Box mt={4}>
                    <ServerErrorPrompt error={status.error} />
                  </Box>
                )}
                <Field name="email" validate={validateRequiredEmail}>
                  {({ field, form }) => (
                    <FormControl mt={4} isInvalid={form.errors.email && form.touched.email}>
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
        </Box>
      </Container>
    </Flex>
  );
}
