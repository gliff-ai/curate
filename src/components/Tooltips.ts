import { ToolTip } from "@gliff-ai/style";
import { svgSrc } from "@/helpers";

type ToolTips = { [name: string]: ToolTip };

const tooltips: ToolTips = {
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
};

export { tooltips, ToolTips };
