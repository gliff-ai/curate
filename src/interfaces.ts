export type Metadata = Array<MetaItem>;

export type MetaItem = {
  [index: string]: string | string[] | boolean | number;
};

export type Filter = {
  key: string;
  value: string;
};
