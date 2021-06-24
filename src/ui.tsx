/* eslint-disable  no-param-reassign */
import React, {
  Component,
  ChangeEvent,
  ReactNode,
  KeyboardEvent,
  MouseEvent,
} from "react";
import {
  AppBar,
  CssBaseline,
  Toolbar,
  Grid,
  Typography,
  Theme,
  withStyles,
  WithStyles,
  List,
  ListItem,
  Button,
  IconButton,
} from "@material-ui/core";

import { UploadImage, ImageFileInfo } from "@gliff-ai/upload";
import { Backup, Menu, Delete } from "@material-ui/icons";
import { LabelsPopover } from "@/components/LabelsPopover";
import MetadataDrawer from "./MetadataDrawer";
import { Metadata, MetaItem, Filter } from "./searchAndSort/interfaces";
import SearchAndSortBar from "./searchAndSort/SearchAndSortBar";
import LabelsFilterAccordion from "./searchAndSort/LabelsFilterAccordion";
import SearchFilterAccordion from "./searchAndSort/SearchFilterAccordion";
import LeftDrawer from "./components/LeftDrawer";
import Tile from "./components/Tile";
import { SortPopover } from "@/sort/SortPopover";

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
  saveLabelsCallback?: (imageUid: string, newLabels: string[]) => void;
  deleteImagesCallback?: (imageUids: string[]) => void;
  annotateCallback?: (id: string) => void;
}

interface State {
  metadata: Metadata;
  metadataKeys: string[];
  activeFilters: Filter[];
  imageLabels: string[];
  expanded: string | boolean;
  openImageUid: string; // Uid for the image whose metadata is shown in the drawer
  selectedImagesUid: string[]; // Uids for selected images
  isLeftDrawerOpen: boolean;
}

class UserInterface extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      metadata: this.addFieldSelectedToMetadata(this.props.metadata),
      metadataKeys: this.props.metadata?.length
        ? this.getMetadataKeys(this.props.metadata[0])
        : [],
      imageLabels: this.getImageLabels(this.props.metadata),
      expanded: "labels-filter-toolbox",
      openImageUid: null,
      selectedImagesUid: [],
      activeFilters: [],
      isLeftDrawerOpen: true,
    };
  }

  /* eslint-disable react/no-did-update-set-state */
  // TODO: remove state.metadata, just use props.metadata
  componentDidUpdate = (prevProps: Props) => {
    if (
      JSON.stringify(this.props.metadata) !== JSON.stringify(prevProps.metadata)
    ) {
      this.setState({
        metadata: this.addFieldSelectedToMetadata(this.props.metadata),
      });
    }
  };
  /* eslint-enable react/no-did-update-set-state */

  addFieldSelectedToMetadata = (metadata: Metadata): Metadata => {
    // Add field "selected" to metdata; this field is used to define which
    // metadata items are displayed on the dashboard.
    if (!metadata) return [];
    metadata.forEach((mitem) => {
      mitem.selected = true;
    });
    return metadata;
  };

  handleMetaDrawerClose = (): void => {
    this.setState({ openImageUid: null });
  };

  handleMetaDrawerOpen = (imageUid: string) => (): void => {
    this.setState({ openImageUid: imageUid });
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

  makeThumbnail = (image: Array<Array<ImageBitmap>>): string => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const imageWidth = image[0][0].width;
    const imageHeight = image[0][0].height;
    const ratio = Math.min(
      canvas.width / imageWidth,
      canvas.height / imageHeight
    );
    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      image[0][0],
      0,
      0,
      imageWidth,
      imageHeight,
      (canvas.width - imageWidth * ratio) / 2,
      (canvas.height - imageHeight * ratio) / 2,
      imageWidth * ratio,
      imageHeight * ratio
    );
    return canvas.toDataURL();
  };

  addUploadedImage = (
    imageFileInfo: ImageFileInfo,
    images: ImageBitmap[][]
  ) => {
    const thumbnail = this.makeThumbnail(images);
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

    if (this.props.saveImageCallback) {
      // Store uploaded image in etebase
      this.props.saveImageCallback(imageFileInfo, images);
    } else {
      // add the uploaded image directly to state.metadata
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
    }
  };

  deleteSelectedImages = (): void => {
    if (!this.state.selectedImagesUid) return;
    this.setState((state) => {
      const metadata: Metadata = state.metadata.filter(
        (mitem) => !state.selectedImagesUid.includes(mitem.id as string)
      );
      if (this.props.deleteImagesCallback) {
        this.props.deleteImagesCallback(state.selectedImagesUid);
      }
      return {
        selectedImagesUid: [],
        metadata,
        imageLabels: this.getImageLabels(metadata),
      };
    });
  };

  getItemUidNextToLastSelected = (forward = true): number | null => {
    const inc = forward ? 1 : -1;
    let index: number;
    for (let i = 0; i < this.state.metadata.length; i += 1) {
      index = i + inc;
      if (
        this.state.metadata[i].id ===
          this.state.selectedImagesUid.slice(-1).pop() &&
        index < this.state.metadata.length &&
        index >= 0
      ) {
        return index;
      }
    }
    return null;
  };

  getIndexFromUid = (uid: string): number | null => {
    for (let i = 0; i < this.state.metadata.length; i += 1) {
      if (this.state.metadata[i].id === uid) return i;
    }
    return null;
  };

  updateLabels =
    (itemIndex: number) =>
    (newLabels: string[]): void => {
      this.setState((state) => {
        state.metadata[itemIndex].imageLabels = newLabels;
        if (this.props.saveLabelsCallback) {
          this.props.saveLabelsCallback(
            state.metadata[itemIndex].id as string,
            newLabels
          );
        }
        return {
          metadata: state.metadata,
          imageLabels: this.getImageLabels(state.metadata),
        };
      });
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
            <SortPopover
              metadataKeys={this.state.metadataKeys}
              callbackSort={this.handleOnSortSubmit}
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
                <List
                  component="span"
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                  }}
                >
                  <ListItem
                    style={{ width: "auto" }}
                  >{`${this.state.selectedImagesUid.length} images selected`}</ListItem>
                  <ListItem style={{ width: "auto" }}>
                    <IconButton
                      aria-label="Delete"
                      onClick={this.deleteSelectedImages}
                    >
                      <Delete />
                    </IconButton>
                  </ListItem>
                </List>
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
              .map((mitem: MetaItem, itemIndex) => (
                <Grid
                  item
                  key={mitem.id as string}
                  style={{
                    backgroundColor:
                      this.state.selectedImagesUid.includes(
                        mitem.id as string
                      ) && "lightblue",
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <Button
                      onClick={(e: MouseEvent) => {
                        const imageUid = mitem.id as string;

                        if (e.metaKey || e.ctrlKey) {
                          // Add clicked image to the selection if unselected; remove it if already selected
                          this.setState((state) => {
                            if (state.selectedImagesUid.includes(imageUid)) {
                              state.selectedImagesUid.splice(
                                state.selectedImagesUid.indexOf(imageUid),
                                1
                              );
                            } else {
                              state.selectedImagesUid.push(imageUid);
                            }
                            return {
                              selectedImagesUid: state.selectedImagesUid,
                            };
                          });
                        } else if (
                          e.shiftKey &&
                          this.state.selectedImagesUid.length > 0
                        ) {
                          // Selected all images between a pair of clicked images.
                          this.setState((state) => {
                            const currIdx = this.getIndexFromUid(imageUid);
                            const prevIdx = this.getIndexFromUid(
                              state.selectedImagesUid[0]
                            );
                            // first element added to the selection remains one end of the range
                            const selectedImagesUid = [
                              state.selectedImagesUid[0],
                            ];

                            const startIdx =
                              prevIdx < currIdx ? prevIdx : currIdx;
                            const endIdx =
                              prevIdx < currIdx ? currIdx : prevIdx;

                            for (let i = startIdx; i <= endIdx; i += 1) {
                              selectedImagesUid.push(
                                state.metadata[i].id as string
                              );
                            }
                            return { selectedImagesUid };
                          });
                        } else {
                          // Select single item
                          this.setState({ selectedImagesUid: [imageUid] });
                        }
                      }}
                      onDoubleClick={() => {
                        this.props.annotateCallback(mitem.id as string);
                      }}
                      onKeyDown={(e: KeyboardEvent) => {
                        if (
                          e.shiftKey &&
                          (e.key === "ArrowLeft" || e.key === "ArrowRight")
                        ) {
                          // Select consecutive images to the left or to the right of the clicked image.
                          const index = this.getItemUidNextToLastSelected(
                            e.key === "ArrowRight"
                          );
                          if (index !== null) {
                            this.setState((state) => {
                              const uid = state.metadata[index].id as string;
                              if (state.selectedImagesUid.includes(uid)) {
                                state.selectedImagesUid.pop();
                              } else {
                                state.selectedImagesUid.push(uid);
                              }
                              return {
                                selectedImagesUid: state.selectedImagesUid,
                              };
                            });
                          }
                        } else if (e.key === "Escape") {
                          // Deselect all
                          this.setState({ selectedImagesUid: [] });
                        }
                      }}
                    >
                      <Tile mitem={mitem} />
                    </Button>
                    <LabelsPopover
                      id={mitem.id as string}
                      labels={mitem.imageLabels as string[]}
                      updateLabels={this.updateLabels(itemIndex)}
                      imageName={mitem.imageName as string}
                    />
                  </div>
                  <Typography
                    style={{
                      textAlign: "center",
                      fontSize: 14,
                    }}
                  >
                    {(mitem.imageName as string).split("/").pop()}
                  </Typography>
                </Grid>
              ))}
          </Grid>
        </Grid>

        {this.state.openImageUid !== null && (
          <MetadataDrawer
            metadata={
              this.state.metadata.filter(
                (mitem) => mitem.id === this.state.openImageUid
              )[0]
            }
            handleDrawerClose={this.handleMetaDrawerClose}
            isOpen={this.state.openImageUid ? 1 : 0}
          />
        )}
      </div>
    );
  };
}

export default withStyles(styles)(UserInterface);
