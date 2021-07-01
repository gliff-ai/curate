import React, { ReactElement, useState, useEffect } from "react";
import { theme } from "@/theme";
import { svgSrc } from "@/helpers";

import {
  Avatar,
  Card,
  IconButton,
  Tooltip,
  Typography,
} from "@material-ui/core";
import SVG from "react-inlinesvg";
import {
  makeStyles,
  createStyles,
  withStyles,
  Theme,
} from "@material-ui/core/styles";

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
    iconButton: {
      padding: "0px",
      paddingTop: "4px",
      marginRight: "4px",
    },
  })
);
const HtmlTooltip = withStyles((t: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.primary.light,
    fontSize: t.typography.pxToRem(12),
    border: "1px solid #dadde9",
    color: theme.palette.text.primary,
  },
}))(Tooltip);

interface ThumbnailSizes {
  name: string;
  icon: string;
  size: number;
}

interface Props {
  resizeThumbnails: (size: number) => void;
}

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

export default function SizeThumbnails({
  resizeThumbnails,
}: Props): ReactElement {
  const classes = useStyles();
  const [buttonClicked, setButtonClicked] = useState("");

  useEffect(() => {
    thumbnailSizes.forEach((thumb) => {
      if (thumb.name === buttonClicked) resizeThumbnails(thumb.size);
    });
  }, [buttonClicked]);

  return (
    <div>
      <Card className={classes.card}>
        {thumbnailSizes.map((thumbnailSize: ThumbnailSizes) => (
          <HtmlTooltip
            title={
              <Typography color="inherit">{thumbnailSize.name} </Typography>
            }
            placement="top"
            key={thumbnailSize.name}
          >
            <IconButton
              className={classes.iconButton}
              onClick={() => setButtonClicked(thumbnailSize.name)}
            >
              <Avatar variant="circular">
                <SVG
                  src={thumbnailSize.icon}
                  className={classes.svgSmall}
                  fill={
                    buttonClicked === thumbnailSize.name
                      ? theme.palette.primary.main
                      : null
                  }
                />
              </Avatar>
            </IconButton>
          </HtmlTooltip>
        ))}
      </Card>
    </div>
  );
}
