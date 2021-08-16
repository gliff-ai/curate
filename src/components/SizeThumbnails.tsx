import { ReactElement, useState, useEffect } from "react";
import { BaseIconButton, theme } from "@gliff-ai/style";
import { Card } from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

import { thumbnailSizes, ThumbnailSizes } from "@/components/Tooltips";

const useStyles = makeStyles({
  svgSmall: { width: "22px", height: "100%" },
  card: {
    height: "48px",
    backgroundColor: theme.palette.primary.light,
    width: "150px",
    paddingLeft: "5px",
    paddingTop: "1px",
    paddingBottom: "4px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});

interface Props {
  resizeThumbnails: (size: number) => void;
}

export function SizeThumbnails({ resizeThumbnails }: Props): ReactElement {
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
          <BaseIconButton
            key={thumbnailSize.name}
            tooltipPlacement="bottom"
            tooltip={thumbnailSize}
            onClick={() => setButtonClicked(thumbnailSize.name)}
            fill={buttonClicked === thumbnailSize.name}
          />
        ))}
      </Card>
    </div>
  );
}
