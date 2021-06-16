import {
  ListItem,
  Typography,
  ListItemText,
  List,
  Divider,
  IconButton,
  Paper,
  Card,
  Tooltip,
  Avatar,
  Box,
} from "@material-ui/core";
import { MetaItem } from "@/searchAndSort/interfaces";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import React, { ReactElement } from "react";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import SVG from "react-inlinesvg";
import withStyles from "@material-ui/core/styles/withStyles";

type MetadataNameMap = { [index: string]: string };

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      backgroundColor: theme.palette.primary.main,
      paddingLeft: "18px",
      width: "334px",
      height: "44px",
    },
    typography: {
      display: "inline",
      marginRight: "60px",
      marginLeftt: "10px",
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
      backgroundColor: "fff",
      color: "#2B2F3A",
      width: "30px",
      height: "30px",
      display: "inline",
    },
    avatarFontSize: {
      fontSize: "11px",
      fontWeight: 600,
    },
  })
);

const HtmlTooltip = withStyles((t: Theme) => ({
  tooltip: {
    backgroundColor: "#FFFFFF",
    fontSize: t.typography.pxToRem(12),
    border: "1px solid #dadde9",
    color: "#2B2F3A",
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

  return (
    <>
      <Card>
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
            <Avatar className={classes.closeAvatar}>
              <IconButton onClick={props.handleDrawerClose}>
                <ChevronRightIcon />
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
                  <ListItemText>{`${metadataNameMap[key]}: ${props.metadata[
                    key
                  ].toString()}`}</ListItemText>
                </ListItem>
              ))}
          </List>
        </Paper>
      </Card>
    </>
  );
}
