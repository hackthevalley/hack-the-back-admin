import { useCallback, useMemo } from 'react';
import { CgChevronDown, CgSearch, CgFilters } from 'react-icons/cg';
import { Link } from 'react-router-dom';

import {
  Tr,
  Td,
  Tag,
  Text,
  SimpleGrid,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
  VStack,
  InputGroup,
  InputRightElement,
  useDisclosure,
  ButtonGroup,
  FormControl,
  FormLabel,
  Select,
  Input,
} from '@chakra-ui/react';

import DashboardContent from '../components/DashboardContent';
import PaginatedList from '../components/PaginatedList';
import SimplifiedModal from '../components/SimplifiedModal';
import { APPLICATION_STATUSES } from '../utils/constants';
import useTransactionalState from '../utils/useTransactionalState';

const labels = [
  {
    label: 'Hacker',
  },
  {
    label: 'Status',
  },
  {
    label: 'Timestamp',
  },
  {
    label: 'Actions',
  },
];

const applicationOptions = Object.entries(APPLICATION_STATUSES).map(([value, options]) => ({
  label: options.label,
  value,
}));

const initState = () => {
  const searchParams = new URLSearchParams(window.location.search);
  return {
    applicant__status: searchParams.get('applicant__status') ?? '',
    user__search: searchParams.get('user__search') ?? '',
  };
};

export default function Applications() {
  const formatDate = (date) =>
    new Intl.DateTimeFormat(navigator.language, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(date));

  const filterDisclosure = useDisclosure();
  const {
    staged: filters,
    master: queryParams,
    push,
    commit,
    restore,
  } = useTransactionalState(initState);

  const setCurrentParams = useCallback((params) => {
    const query = new URLSearchParams(params);
    window.history.replaceState(null, null, `?${query}`);
  }, []);

  const options = useMemo(() => ({ queryParams }), [queryParams]);

  return (
    <DashboardContent title="Hacker Applications">
      <HStack mb="4" spacing="3">
        <InputGroup
          as="form"
          onSubmit={(e) => {
            e.preventDefault();
            commit();
            return false;
          }}
        >
          <Input
            onChange={(e) => push({ user__search: e.target.value })}
            value={filters.user__search}
            pr="5.5rem"
            placeholder="Search Applications"
          />
          <InputRightElement width="5rem">
            <Button onClick={commit} h="1.75rem" mr="1" size="sm" icon={<CgSearch />}>
              Search
            </Button>
          </InputRightElement>
        </InputGroup>
        <div>
          <Button onClick={filterDisclosure.onOpen} leftIcon={<CgFilters />}>
            Filters
          </Button>
        </div>
        <div>
          <Menu>
            <MenuButton as={Button} rightIcon={<CgChevronDown />}>
              Batch Actions
            </MenuButton>
            <MenuList>
              <MenuItem>Change Status</MenuItem>
              <MenuItem>Send Email</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </HStack>
      <PaginatedList
        initPage={parseInt(new URLSearchParams(window.location.search).get('page') || 1, 10)}
        path="/api/admin/forms/hacker_application/responses"
        options={options}
        labels={labels}
        onPageChange={(page) => {
          setCurrentParams({ ...queryParams, page });
        }}
      >
        {(results) =>
          results.map((result) => {
            const statusConfig = APPLICATION_STATUSES[result.applicant.status];
            return (
              <Tr key={result.id}>
                <Td fontSize="sm">
                  <Text>
                    {result.user.firstName} {result.user.lastName}
                  </Text>
                  <Tag mt="1" size="sm">
                    {result.user.email}
                  </Tag>
                </Td>
                <Td fontSize="sm">
                  <Tag colorScheme={statusConfig.color}>{statusConfig.label}</Tag>
                </Td>
                <Td fontSize="xs">
                  <SimpleGrid columns="2" gap="1" width="fit-content" templateColumns="auto 1fr">
                    <Text align="end">Updated At:</Text>
                    <Tag size="sm">{formatDate(result.updatedAt)}</Tag>
                    <Text align="end">Created At:</Text>
                    <Tag size="sm">{formatDate(result.createdAt)}</Tag>
                  </SimpleGrid>
                </Td>
                <Td>
                  <Menu>
                    <MenuButton size="sm" as={Button} rightIcon={<CgChevronDown />}>
                      Actions
                    </MenuButton>
                    <MenuList>
                      <MenuItem as={Link} to={`/apps/${result.id}`}>
                        View Application
                      </MenuItem>
                      <MenuItem as={Link} to={`/users/${result.user.id}`}>
                        View User
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            );
          })
        }
      </PaginatedList>
      <SimplifiedModal
        header="Hacker Application Filters"
        disclosure={filterDisclosure}
        onClose={restore}
        as="form"
        onSubmit={(e) => {
          e.preventDefault();
          filterDisclosure.onClose();
          return false;
        }}
        footer={
          <ButtonGroup>
            <Button
              onClick={() => {
                restore();
                filterDisclosure.onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Apply Filters</Button>
          </ButtonGroup>
        }
      >
        <VStack align="start">
          <FormControl>
            <FormLabel>Application Status</FormLabel>
            <Select
              onChange={(e) =>
                push({
                  applicant__status: e.target.value,
                })
              }
              value={filters.applicant__status}
            >
              <option value="">None</option>
              {applicationOptions.map(({ label, value }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FormControl>
        </VStack>
      </SimplifiedModal>
    </DashboardContent>
  );
}
