export type Metadata = Array<MetaItem>;

export type MetaItem = {
  imageName: string;
  size: string;
  created: string;
  numberOfDimensions: string;
  dimensions: string;
  numberOfChannels: string;
  imageLabels: string[];
  FileMetaVersion: string;
};
