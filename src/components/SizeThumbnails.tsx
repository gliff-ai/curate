import React, { ReactElement, useState, useEffect } from "react";
import { theme } from "@/theme";

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
      paddingLeft: "5px",
      paddingTop: "1px",
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
}

interface Props {
  largeThumbnails: () => void;
  mediumThumbnails: () => void;
  smallThumbnails: () => void;
}

const thumbnailSizes: ThumbnailSizes[] = [
  {
    name: "Large Thumbnails",
    icon: require(`../assets/large-image-grid.svg`) as string,
  },

  {
    name: "Medium Thumbnails",
    icon: require(`../assets/medium-image-grid.svg`) as string,
  },
  {
    name: "Small Thumbnails",
    icon: require(`../assets/small-image-grid.svg`) as string,
  },
];

export default function SizeThumbnails(props: Props): ReactElement {
  const classes = useStyles();
  const [buttonClicked, setButtonClicked] = useState("");

  useEffect(() => {
    if (buttonClicked === "Large") {
      props.largeThumbnails();
    }
    if (buttonClicked === "Medium") {
      props.mediumThumbnails();
    }
    if (buttonClicked === "Small") {
      props.smallThumbnails();
    }
  }, [buttonClicked]);

  return (
    <div>
      <Card className={classes.card}>
        {thumbnailSizes.map((thumbnailSize: ThumbnailSizes) => (
          <Avatar variant="rounded" key={thumbnailSize.name}>
            <HtmlTooltip
              title={
                <Typography color="inherit">{thumbnailSize.name} </Typography>
              }
              placement="top"
            >
              <IconButton onClick={() => setButtonClicked(thumbnailSize.name)}>
                <SVG
                  src={thumbnailSize.icon}
                  className={classes.svgSmall}
                  fill={
                    buttonClicked === thumbnailSize.name
                      ? theme.palette.primary.main
                      : null
                  }
                />
              </IconButton>
            </HtmlTooltip>
          </Avatar>
        ))}
      </Card>
    </div>
  );
}
