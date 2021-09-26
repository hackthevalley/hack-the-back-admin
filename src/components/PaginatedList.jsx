import PropTypes from 'prop-types';
import { useEffect, useState, useRef } from 'react';
import { CgArrowLeft, CgArrowRight } from 'react-icons/cg';
import { useGet } from 'restful-react';

import {
  Table,
  Thead,
  Tbody,
  TableCaption,
  Text,
  HStack,
  Th,
  Tr,
  Td,
  VStack,
  Skeleton,
  Button,
} from '@chakra-ui/react';

import ServerErrorPrompt from './ServerErrorPrompt';

export default function PaginatedList({
  onPageChange = () => {},
  pageSize = 12,
  initPage = 1,
  options = {},
  labels = [],
  children,
  path,
}) {
  const [page, setPage] = useState(initPage);
  const { data, error, loading } = useGet(path, {
    ...options,
    queryParams: {
      ...(options.queryParams ?? {}),
      per_page: pageSize,
      page,
    },
  });

  const memoPage = useRef();
  memoPage.current = onPageChange;
  useEffect(() => {
    memoPage.current(page);
  }, [page]);

  if (error) {
    return <ServerErrorPrompt error={error} />;
  }

  if (loading) {
    return (
      <VStack>
        {new Array(pageSize).fill(0).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Skeleton height="1rem" key={index} />
        ))}
      </VStack>
    );
  }

  const { count, next, previous, results } = data;
  const pages = Math.ceil(count / pageSize) || 1;

  return (
    <Table>
      <Thead>
        <Tr>
          {labels.map(({ label, ...props }, index) => (
            // eslint-disable-next-line react/jsx-props-no-spreading, react/no-array-index-key
            <Th key={index} {...props}>
              {label}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {count ? (
          children(results, page, { count, next, previous })
        ) : (
          <Tr>
            <Td colSpan={labels.length}>
              <Text fontSize="sm" color="gray.500">
                No results found :c
              </Text>
            </Td>
          </Tr>
        )}
      </Tbody>
      <TableCaption>
        <HStack justify="center" spacing="2">
          <Button
            onClick={() => setPage(page - 1)}
            leftIcon={<CgArrowLeft />}
            disabled={page === 1}
            variant="ghost"
            fontSize="sm"
          >
            Prev
          </Button>
          <Text>
            Page {page} of {pages}
          </Text>
          <Button
            onClick={() => setPage(page + 1)}
            rightIcon={<CgArrowRight />}
            disabled={page === pages}
            variant="ghost"
            fontSize="sm"
          >
            Next
          </Button>
        </HStack>
        <Text fontSize="0.75rem" align="center">
          (Total of {count} {count <= 1 ? 'entry' : 'entries'})
        </Text>
      </TableCaption>
    </Table>
  );
}

PaginatedList.propTypes = {
  onPageChange: PropTypes.func,
  children: PropTypes.func.isRequired,
  path: PropTypes.string.isRequired,
  options: PropTypes.shape({}),
  pageSize: PropTypes.number,
  initPage: PropTypes.number,
  labels: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node.isRequired,
    })
  ),
};
