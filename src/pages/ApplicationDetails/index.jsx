import { Form, Formik, Field } from 'formik';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CgChevronDown } from 'react-icons/cg';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { useGet, useMutate } from 'restful-react';

import {
  SimpleGrid,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Button,
  ButtonGroup,
  Flex,
  Text,
  Tag,
} from '@chakra-ui/react';

import DashboardContent from '../../components/DashboardContent';
import { APPLICATION_STATUSES, QUESTION_TYPES } from '../../utils/constants';
import useMutableServerData from '../../utils/useMutableServerData';
import ApplicationQuestion from './ApplicationQuestion';
import UpdateApplicationStatus from './ApplicationStatus';

export default function ApplicationDetails() {
  const location = useLocation();
  const history = useHistory();
  const { id } = useParams();
  const {
    data: app,
    loading: appLoading,
    mutate: updateApp,
    error: appError,
  } = useMutableServerData({
    path: `/api/admin/forms/hacker_application/responses/${id}`,
    eager: true,
    verb: 'GET',
  });
  const {
    data: form,
    loading: formLoading,
    error: formError,
  } = useGet(`/api/admin/forms/hacker_application`);
  const { mutate: updateAnswer } = useMutate({
    path: `/api/admin/forms/hacker_application/responses/${id}/answer_question`,
    verb: 'PUT',
  });

  useEffect(() => {
    if (appError || formError) {
      toast.error((appError || formError).message);
      history.replace(`/login?redirect=${location.pathname}`);
    }
  }, [appError, formError, history, location]);

  const appToForm =
    app?.answers?.reduce((acc, answer) => {
      acc[answer.question] = answer;
      return acc;
    }, {}) ?? {};

  const questionsById =
    form?.questions?.reduce((acc, question) => {
      acc[question.id] = question;
      return acc;
    }, {}) ?? [];

  const initialValues =
    form?.questions?.reduce((acc, question) => {
      const { answer, answerOptions } = appToForm[question.id] ?? {};
      acc[question.id] = answer ?? (answerOptions ?? [])[0] ?? question.defaultAnswer ?? '';
      return acc;
    }, {}) ?? [];

  if (appError || formError) return null;

  const tagConfig = APPLICATION_STATUSES[app?.applicant?.status];
  const isLoading = appLoading || formLoading;

  return (
    <DashboardContent
      title={
        isLoading ? (
          'Loading...'
        ) : (
          <Flex justify="space-between" flexWrap="wrap" sx={{ gap: '0.5rem' }}>
            <Text display="flex" align="center">
              {`${app?.user.firstName} ${app?.user.lastName}`}
              {tagConfig && (
                <Tag my="auto" ml="2" colorScheme={tagConfig.color}>
                  {tagConfig.label}
                </Tag>
              )}
            </Text>
            <Menu>
              <MenuButton as={Button} rightIcon={<CgChevronDown />}>
                Actions
              </MenuButton>
              <MenuList fontSize="md">
                <UpdateApplicationStatus
                  onUpdate={(status) => {
                    updateApp({ ...app, applicant: { status } });
                  }}
                  status={app?.applicant.status}
                  id={id}
                />
                <MenuItem>Send Email</MenuItem>
                <MenuItem color="red.400">Delete App</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        )
      }
      isLoading={isLoading}
    >
      <Formik
        onSubmit={async (data, { setFieldError }) => {
          const updatedFields = Object.entries(data).filter(
            ([field, value]) => initialValues[field] !== value
          );
          const toastId = toast.loading('Updating application...');
          try {
            const res = await Promise.allSettled(
              updatedFields.map(([question, value]) => {
                const payload = { question };
                const { type } = questionsById[question];
                switch (type) {
                  case QUESTION_TYPES.SELECT:
                    payload.answerOptions = [{ option: value }];
                    break;
                  default:
                    payload.answer = value;
                    break;
                }

                return updateAnswer(payload).catch((err) => {
                  // eslint-disable-next-line no-throw-literal
                  throw {
                    question,
                    message: err.data.detail.fieldErrors[0].message,
                  };
                });
              })
            );

            const errors = res.reduce((acc, { reason, status }) => {
              if (status === 'rejected') {
                acc.push(questionsById[reason.question].label);
                setFieldError(reason.question, reason.message);
              }
              return acc;
            }, []);

            if (errors.length) {
              throw new Error(`The following fields have failed to update - ${errors.join(', ')}`);
            }
            toast.success('Application Updated!', { id: toastId });
          } catch (err) {
            toast.error(err.message, { id: toastId });
          }
        }}
        initialValues={initialValues}
      >
        {({ isSubmitting, isValid, dirty }) => (
          <Form noValidate>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="8">
              {form.questions.map((question) => (
                <Field key={question.id} name={question.id}>
                  {({ field, meta }) => (
                    <ApplicationQuestion question={question} field={field} meta={meta} />
                  )}
                </Field>
              ))}
            </SimpleGrid>
            <ButtonGroup mt="8" w="100%" justifyContent="end">
              <Button isDisabled={!isValid || !dirty} isLoading={isSubmitting} type="submit">
                Save Changes
              </Button>
            </ButtonGroup>
          </Form>
        )}
      </Formik>
    </DashboardContent>
  );
}
