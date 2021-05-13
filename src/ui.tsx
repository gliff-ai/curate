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

import { UploadImage, ImageFileInfo } from "@gliff-ai/upload";
import { Backup } from "@material-ui/icons";

import MetadataDrawer from "./MetadataDrawer";
import { Metadata, MetaItem } from "./searchAndSort/interfaces";
import ComboBox from "./searchAndSort/SearchAndSortBar";
import LabelsAccordion from "./searchAndSort/LabelsAccordion";
import LeftDrawer from "./components/LeftDrawer";
import Tile from "./components/Tile";

const styles = (theme: Theme) => ({
  root: {
    display: "flex", // flex-box, see https://css-tricks.com/snippets/css/a-guide-to-flexbox/
    alignItems: "flex-start", // prevents image tiles rendering halfway vertically between the app bar and bottom of the labels accordion (see https://css-tricks.com/snippets/css/a-guide-to-flexbox/#align-items)
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1, // make sure the appbar renders over the metadata drawer, not the other way round
  },
});

interface Props extends WithStyles<typeof styles> {
  metadata: Metadata;
}

interface State {
  metadata: Metadata;
  metadataKeys: string[];
  filteredMeta: Metadata;
  imageLabels: string[];
  expanded: string | boolean;
  selected: number;
}

class UserInterface extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      metadata: this.props.metadata,
      filteredMeta: this.props.metadata,
      metadataKeys: Object.keys(this.props.metadata[0]),
      imageLabels: this.getImageLabels(this.props.metadata),
      expanded: "labels-toolbox",
      selected: null,
    };
  }

  handleOnSearchSubmit = (inputKey: string, inputValue: string): void => {
    // Filter metadata based on inputKey and inputValue

    if (inputValue === "All values" || inputKey === "" || inputValue === "") {
      this.setState((prevState) => ({ filteredMeta: prevState.metadata }));
    } else {
      const filteredMeta: Metadata = [];
      this.state.metadata.forEach((mitem: MetaItem) => {
        const value = mitem[inputKey];
        if (
          (Array.isArray(value) && value.includes(inputValue)) ||
          value === inputValue
        ) {
          filteredMeta.push(mitem);
        }
      });
      this.setState({ filteredMeta });
    }
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

    this.setState({ filteredMeta });
  };

  handleOnSortSubmit = (key: string, sortOrder: string): void => {
    // Handle sort by any string or by date.

    if (key === "") return; // for some reason this function is being called on startup with an empty key

    function compare(a: string | Date, b: string | Date, sort: string): number {
      if (a < b) {
        return sort === "asc" ? -1 : 1;
      }
      if (a > b) {
        return sort === "asc" ? 1 : -1;
      }
      return 0;
    }

    this.setState((prevState) => {
      if (key.toLowerCase().includes("date")) {
        // Sort by date
        prevState.filteredMeta.sort((a: MetaItem, b: MetaItem): number =>
          compare(
            new Date(a[key] as string),
            new Date(b[key] as string),
            sortOrder
          )
        );
      } else {
        // Sort by any string
        prevState.filteredMeta.sort((a: MetaItem, b: MetaItem): number =>
          compare(
            (a[key] as string).toLowerCase(),
            (b[key] as string).toLowerCase(),
            sortOrder
          )
        );
      }
      return { filteredMeta: prevState.filteredMeta };
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

  makeThumbnail = (image: Array<Array<ImageBitmap>>): Promise<ImageBitmap> => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image[0][0], 0, 0, 128, 128);
    return createImageBitmap(canvas);
  };

  addUploadedImage = (
    imageFileInfo: ImageFileInfo,
    images: Array<Array<ImageBitmap>>
  ) => {
    this.makeThumbnail(images).then(
      (thumbnail) => {
        const today = new Date();
        const newMetadata = {
          imageName: imageFileInfo.fileName,
          id: imageFileInfo.fileID,
          dateCreated: today.toLocaleDateString("gb-EN"),
          dimensions: `${imageFileInfo.width} x ${imageFileInfo.height}`,
          numberOfDimensions: images.length === 1 ? "2" : "3",
          numberOfChannels: images[0].length.toString(),
          imageLabels: [] as Array<string>,
          thumbnail,
        };
        this.setState((state) => ({
          metadata: state.metadata.concat(newMetadata),
          filteredMeta: state.metadata.concat(newMetadata),
        }));
      },
      (error) => {
        console.log(error);
      }
    );
  };

  render = (): ReactNode => {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <LeftDrawer
              drawerContent={
                <LabelsAccordion
                  expanded={this.state.expanded === "labels-toolbox"}
                  handleToolboxChange={this.handleToolboxChange(
                    "labels-toolbox"
                  )}
                  imageLabels={this.state.imageLabels}
                  callback={this.handleOnLabelSelection}
                />
              }
            />
            <Typography variant="h6">CURATE</Typography>
            <UploadImage
              spanElement={
                <Button aria-label="upload-picture" component="span">
                  <Backup />
                </Button>
              }
              multiple
              setUploadedImage={this.addUploadedImage}
            />
            <ComboBox
              metadata={this.state.metadata}
              metadataKeys={this.state.metadataKeys}
              callbackSearch={this.handleOnSearchSubmit}
              callbackSort={this.handleOnSortSubmit}
            />
          </Toolbar>
        </AppBar>

        <Grid
          container
          style={{ position: "relative", width: "80%", margin: "16px" }}
        >
          <Toolbar />
          {/* empty Toolbar element pushes the next element down by the same width as the appbar, preventing it rendering behind the appbar when position="fixed" (see https://material-ui.com/components/app-bar/#fixed-placement) */}
          <Grid container spacing={3} wrap="wrap">
            {this.state.filteredMeta.map((mitem: MetaItem, index) => (
              <Grid
                item
                key={mitem.id as string}
                style={{
                  backgroundColor: this.state.selected === index && "lightblue",
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
                  <Tile mitem={mitem} />
                </Button>
                <Typography style={{ textAlign: "center" }}>
                  {(mitem.imageName as string).split("/").pop()}
                </Typography>
              </Grid>
            ))}
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
