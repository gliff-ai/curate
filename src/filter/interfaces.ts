type Filter = {
  key: string;
  value: string;
};

interface FilterDataItem {
  [key: string]: string | boolean | number | string[] | undefined;
  filterShow: boolean;
  newGroup: boolean;
}

type FilterData = FilterDataItem[];

export type { Filter, FilterDataItem, FilterData };
