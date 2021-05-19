export type Metadata = Array<MetaItem>;

export type MetaItem = {
  [index: string]: string | string[] | ImageBitmap | boolean;
};

export type Filter = {
  key: string;
  value: string;
};
