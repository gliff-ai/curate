import {
  Drawer,
  ListItem,
  Typography,
  ListItemText,
  List,
  Divider,
  Toolbar,
  IconButton,
} from "@material-ui/core";
import { MetaItem } from "@/searchAndSort/interfaces";
import { makeStyles } from "@material-ui/core/styles";
import React, { ReactElement } from "react";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

const drawerWidth = 240;

const useStyles = makeStyles({
  drawer: {
    width: (props: Props) => props.isOpen * drawerWidth, // it seems that this width is used for positioning and wrapping (increase it and the tiles will wrap as though the drawer was wider, but it won't render wider)
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth, // while this width is used for drawing the Drawer (increase it and the drawer will get wider but will draw over the tiles without wrapping them)
  },
});

type MetadataNameMap = { [index: string]: string };

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
  isOpen: number;
}

export default function MetadataDrawer(props: Props): ReactElement {
  const { drawer, drawerPaper } = useStyles(props);

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={Boolean(props.isOpen)}
      className={`${drawer} ${drawerPaper}`}
    >
      <Toolbar />
      {/* This empty toolbar pushes the drawer contents down by the same thickness of the AppBard, so that they don't render behind it */}
      {/* Moving the drawer itself down by placing a Toolbar above it seems not to work so instead we move its contents down and draw the AppBar on top of it */}

      <ListItem style={{ justifyContent: "space-between" }}>
        <Typography variant="h4">Metadata</Typography>
        <IconButton onClick={props.handleDrawerClose}>
          <ChevronRightIcon />
        </IconButton>
      </ListItem>
      <Divider />

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
    </Drawer>
  );
}
