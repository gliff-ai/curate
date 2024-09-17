type Filter = {
  key: string;
  value: string;
};

interface FilterDataItem {
  [key: string]: string | number | boolean | string[] | undefined | null;
  filterShow: boolean;
  newGroup: boolean;
}

type FilterData = FilterDataItem[];

export type { Filter, FilterDataItem, FilterData };
