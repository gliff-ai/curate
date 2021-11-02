import { Tooltip, icons } from "@gliff-ai/style";

type Tooltips = { [name: string]: Tooltip };

interface ThumbnailSizes {
  name: string;
  icon: string;
  size: number;
}

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
  sort: {
    name: "Sort",
    icon: icons.searchFilter,
  },
  search: {
    name: "Search",
    icon: icons.search,
  },
  addLabels: {
    name: "Update Image Labels",
    icon: icons.annotationLabel,
  },
  addAssignees: {
    name: "Update Assignees",
    icon: icons.removeLabel, //TODO: replace this icon
  },
  close: {
    name: "Close",
    icon: icons.removeLabel,
  },
  autoAssign: {
    name: "Auto-Assign Images",
    icon: icons.usersPage,
  },
};

const thumbnailSizes: ThumbnailSizes[] = [
  {
    name: "Small Thumbnails",
    icon: icons.smallImageGrid,
    size: 132,
  },
  {
    name: "Medium Thumbnails",
    icon: icons.mediumImageGrid,
    size: 211,
  },
  {
    name: "Large Thumbnails",
    icon: icons.largeImageGrid,
    size: 298,
  },
];

export { tooltips, thumbnailSizes, ThumbnailSizes, Tooltips };
