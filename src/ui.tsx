import React, { Component, ChangeEvent, ReactNode } from "react";
import {
  AppBar,
  CssBaseline,
  Toolbar,
  Grid,
  Typography,
  Theme,
  withStyles,
  WithStyles,
  Button,
} from "@material-ui/core";
import { Metadata, MetaItem } from "./search/interfaces";
import ComboBox from "./search/ComboBox";
import LabelsAccordion from "./search/LabelsAccordion";
import MetadataDrawer from "./MetadataDrawer";

const styles = (theme: Theme) => ({
  root: {
    display: "flex", // flex-box, see https://css-tricks.com/snippets/css/a-guide-to-flexbox/
    alignItems: "flex-start", // prevents image tiles rendering halfway vertically between the app bar and bottom of the labels accordion (see https://css-tricks.com/snippets/css/a-guide-to-flexbox/#align-items)
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1, // make sure the appbar renders over the metadata drawer, not the other way round
  },
});

export interface Tile {
  id: string;
  name: string;
  label: string;
  thumbnail: string; // base64
}
interface Props extends WithStyles<typeof styles> {
  tiles: Array<Tile>;
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

  handleDrawerClose = () => {
    this.setState({ selected: null });
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
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
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
          {/* empty Toolbar element pushes the next element down by the same width as the appbar, preventing it rendering behind the appbar when position="fixed" (see https://material-ui.com/components/app-bar/#fixed-placement) */}
          <LabelsAccordion
            expanded={this.state.expanded === "labels-toolbox"}
            handleToolboxChange={this.handleToolboxChange("labels-toolbox")}
            imageLabels={this.state.imageLabels}
            callback={this.handleOnLabelSelection}
          />
        </div>

        <Grid
          container
          style={{ position: "relative", width: "80%", margin: "16px" }}
        >
          <Toolbar />
          {/* empty Toolbar element pushes the next element down by the same width as the appbar, preventing it rendering behind the appbar when position="fixed" (see https://material-ui.com/components/app-bar/#fixed-placement) */}
          <Grid container spacing={3} wrap="wrap">
            {this.props.tiles.map(
              (tile, index) =>
                this.isTileInSelectedImages(tile.name) && (
                  <Grid
                    item
                    key={tile.id}
                    style={{
                      backgroundColor:
                        this.state.selected === index && "lightblue",
                    }}
                  >
                    <Button
                      onClick={() => {
                        this.setState({ selected: index });
                      }}
                      onKeyPress={(
                        event: React.KeyboardEvent<HTMLButtonElement>
                      ) => {
                        if (event.code === "Enter") {
                          this.setState({ selected: index });
                        }
                      }}
                    >
                      <img
                        height={128}
                        src={`data:image/png;base64,${tile.thumbnail}`}
                        alt={tile.name}
                      />
                    </Button>
                    <Typography style={{ textAlign: "center" }}>
                      {tile.name.split("/").pop()}
                    </Typography>
                  </Grid>
                )
            )}
          </Grid>
        </Grid>

        {this.state.selected !== null && (
          <MetadataDrawer
            metadata={this.state.metadata[this.state.selected]}
            handleDrawerClose={this.handleDrawerClose}
          />
        )}
      </div>
    );
  };
}

export default withStyles(styles)(UserInterface);
