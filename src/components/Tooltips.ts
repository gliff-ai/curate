import { Tooltip } from "@gliff-ai/style";
import { svgSrc } from "@/helpers";

type Tooltips = { [name: string]: Tooltip };

interface ThumbnailSizes {
  name: string;
  icon: string;
  size: number;
}

const tooltips: Tooltips = {
  deleteImages: {
    name: "Delete Images",
    icon: svgSrc("delete"),
  },
  selectMultipleImages: {
    name: "Select Multiple Images",
    icon: svgSrc("multiple-image-selection"),
  },
  viewCollection: {
    name: "View Collection",
    icon: svgSrc("collections-viewer"),
  },
  uploadImage: {
    name: "Upload Image",
    icon: svgSrc("upload-icon"),
  },
  sort: {
    name: "Sort",
    icon: svgSrc("search-filter"),
  },
  search: {
    name: "Search",
    icon: svgSrc("search"),
  },
};

const thumbnailSizes: ThumbnailSizes[] = [
  {
    name: "Large Thumbnails",
    icon: svgSrc("large-image-grid"),
    size: 298,
  },
  {
    name: "Medium Thumbnails",
    icon: svgSrc("medium-image-grid"),
    size: 211,
  },
  {
    name: "Small Thumbnails",
    icon: svgSrc("small-image-grid"),
    size: 132,
  },
];

export { tooltips, thumbnailSizes, ThumbnailSizes, Tooltips };
