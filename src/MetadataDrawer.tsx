import { ReactElement, useState } from "react";
import {
  ListItem,
  Typography,
  ListItemText,
  List,
  IconButton,
  Paper,
  Card,
  Avatar,
  Box,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { theme, HtmlTooltip } from "@gliff-ai/style";
import SVG from "react-inlinesvg";
import { MetaItem } from "@/searchAndSort/interfaces";
import { imgSrc } from "./helpers";

type MetadataNameMap = { [index: string]: string };

const useStyles = makeStyles({
  paperHeader: {
    backgroundColor: theme.palette.primary.main,
    width: "334px",
    height: "44px",
    paddingTop: "5px",
  },
  typographyHeader: {
    display: "inline",
    marginLeft: "18px",
    fontWeight: 500,
  },
  mainbox: {
    display: "flex",
    alignItems: "center",
    justifyItems: "space-between",
  },
  popoverAvatar: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.primary,
    width: "30px",
    height: "30px",
  },
  closeAvatar: {
    display: "inline-flex",
    width: "30px",
    height: "30px",
    marginLeft: "150px",
  },
  avatarFontSize: {
    fontSize: "11px",
    fontWeight: 600,
  },
  card: {
    backgroundColor: theme.palette.primary.light,
  },
  metaListItem: {
    paddingTop: "5px",
    paddingBottom: "5px",
    alignItems: "unset",
  },
  metaRoot: {
    margin: 0,
    padding: 0,
    flex: "unset",
    width: "50%",
  },
  metaKey: {
    fontSize: 14,
    fontWeight: 500,
    "& > span": {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  },
  metaValue: {
    fontSize: 14,
    marginLeft: "5px",
    "& > span": {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  },
  svgSmall: { width: "12px", height: "100%" },
});

export const metadataNameMap: MetadataNameMap = {
  imageName: "Name",
  size: "Size",
  dateCreated: "Created",
  dimensions: "Dimensions",
  numberOfDimensions: "No. of Dimensions",
  numberOfChannels: "No. of Channels",
  num_channels: "No. of Channels",
  imageLabels: "Labels",
  width: "Width",
  height: "Height",
  num_slices: "No. of Slices",
  resolution_x: "X Resolution",
  resolution_y: "Y Resolution",
  resolution_z: "Z Resolution",
};

interface Props {
  metadata: MetaItem;
  handleMetadataHide: () => void;
}

export default function MetadataDrawer(props: Props): ReactElement {
  const classes = useStyles();
  const [hover, sethover] = useState(false);

  return (
    <>
      <Card className={classes.card}>
        <Paper elevation={0} variant="outlined" className={classes.paperHeader}>
          <Typography className={classes.typographyHeader}>Metadata</Typography>
          <HtmlTooltip
            key="Return to search"
            title={
              <Box className={classes.mainbox}>
                <Box mr={3} ml={2}>
                  <Typography color="inherit">Return to search </Typography>
                </Box>
                <Avatar className={classes.popoverAvatar}>
                  <Typography className={classes.avatarFontSize}>
                    ESC
                  </Typography>
                </Avatar>
              </Box>
            }
            placement="right"
          >
            <Avatar
              variant="circle"
              className={classes.closeAvatar}
              onMouseOut={() => {
                sethover(false);
              }}
              onMouseOver={() => {
                sethover(true);
              }}
            >
              <IconButton onClick={props.handleMetadataHide}>
                <SVG
                  src={imgSrc("close")}
                  className={classes.svgSmall}
                  fill={
                    hover
                      ? theme.palette.primary.main
                      : theme.palette.text.primary
                  }
                />
              </IconButton>
            </Avatar>
          </HtmlTooltip>
        </Paper>
        <Paper elevation={0} square>
          <List>
            {Object.keys(props.metadata)
              .filter((key) => Object.keys(metadataNameMap).includes(key))
              .map((key) => (
                <ListItem key={key} className={classes.metaListItem}>
                  <ListItemText
                    primaryTypographyProps={{ variant: "h6" }}
                    className={classes.metaKey}
                    title={metadataNameMap[key]}
                    primary={`${metadataNameMap[key]}:`}
                    classes={{
                      primary: classes.metaKey,
                      root: classes.metaRoot,
                    }}
                  />
                  <ListItemText
                    className={classes.metaValue}
                    title={props.metadata[key] as string}
                    primary={
                      key === "imageLabels"
                        ? (props.metadata[key] as string[]).join(", ")
                        : props.metadata[key].toString()
                    }
                    classes={{
                      primary: classes.metaValue,
                      root: classes.metaRoot,
                    }}
                  />
                </ListItem>
              ))}
          </List>
        </Paper>
      </Card>
    </>
  );
}
