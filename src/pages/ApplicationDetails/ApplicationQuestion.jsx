import PropTypes from 'prop-types';

import {
  FormControl,
  FormLabel,
  Input,
  Select,
  FormHelperText,
  FormErrorMessage,
} from '@chakra-ui/react';

import { QUESTION_TYPES } from '../../utils/constants';

export default function ApplicationQuestion({ question, field, meta }) {
  switch (question.type) {
    case QUESTION_TYPES.SELECT:
      return (
        <FormControl id={question.id} isRequired={question.required} isInvalid={!!meta.error}>
          <FormLabel>{question.label}</FormLabel>
          <Select
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...field}
          >
            <option value="" hidden>
              {question.placeholder}
            </option>
            {question.options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
          {question.description && <FormHelperText>{question.description}</FormHelperText>}
          {meta.error && <FormErrorMessage>{meta.error}</FormErrorMessage>}
        </FormControl>
      );
    case QUESTION_TYPES.PDF_FILE:
      return (
        <FormControl
          id={question.id}
          isRequired={question.required}
          isInvalid={!!meta.error}
          isDisabled
        >
          <FormLabel>{question.label}</FormLabel>
          <Input
            placeholder={question.placeholder}
            type="file"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...field}
          />
          {question.description && <FormHelperText>{question.description}</FormHelperText>}
          {meta.error && <FormErrorMessage>{meta.error}</FormErrorMessage>}
          <FormHelperText>Currently not functional :c (Soon TM)</FormHelperText>
        </FormControl>
      );
    case QUESTION_TYPES.HTTP_URL:
      return (
        <FormControl id={question.id} isRequired={question.required} isInvalid={!!meta.error}>
          <FormLabel>{question.label}</FormLabel>
          <Input
            placeholder={question.placeholder}
            type="url"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...field}
          />
          {question.description && <FormHelperText>{question.description}</FormHelperText>}
          {meta.error && <FormErrorMessage>{meta.error}</FormErrorMessage>}
        </FormControl>
      );
    case QUESTION_TYPES.PHONE:
      return (
        <FormControl id={question.id} isRequired={question.required} isInvalid={!!meta.error}>
          <FormLabel>{question.label}</FormLabel>
          <Input
            placeholder={question.placeholder}
            type="tel"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...field}
          />
          {question.description && <FormHelperText>{question.description}</FormHelperText>}
          {meta.error && <FormErrorMessage>{meta.error}</FormErrorMessage>}
        </FormControl>
      );
    case QUESTION_TYPES.EMAIL:
      return (
        <FormControl id={question.id} isRequired={question.required} isInvalid={!!meta.error}>
          <FormLabel>{question.label}</FormLabel>
          <Input
            placeholder={question.placeholder}
            type="email"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...field}
          />
          {question.description && <FormHelperText>{question.description}</FormHelperText>}
          {meta.error && <FormErrorMessage>{meta.error}</FormErrorMessage>}
        </FormControl>
      );
    default:
      return (
        <FormControl id={question.id} isRequired={question.required} isInvalid={!!meta.error}>
          <FormLabel>{question.label}</FormLabel>
          <Input
            placeholder={question.placeholder}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...field}
          />
          {question.description && <FormHelperText>{question.description}</FormHelperText>}
          {meta.error && <FormErrorMessage>{meta.error}</FormErrorMessage>}
        </FormControl>
      );
  }
}

ApplicationQuestion.propTypes = {
  question: PropTypes.shape({
    placeholder: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    description: PropTypes.string,
    required: PropTypes.bool,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
  field: PropTypes.shape({
    onChange: PropTypes.func.isRequired,
    onBlur: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  meta: PropTypes.shape({
    error: PropTypes.string,
  }).isRequired,
};
