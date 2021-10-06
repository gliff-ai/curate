import { Tooltip } from "@gliff-ai/style";
import { imgSrc } from "@/helpers";

type Tooltips = { [name: string]: Tooltip };

interface ThumbnailSizes {
  name: string;
  icon: string;
  size: number;
}

const tooltips: Tooltips = {
  deleteImages: {
    name: "Delete Images",
    icon: imgSrc("delete"),
  },
  selectMultipleImages: {
    name: "Select Multiple Images",
    icon: imgSrc("multiple-image-selection"),
  },
  viewCollection: {
    name: "View Collection",
    icon: imgSrc("collections-viewer"),
  },
  uploadImage: {
    name: "Upload Image",
    icon: imgSrc("upload-icon"),
  },
  downloadDataset: {
    name: "Download Dataset",
    icon: imgSrc("download-icon"),
  },
  sort: {
    name: "Sort",
    icon: imgSrc("search-filter"),
  },
  search: {
    name: "Search",
    icon: imgSrc("search"),
  },
  addLabels: {
    name: "Update image labels",
    icon: imgSrc("non-active-annotation-label-search-filter"),
  },
  addAssignees: {
    name: "Update assignees",
    icon: imgSrc("close"), //TODO: replace this icon
  },
};

const thumbnailSizes: ThumbnailSizes[] = [
  {
    name: "Large Thumbnails",
    icon: imgSrc("large-image-grid"),
    size: 298,
  },
  {
    name: "Medium Thumbnails",
    icon: imgSrc("medium-image-grid"),
    size: 211,
  },
  {
    name: "Small Thumbnails",
    icon: imgSrc("small-image-grid"),
    size: 132,
  },
];

export { tooltips, thumbnailSizes, ThumbnailSizes, Tooltips };
