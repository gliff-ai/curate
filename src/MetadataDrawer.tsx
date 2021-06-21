/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
import React, { ReactElement, useState } from "react";
import {
  ListItem,
  Typography,
  ListItemText,
  List,
  IconButton,
  Paper,
  Card,
  Tooltip,
  Avatar,
  Box,
} from "@material-ui/core";
import { MetaItem } from "@/searchAndSort/interfaces";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { theme } from "@/theme";
import SVG from "react-inlinesvg";
import withStyles from "@material-ui/core/styles/withStyles";

type MetadataNameMap = { [index: string]: string };

const useStyles = makeStyles(() =>
  createStyles({
    paper: {
      backgroundColor: theme.palette.primary.main,
      paddingLeft: "18px",
      width: "334px",
      height: "44px",
      paddingTop: "5px",
    },
    typography: {
      display: "inline",
      marginRight: "147px",
      marginLeftt: "10px",
      fontWeight: 500,
    },
    mainbox: {
      display: "flex",
      alignItems: "center",
      justifyItems: "space-between",
    },
    popoverAvatar: {
      backgroundColor: theme.palette.primary.main,
      color: "#2B2F3A",
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
    metadata: {
      fontWeight: 500,
    },
    svgSmall: { width: "12px", height: "100%" },
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

export const metadataNameMap: MetadataNameMap = {
  imageName: "Name",
  size: "Size",
  dateCreated: "Created",
  dimensions: "Dimensions",
  numberOfDimensions: "Number Of Dimensions",
  numberOfChannels: "Number Of Channels",
  imageLabels: "Labels",
};

interface Props {
  metadata: MetaItem;
  handleDrawerClose: () => void;
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
              variant="circular"
              className={classes.closeAvatar}
              onMouseOut={() => {
                sethover(false);
              }}
              onMouseOver={() => {
                sethover(true);
              }}
            >
              <IconButton onClick={props.handleDrawerClose}>
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
                <ListItem key={key}>
                  <ListItemText>
                    <Typography
                      className={classes.metadata}
                    >{`${metadataNameMap[key]}:`}</Typography>
                  </ListItemText>
                  <ListItemText>
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
