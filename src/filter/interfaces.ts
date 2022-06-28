type Filter = {
  key: string;
  value: string;
};

interface FilterDataItem {
  [key: string]: string | boolean | number | string[];
  filterShow: boolean;
  newGroup: boolean;
}

type FilterData = FilterDataItem[];

export type { Filter, FilterDataItem, FilterData };