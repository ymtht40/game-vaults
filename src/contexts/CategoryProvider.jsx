'use client';

// NOTE: module id: 87207

import { createContext, useContext } from 'react';

const CategoryContext = createContext([]);

export function CategoryProvider({ value, children }) {
  return (
    <CategoryContext.Provider value={value || []}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  return useContext(CategoryContext);
}

export function useCategoryOptions() {
  return useContext(CategoryContext).map((category) => ({
    value: category.slug,
    label: category.name
  }));
}

export function useCategorySlugs() {
  return useContext(CategoryContext).map((category) => category.slug);
}

