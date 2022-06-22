type Filter = {
  key: string;
  value: string;
};

interface Item {
  [key: string]: string | boolean | number | string[];
  filterShow: boolean;
}

type Data = Item[];

export type { Filter, Item, Data };
