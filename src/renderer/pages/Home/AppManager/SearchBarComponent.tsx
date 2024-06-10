import React, { useState } from 'react';
import {
  InputGroup,
  Input,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

type SearchBarComponentProps = {
  onSearch: (searchTerm: string) => void;
};

const SearchBarComponent = ({ onSearch }: SearchBarComponentProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <InputGroup>
      <Input
        placeholder="搜索"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <InputRightElement>
        <IconButton
          icon={<SearchIcon />}
          variant="ghost"
          colorScheme="brand"
          aria-label="Search"
          size="sm"
          onClick={handleSearch}
        />
      </InputRightElement>
    </InputGroup>
  );
};

export default SearchBarComponent;
