import {
  Drawer,
  ListItem,
  Typography,
  ListItemText,
  List,
  Divider,
  Toolbar,
} from "@material-ui/core";
import { MetaItem } from "@/search/interfaces";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import React, { ReactElement } from "react";

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      width: drawerWidth, // it seems that this width is used for positioning and wrapping (increase it and the tiles will wrap as though the drawer was wider, but it won't render wider)
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth, // while this width is used for drawing the Drawer (increase it and the drawer will get wider but will draw over the tiles without wrapping them)
    },
  })
);

type MetadataNameMap = { [index: string]: string };
const metadataNameMap: MetadataNameMap = {
  imageName: "Name",
  size: "Size",
  created: "Created",
  dimensions: "Dimensions",
  numberOfDimensions: "Number Of Dimensions",
  numberOfChannels: "Number Of Channels",
  imageLabels: "Labels",
};

interface Props {
  metadata: MetaItem;
}

export default function MetadataDrawer(props: Props): ReactElement {
  const classes = useStyles();

  return (
    <Drawer
      variant="permanent"
      anchor="right"
      className={classes.drawer}
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <Toolbar />
      {/* This empty toolbar pushes the drawer contents down by the same thickness of the AppBard, so that they don't render behind it */}
      {/* Moving the drawer itself down by placing a Toolbar above it seems not to work so instead we move its contents down and draw the AppBar on top of it */}
      <ListItem>
        <Typography variant="h4">Metadata</Typography>
      </ListItem>
      <Divider />

      <List>
        {Object.entries(props.metadata)
          .filter(([key, value]) => Object.keys(metadataNameMap).includes(key))
          .map(([key, value], index) => (
            <ListItem key={index}>
              <ListItemText>{`${metadataNameMap[key]}: ${value}`}</ListItemText>
            </ListItem>
          ))}
      </List>
    </Drawer>
  );
}
