import React, { Component, ChangeEvent, ReactNode } from "react";
import {
  AppBar,
  CssBaseline,
  Toolbar,
  Grid,
  Typography,
  Theme,
  withStyles,
  Drawer,
  List,
  ListItem,
  Divider,
  ListItemText,
} from "@material-ui/core";
import { Metadata, MetaItem } from "./search/interfaces";
import ComboBox from "./search/ComboBox";
import LabelsAccordion from "./search/LabelsAccordion";
import MetadataDrawer from "./MetadataDrawer";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import MailIcon from "@material-ui/icons/Mail";

const drawerWidth = 240;

const styles = (theme: Theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    // width: `calc(100% - ${drawerWidth}px)`,
    width: `calc(100%)`,
    // marginRight: drawerWidth,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
  drawer: {
    width: drawerWidth, // it seems that this width is used for positioning and wrapping (increase it and the tiles will wrap as though the drawer was wider, but it won't render wider)
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth, // while this width is used for drawing the Drawer (increase it and the drawer will get wider but will draw over the tiles without wrapping them)
  },
});

export interface Tile {
  id: string;
  name: string;
  label: string;
  thumbnail: string; // base64
}
interface Props {
  tiles: Array<Tile>;
  classes: any;
}
interface State {
  metadata: Metadata;
  metadataKeys: string[];
  imageLabels: string[];
  imageNames: string[];
  expanded: string | boolean;
  selected: number;
}

class UserInterface extends Component<Props, State> {
  private filteredMeta: Metadata;

  constructor(props: Props) {
    super(props);

    this.state = {
      metadata: [],
      metadataKeys: [],
      imageLabels: [],
      imageNames: [],
      expanded: "labels-toolbox",
      selected: null,
    };

    this.filteredMeta = [];
  }

  componentDidMount = (): void => {
    this.loadMeta("metadata.json", (data: Metadata): void => {
      // Load metadata from json file.
      if (data && data.length > 0) {
        this.setState({
          metadata: data,
          metadataKeys: Object.keys(data[0]),
          imageLabels: this.getImageLabels(data),
          imageNames: this.getImageNames(data),
        });
        this.filteredMeta = data;
      }
    });
  };

  handleOnSearchSubmit = (inputKey: string, inputValue: string): void => {
    if (inputKey === "" || inputValue === "") return;

    // Filter metadata based on inputKey and inputValue
    const filteredMeta: Metadata = [];
    this.state.metadata.forEach((mitem: MetaItem) => {
      for (const [key, value] of Object.entries(mitem)) {
        if (key === inputKey) {
          if (
            (typeof value === "object" && value.includes(inputValue)) ||
            value === inputValue
          ) {
            filteredMeta.push(mitem);
            break;
          }
        }
      }
    });
    this.filteredMeta = filteredMeta;
    this.setState({
      imageNames: this.getImageNames(filteredMeta),
    });
  };

  handleToolboxChange = (panel: string) => (
    event: ChangeEvent,
    isExpanded: boolean
  ): void => {
    this.setState({ expanded: isExpanded ? panel : false });
  };

  handleOnLabelSelection = (selectedLabels: string[]): void => {
    // Filter metadata based on selected labels.
    const filteredMeta: Metadata = [];
    this.state.metadata.forEach((mitem: MetaItem) => {
      const intersectionLabels = (mitem.imageLabels as string[]).filter(
        (l: string) => selectedLabels.includes(l)
      );
      if (intersectionLabels.length !== 0) {
        filteredMeta.push(mitem);
      }
    });

    this.filteredMeta = filteredMeta;
    this.setState({
      imageNames: this.getImageNames(filteredMeta),
    });
  };

  getImageLabels = (data: Metadata): string[] => {
    const labels: Set<string> = new Set();
    data.forEach((mitem: MetaItem): void => {
      (mitem.imageLabels as string[]).forEach((l) => labels.add(l));
    });
    return Array.from(labels);
  };

  getImageNames = (data: Metadata): string[] =>
    data.map((mitem: MetaItem) => mitem.imageName as string);

  isTileInSelectedImages = (tileFileName: string): boolean => {
    const tileName = tileFileName
      .split("\\")
      .pop()
      .split("/")
      .pop()
      .split(".")
      .shift();
    return this.state.imageNames.includes(tileName);
  };

  loadMeta = (
    jsonUrl: string,
    onLoadCallback: (data: Metadata) => void
  ): void => {
    fetch(jsonUrl)
      .then((response) => response.json())
      .then((data) => {
        onLoadCallback(data);
      })
      .catch(() => {
        console.log("Error while reading metadata.");
      });
  };

  render = (): ReactNode => {
    const { classes } = this.props;
    return (
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <CssBaseline />
        <AppBar position="fixed" style={{ zIndex: 2000 }}>
          <Toolbar>
            <Typography variant="h6">CURATE</Typography>
            <ComboBox
              metadata={this.state.metadata}
              metadataKeys={this.state.metadataKeys}
              callback={this.handleOnSearchSubmit}
            />
          </Toolbar>
        </AppBar>

        <div>
          <Toolbar />
          <LabelsAccordion
            expanded={this.state.expanded === "labels-toolbox"}
            handleToolboxChange={this.handleToolboxChange("labels-toolbox")}
            imageLabels={this.state.imageLabels}
            callback={this.handleOnLabelSelection}
          />
        </div>

        <Grid container style={{ position: "relative", width: "80%" }}>
          <Toolbar />
          <Grid container spacing={3} wrap="wrap">
            {this.props.tiles.map(
              (tile, index) =>
                this.isTileInSelectedImages(tile.name) && (
                  <Grid item key={tile.id}>
                    <img
                      height={128}
                      src={`data:image/png;base64,${tile.thumbnail}`}
                      alt={tile.name}
                      onClick={() => {
                        this.setState({ selected: index });
                      }}
                    />
                  </Grid>
                )
            )}
          </Grid>
        </Grid>

        {this.state.selected !== null && (
          <MetadataDrawer metadata={this.state.metadata[this.state.selected]} />
        )}
      </div>
    );
  };
}

export default withStyles(styles)(UserInterface);
