import type { FilterTree } from '@/types';

// Sample data matching the reference image
export const sampleFilters: FilterTree = {
  id: 'root',
  type: 'group',
  operator: 'AND',
  children: [
    {
      id: 'filter-1',
      type: 'filter',
      text: 'Select contacts by behaviour in last 7 days number of Abandoned Cart equals 1',
    },
    {
      id: 'group-1',
      type: 'group',
      operator: 'OR',
      children: [
        {
          id: 'filter-2',
          type: 'filter',
          text: 'Select from "emoji test" segment',
        },
        {
          id: 'filter-3',
          type: 'filter',
          text: 'Contact that have bounce from Email Channel',
        },
        {
          id: 'group-2',
          type: 'group',
          operator: 'AND',
          children: [
            {
              id: 'filter-4',
              type: 'filter',
              text: 'master_contact \u203A gender equals F',
            },
            {
              id: 'filter-5',
              type: 'filter',
              text: 'master_contact \u203A birth_date is after current date minus 50 years',
            },
          ],
        },
      ],
    },
  ],
};

// Empty starter template
export const emptyFilters: FilterTree = {
  id: 'root',
  type: 'group',
  operator: 'AND',
  children: [],
};
