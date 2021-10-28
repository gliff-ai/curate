import { ReactElement, useState, useEffect } from "react";
import { IconButton, theme } from "@gliff-ai/style";
import { ButtonGroup, Card } from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

import { thumbnailSizes, ThumbnailSizes } from "@/components/Tooltips";

const useStyles = makeStyles({
  svgSmall: { width: "22px", height: "100%" },
  card: {
    height: "48px",
    backgroundColor: theme.palette.primary.light,
    width: "150px",
    // paddingLeft: "5px",
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
      <ButtonGroup orientation="horizontal">
        {thumbnailSizes.map((thumbnailSize: ThumbnailSizes) => (
          <IconButton
            key={thumbnailSize.name}
            icon={thumbnailSize.icon}
            tooltipPlacement="bottom"
            tooltip={{ name: thumbnailSize.name }}
            onClick={() => setButtonClicked(thumbnailSize.name)}
            fill={buttonClicked === thumbnailSize.name}
            id={thumbnailSize.id}
          />
        ))}
      </ButtonGroup>
    </div>
  );
}
