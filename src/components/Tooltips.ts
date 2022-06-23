import { Tooltip, icons } from "@gliff-ai/style";

type Tooltips = { [name: string]: Tooltip };

interface ThumbnailSizes {
  name: string;
  icon: string;
  size: number;
  id?: string;
}

interface DatasetViewType {
  name: string;
  icon: string;
  id?: string;
}

const datasetType: DatasetViewType[] = [
  {
    name: "View Dataset as Images",
    icon: icons.imageViewer,
    id: "image-dataset-view",
  },
  {
    name: "View Dataset as Table",
    icon: icons.tableViewer,
    id: "table-dataset-view",
  },
];

const tooltips: Tooltips = {
  deleteImages: {
    name: "Delete Images",
    icon: icons.delete,
  },
  selectMultipleImages: {
    name: "Select Multiple Images",
    icon: icons.multipleImageSelection,
  },
  viewCollection: {
    name: "View Collection",
    icon: icons.collectionsViewerToggle,
  },
  uploadImage: {
    name: "Upload Image",
    icon: icons.upload,
  },
  downloadDataset: {
    name: "Download Dataset",
    icon: icons.download,
  },
  addLabels: {
    name: "Update Image Labels",
    icon: icons.annotationLabel,
  },
  addAssignees: {
    name: "Update Assignees",
    icon: icons.usersPage,
  },
  close: {
    name: "Close",
    icon: icons.removeLabel,
  },
  autoAssign: {
    name: "Auto-Assign Images",
    icon: icons.autoAssign,
  },
  defaultLabels: {
    name: "Set default labels",
    icon: icons.annotationLabels,
  },
  viewAnnotations: {
    name: "View Annotations",
    icon: icons.imageViewer,
  },
};

const thumbnailSizes: ThumbnailSizes[] = [
  {
    name: "Small Thumbnails",
    icon: icons.smallImageGrid,
    size: 132,
    id: "small-thumbnail",
  },
  {
    name: "Medium Thumbnails",
    icon: icons.mediumImageGrid,
    size: 211,
    id: "medium-thumbnail",
  },
  {
    name: "Large Thumbnails",
    icon: icons.largeImageGrid,
    size: 298,
    id: "large-thumbnail",
  },
];

export {
  tooltips,
  thumbnailSizes,
  datasetType,
  DatasetViewType,
  ThumbnailSizes,
  Tooltips,
};
