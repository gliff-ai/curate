export type Metadata = Array<MetaItem>;

export type MetaItem = {
  [index: string]: string | string[];
  imageName: string;
  size: string;
  created: string;
  numberOfDimensions: string;
  dimensions: string;
  numberOfChannels: string;
  imageLabels: string[];
  FileMetaVersion: string;
};
