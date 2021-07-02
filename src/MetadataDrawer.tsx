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
import { MetaItem } from "@/searchAndSort/interfaces";
import { makeStyles } from "@material-ui/core/styles";
import { theme } from "@/theme";
import SVG from "react-inlinesvg";

import { HtmlTooltip } from "@/components/HtmlTooltip";

type MetadataNameMap = { [index: string]: string };

const useStyles = makeStyles({
  paper: {
    backgroundColor: theme.palette.primary.main,
    paddingLeft: "18px",
    width: "334px",
    height: "44px",
    paddingTop: "5px",
  },
  typography: {
    display: "inline",
    marginRight: "135px",
    marginLeft: "10px",
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
  },
  avatarFontSize: {
    fontSize: "11px",
    fontWeight: 600,
  },
  card: {
    backgroundColor: theme.palette.primary.light,
  },
  svgSmall: { width: "12px", height: "100%" },
  metaKey: {
    width: "100px",
    "& > span": {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  },
  metaValue: {
    width: "180px",
    "& > span": {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  },
  metaList: {},
});

export const metadataNameMap: MetadataNameMap = {
  imageName: "Name",
  size: "Size",
  dateCreated: "Created",
  dimensions: "Dimensions",
  numberOfDimensions: "# Dimensions",
  numberOfChannels: "# Channels",
  imageLabels: "Labels",
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
        <Paper elevation={0} variant="outlined" className={classes.paper}>
          <Typography className={classes.typography}>Metadata</Typography>
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
                  src={require("./assets/close.svg") as string}
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
                <ListItem key={key} className={classes.metaList}>
                  <ListItemText
                    primaryTypographyProps={{ variant: "h6" }}
                    className={classes.metaKey}
                  >
                    {metadataNameMap[key]}:
                  </ListItemText>

                  <ListItemText className={classes.metaValue}>
                    {key === "imageLabels"
                      ? (props.metadata[key] as string[]).join(", ")
                      : props.metadata[key].toString()}
                  </ListItemText>
                </ListItem>
              ))}
          </List>
        </Paper>
      </Card>
    </>
  );
}
