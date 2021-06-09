/* eslint-disable  no-param-reassign */
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
  IconButton,
} from "@material-ui/core";

import { UploadImage, ImageFileInfo } from "@gliff-ai/upload";
import { Backup, Menu } from "@material-ui/icons";

import MetadataDrawer from "./MetadataDrawer";
import { Metadata, MetaItem, Filter } from "./searchAndSort/interfaces";
import SearchAndSortBar from "./searchAndSort/SearchAndSortBar";
import LabelsFilterAccordion from "./searchAndSort/LabelsFilterAccordion";
import SearchFilterAccordion from "./searchAndSort/SearchFilterAccordion";
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
  imagesContainer: {
    display: "flex",
    width: "100%",
    justifyContent: "flex-start",
  },
});

interface Props extends WithStyles<typeof styles> {
  metadata?: Metadata;
  saveImageCallback?: (
    imageFileInfo: ImageFileInfo,
    image: ImageBitmap[][]
  ) => void;
}

interface State {
  metadata: Metadata;
  metadataKeys: string[];
  activeFilters: Filter[];
  imageLabels: string[];
  expanded: string | boolean;
  selected: string; // id of selected MetaItem
  isLeftDrawerOpen: boolean;
}
class UserInterface extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      metadata: this.addFieldSelectedToMetadata(this.props.metadata),
      metadataKeys: this.props.metadata
        ? this.getMetadataKeys(this.props.metadata[0])
        : [],
      imageLabels: this.getImageLabels(this.props.metadata),
      expanded: "labels-filter-toolbox",
      selected: null,
      activeFilters: [],
      isLeftDrawerOpen: true,
    };
  }

  addFieldSelectedToMetadata = (metadata: Metadata): Metadata => {
    // Add field "selected" to metdata; this field is used to define which
    // metadata items are displayed on the dashboard.
    if (!metadata) return [];
    metadata.forEach((mitem) => {
      mitem.selected = true;
    });
    return metadata;
  };

  handleDrawerClose = () => {
    this.setState({ selected: null });
  };

  toggleLeftDrawer = () => {
    this.setState((prevState) => ({
      isLeftDrawerOpen: !prevState.isLeftDrawerOpen,
    }));
  };

  handleToolboxChange =
    (panel: string) =>
    (event: ChangeEvent, isExpanded: boolean): void => {
      this.setState({ expanded: isExpanded ? panel : false });
    };

  hasSearchFilter = (activeFilters: Filter[], filter: Filter): boolean =>
    // Check whether active filters includes filter.
    activeFilters.some(
      (filt) => filt.key === filter.key && filt.value === filter.value
    );

  resetSearchFilters = () => {
    // Select all items and empty active filters array.
    this.setState((prevState) => {
      prevState.metadata.forEach((mitem) => {
        mitem.selected = true;
      });
      return { activeFilters: [], metadata: prevState.metadata };
    });
  };

  setActiveFilter = (filter: Filter): void => {
    // Add or remove filter from the list of active filters
    this.setState(
      (prevState) => {
        if (this.hasSearchFilter(prevState.activeFilters, filter)) {
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
        this.applySearchFiltersToMetadata();
      }
    );
  };

  applySearchFiltersToMetadata = (): void => {
    this.setState(({ metadata, activeFilters }) => {
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
    });
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

  handleOnSearchSubmit = (filter: Filter): void => {
    // Filter metadata based on filter's key-value pairs

    // Open search-filters-toolbox, if closed
    if (this.state.expanded !== "search-filter-toolbox") {
      this.setState({ expanded: "search-filter-toolbox" });
    }

    // Add new filter
    if (
      filter.value === "All values" ||
      filter.key === "" ||
      filter.value === ""
    ) {
      this.resetSearchFilters();
    } else if (!this.hasSearchFilter(this.state.activeFilters, filter)) {
      // Apply new filter if not present already in the list of active filters
      this.setActiveFilter(filter);
    }
  };

  handleOnActiveFiltersChange = (filter: Filter) => {
    // If a filter is removed, update list of active filters and metadata selection.
    this.setActiveFilter(filter);
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

  getImageLabels = (metadata: Metadata): string[] => {
    if (!metadata) return [];
    const labels: Set<string> = new Set();
    metadata.forEach((mitem) => {
      (mitem.imageLabels as string[]).forEach((l) => labels.add(l));
    });
    return Array.from(labels);
  };

  getMetadataKeys = (mitem: MetaItem): string[] =>
    Object.keys(mitem).filter((k) => k !== "selected");

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
    images: ImageBitmap[][]
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
        this.setState((state) => {
          const metaKeys =
            state.metadataKeys.length === 0
              ? this.getMetadataKeys(newMetadata)
              : state.metadataKeys;
          return {
            metadata: state.metadata.concat(newMetadata),
            metadataKeys: metaKeys,
          };
        });
      },
      (error) => {
        console.log(error);
      }
    );
    // Store uploaded image in etebase
    if (this.props.saveImageCallback) {
      this.props.saveImageCallback(imageFileInfo, images);
    }
  };

  render = (): ReactNode => {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <IconButton aria-label="Menu" onClick={this.toggleLeftDrawer}>
              <Menu fontSize="large" />
            </IconButton>
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

        {this.state.isLeftDrawerOpen && (
          <LeftDrawer
            isOpen={this.state.isLeftDrawerOpen}
            handleDrawerClose={this.toggleLeftDrawer}
            drawerContent={
              <>
                <LabelsFilterAccordion
                  expanded={this.state.expanded === "labels-filter-toolbox"}
                  handleToolboxChange={this.handleToolboxChange(
                    "labels-filter-toolbox"
                  )}
                  allLabels={this.state.imageLabels}
                  callbackOnLabelSelection={this.handleOnLabelSelection}
                  callbackOnAccordionExpanded={this.resetSearchFilters}
                />
                <SearchFilterAccordion
                  expanded={this.state.expanded === "search-filter-toolbox"}
                  handleToolboxChange={this.handleToolboxChange(
                    "search-filter-toolbox"
                  )}
                  activeFilters={this.state.activeFilters}
                  callback={this.handleOnActiveFiltersChange}
                />
              </>
            }
          />
        )}

        <Grid container className={classes.imagesContainer}>
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
            isOpen={this.state.selected ? 1 : 0}
          />
        )}
      </div>
    );
  };
}

export default withStyles(styles)(UserInterface);
