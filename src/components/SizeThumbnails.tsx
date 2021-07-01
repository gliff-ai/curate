import React, { ReactElement, useState, useEffect } from "react";
import { theme } from "@/theme";

import { Card } from "@material-ui/core";

import { makeStyles, createStyles } from "@material-ui/core/styles";
import TooltipButton from "@/components/TooltipButton";

const useStyles = makeStyles(() =>
  createStyles({
    svgSmall: { width: "22px", height: "100%" },
    card: {
      height: "48px",
      backgroundColor: theme.palette.primary.light,
      width: "150px",
      paddingLeft: "10px",
      paddingTop: "1px",
    },
  })
);

interface ThumbnailSizes {
  name: string;
  icon: string;
  size: number;
}

interface Props {
  resizeThumbnails: (size: number) => void;
}

export const thumbnailSizes: ThumbnailSizes[] = [
  {
    name: "Large Thumbnails",
    icon: "large-image-grid",
    size: 298,
  },
  {
    name: "Medium Thumbnails",
    icon: "medium-image-grid",
    size: 211,
  },
  {
    name: "Small Thumbnails",
    icon: "small-image-grid",
    size: 132,
  },
];

export default function SizeThumbnails({
  resizeThumbnails,
}: Props): ReactElement {
  const classes = useStyles();
  const [buttonClicked, setButtonClicked] = useState("Small Thumbnails");

  useEffect(() => {
    thumbnailSizes.forEach((thumb) => {
      if (thumb.name === buttonClicked) resizeThumbnails(thumb.size);
    });
  }, [buttonClicked]);

  return (
    <div>
      <Card className={classes.card}>
        {thumbnailSizes.map((thumbnailSize: ThumbnailSizes) => (
          <TooltipButton
            key={thumbnailSize.name}
            tooltip={thumbnailSize.name}
            svgSrc={thumbnailSize.icon}
            size="inline"
            onClick={() => setButtonClicked(thumbnailSize.name)}
            isActive={buttonClicked === thumbnailSize.name}
          />
        ))}
      </Card>
    </div>
  );
}
