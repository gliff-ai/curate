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
import { Metadata, MetaItem, Filter } from "./searchAndSort/interfaces";
import SearchAndSortBar from "./searchAndSort/SearchAndSortBar";
import LabelsAccordion from "./searchAndSort/LabelsAccordion";
import ActiveFiltersAccordion from "./searchAndSort/ActiveFiltersAccordion";
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
  activeFilters: Filter[];
  imageLabels: string[];
  expanded: string | boolean;
  selected: string; // id of selected MetaItem
}

class UserInterface extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      metadata: this.addSelectedFieldToMetadata(this.props.metadata),
      metadataKeys: Object.keys(this.props.metadata[0]),
      imageLabels: this.getImageLabels(this.props.metadata),
      expanded: "labels-toolbox",
      selected: null,
      activeFilters: [],
    };
  }

  addSelectedFieldToMetadata = (metadata: Metadata): Metadata => {
    metadata.forEach((mitem) => {
      mitem.selected = true;
    });
    return metadata;
  };

  handleDrawerClose = () => {
    this.setState({ selected: null });
  };

  handleToolboxChange =
    (panel: string) =>
    (event: ChangeEvent, isExpanded: boolean): void => {
      this.setState({ expanded: isExpanded ? panel : false });
    };

  handleOnSearchSubmit = (filter: Filter): void => {
    // Filter metadata based on inputKey and inputValue

    if (
      filter.value === "All values" ||
      filter.key === "" ||
      filter.value === ""
    ) {
      // All items selected and no filter
      this.setState((prevState) => {
        prevState.metadata.forEach((mitem) => {
          mitem.selected = true;
        });
        return { activeFilters: [], metadata: prevState.metadata };
      });
    } else if (!this.hasFilter(this.state.activeFilters, filter)) {
      this.setActiveFilter(filter);
    }
  };

  handleOnLabelSelection = (selectedLabels: string[]): void => {
    // Filter metadata based on selected labels.

    this.setState((prevState) => {
      prevState.metadata.forEach((mitem) => {
        const intersection = (mitem.imageLabels as string[]).filter((l) =>
          selectedLabels.includes(l)
        );
        mitem.selected = Boolean(intersection.length);
      });
      return { metadata: prevState.metadata };
    });
  };

  handleOnActiveFiltersChange = (filter: Filter) => {
    this.setActiveFilter(filter);
  };

  setActiveFilter = (filter: Filter): void => {
    this.setState(
      (prevState) => {
        if (this.hasFilter(prevState.activeFilters, filter)) {
          prevState.activeFilters.splice(
            prevState.activeFilters.indexOf(filter),
            1
          );
        } else {
          prevState.activeFilters.push(filter);
        }
        return { activeFilters: prevState.activeFilters };
      },
      () => {
        this.applyFiltersOnMetadata();
      }
    );
  };

  hasFilter = (activeFilters: Filter[], filter: Filter): boolean =>
    // Check in filter in active filters
    activeFilters.some(
      (filt) => filt.key === filter.key && filt.value === filter.value
    );

  applyFiltersOnMetadata = (): void => {
    this.setState(
      ({ metadata, activeFilters }) => {
        if (activeFilters.length > 0) {
          metadata.forEach((mitem) => {
            activeFilters.forEach((filter, fi) => {
              const value = mitem[filter.key];
              // Selection for current filter
              const currentSel =
                (Array.isArray(value) && value.includes(filter.value)) ||
                value === filter.value
                  ? 1
                  : 0;

              // Selection for all filter up to current
              const prevSel = fi === 0 ? 1 : Number(mitem.selected);

              // Update value for selected
              mitem.selected = Boolean(prevSel * currentSel);
            });
          });
        } else {
          metadata.forEach((mitem) => {
            mitem.selected = true;
          });
        }
        return { metadata };
      },
      () => {
        console.log(this.state.metadata.filter((i) => i.selected));
      }
    );
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
      if (key?.toLowerCase().includes("date")) {
        // Sort by date
        prevState.metadata.sort((a: MetaItem, b: MetaItem): number =>
          compare(
            new Date(a[key] as string),
            new Date(b[key] as string),
            sortOrder
          )
        );
      } else {
        // Sort by any string
        prevState.metadata.sort((a: MetaItem, b: MetaItem): number =>
          compare(
            (a[key] as string).toLowerCase(),
            (b[key] as string).toLowerCase(),
            sortOrder
          )
        );
      }
      return { metadata: prevState.metadata };
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
          size: imageFileInfo.size.toString(),
          dimensions: `${imageFileInfo.width} x ${imageFileInfo.height}`,
          numberOfDimensions: images.length === 1 ? "2" : "3",
          numberOfChannels: images[0].length.toString(),
          imageLabels: [] as Array<string>,
          thumbnail,
          selected: true,
        };
        this.setState((state) => ({
          metadata: state.metadata.concat(newMetadata),
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
                <>
                  <LabelsAccordion
                    expanded={this.state.expanded === "labels-toolbox"}
                    handleToolboxChange={this.handleToolboxChange(
                      "labels-toolbox"
                    )}
                    imageLabels={this.state.imageLabels}
                    callback={this.handleOnLabelSelection}
                  />
                  <ActiveFiltersAccordion
                    expanded={this.state.expanded === "active-filter-toolbox"}
                    handleToolboxChange={this.handleToolboxChange(
                      "active-filter-toolbox"
                    )}
                    activeFilters={this.state.activeFilters}
                    callback={this.handleOnActiveFiltersChange}
                  />
                </>
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
            <SearchAndSortBar
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
            {this.state.metadata
              .filter((mitem) => mitem.selected)
              .map((mitem: MetaItem) => (
                <Grid
                  item
                  key={mitem.id as string}
                  style={{
                    backgroundColor:
                      this.state.selected === mitem.id && "lightblue",
                  }}
                >
                  <Button
                    onClick={() => {
                      this.setState({ selected: mitem.id as string });
                    }}
                    onKeyPress={(
                      event: React.KeyboardEvent<HTMLButtonElement>
                    ) => {
                      if (event.code === "Enter") {
                        this.setState({ selected: mitem.id as string });
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
            metadata={
              this.state.metadata.filter(
                (mitem) => mitem.id === this.state.selected
              )[0]
            }
            handleDrawerClose={this.handleDrawerClose}
          />
        )}
      </div>
    );
  };
}

export default withStyles(styles)(UserInterface);
