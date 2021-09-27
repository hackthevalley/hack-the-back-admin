import PropTypes from 'prop-types';
import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { CgArrowLeft, CgArrowRight } from 'react-icons/cg';
import { useMutate } from 'restful-react';

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
  Box,
  Button,
  Editable,
  EditablePreview,
  EditableInput,
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
  const isInit = useRef(true);
  const [page, setPage] = useState(initPage);
  const [editPage, setEditPage] = useState(initPage);
  const [currentPage, setCurrentPage] = useState();
  const { mutate, error, loading } = useMutate({
    path,
    verb: 'GET',
  });

  useEffect(() => {
    const pageValue = isInit.current ? initPage : 1;
    isInit.current = false;
    mutate(undefined, {
      ...options,
      queryParams: {
        ...(options.queryParams ?? {}),
        per_page: pageSize,
        page: pageValue,
      },
    }).then(setCurrentPage);
    setEditPage(pageValue);
    setPage(pageValue);
  }, [options, mutate]);

  const memoPage = useRef();
  memoPage.current = onPageChange;
  useEffect(() => {
    memoPage.current(page);
  }, [page]);

  if (error) {
    return <ServerErrorPrompt error={error} />;
  }

  if (loading && !currentPage) {
    return (
      <VStack spacing="4">
        {new Array(pageSize).fill(0).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Skeleton h="12" w="100%" key={index} />
        ))}
      </VStack>
    );
  }

  const { count, next, previous, results } = currentPage ?? {};
  const pages = Math.ceil(count / pageSize) || 1;

  const changePage = async (newPage) => {
    const res = await mutate(undefined, {
      ...options,
      queryParams: {
        ...(options.queryParams ?? {}),
        per_page: pageSize,
        page: newPage,
      },
    });
    setCurrentPage(res);
    setEditPage(newPage);
    setPage(newPage);
  };

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
      <Tbody opacity={loading ? 0.4 : 1} pointerEvents={loading ? 'none' : 'initial'}>
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
        <HStack justify="center" spacing="4">
          <Button
            onClick={async () => {
              await changePage(page - 1);
            }}
            leftIcon={<CgArrowLeft />}
            disabled={page === 1}
            variant="ghost"
            fontSize="sm"
            isLoading={loading}
          >
            Prev
          </Button>
          <Box>
            <Text>
              Page{' '}
              <Editable
                display="inline-block"
                as="span"
                onChange={(value) => setEditPage(parseInt(value, 10))}
                value={editPage}
                onSubmit={async (value) => {
                  const newPage = parseInt(value, 10);
                  if (page === newPage || newPage < 1 || newPage > pages) {
                    if (page !== newPage) {
                      toast.error(`Page must be between 1 - ${pages}`);
                    }
                    setEditPage(page);
                    return;
                  }
                  await changePage(newPage);
                }}
              >
                <EditablePreview />
                <EditableInput type="number" min="1" max="pages" step="1" />
              </Editable>{' '}
              of {pages}
            </Text>
            <Text fontSize="0.75rem" align="center">
              (Total of {count} {count <= 1 ? 'entry' : 'entries'})
            </Text>
          </Box>
          <Button
            onClick={async () => {
              await changePage(page + 1);
            }}
            rightIcon={<CgArrowRight />}
            disabled={page === pages}
            variant="ghost"
            fontSize="sm"
            isLoading={loading}
          >
            Next
          </Button>
        </HStack>
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
