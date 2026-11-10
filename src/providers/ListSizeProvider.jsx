'use client';

// Variable Mapping: a -> ListSizeContext, e -> value, r -> children
// NOTE: module id: 637161
import { createContext, useContext } from 'react';

const ListSizeContext = createContext(null);

export function ListSizeProvider({ value, children }) {
  return (
    <ListSizeContext.Provider value={value}>
      {children}
    </ListSizeContext.Provider>
  );
}

export function useListSize() {
  return useContext(ListSizeContext);
}

