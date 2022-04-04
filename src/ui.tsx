import {
  Component,
  ChangeEvent,
  ReactNode,
  KeyboardEvent,
  MouseEvent,
  Fragment,
} from "react";

import {
  AppBar,
  CssBaseline,
  Toolbar,
  Grid,
  List,
  ListItem,
  Button,
  Container,
  Card,
  Box,
  ThemeProvider,
  Theme,
  StyledEngineProvider,
} from "@mui/material";

import { WithStyles } from "@mui/styles";
import withStyles from "@mui/styles/withStyles";
import StylesProvider from "@mui/styles/StylesProvider";

import { UploadImage, ImageFileInfo } from "@gliff-ai/upload";
import {
  theme,
  BaseIconButton,
  generateClassName,
  IconButton,
  Logo,
  icons,
} from "@gliff-ai/style";

import Tile, {
  tooltips,
  thumbnailSizes,
  SizeThumbnails,
  LabelsPopover,
  AssigneesDialog,
  AutoAssignDialog,
  DefaultLabelsDialog,
} from "@/components";
import { SortPopover, GroupBySeparator } from "@/sort";
import { logTaskExecution, pageLoading } from "@/decorators";
import MetadataDrawer from "./MetadataDrawer";
import { Metadata, MetaItem, Filter } from "./interfaces";
import { SearchBar, LabelsFilterAccordion, SearchFilterCard } from "@/search";
import { sortMetadata, filterMetadata } from "@/helpers";
import { Profile } from "./components/interfaces";
import { PluginObject, PluginsAccordion } from "./components/plugins";

declare module "@mui/styles/defaultTheme" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

const styles = () => ({
  appBar: {
    backgroundColor: theme.palette.secondary.light,
    height: "90px",
    paddingTop: "9px",
  },
  sideBar: {
    width: "290px",
  },
  toolBoxCard: {
    marginBottom: "10px",
  },
  imagesContainer: {
    display: "flex",
    width: "calc(100% - 310px)",
    justifyContent: "flex-start",
    marginBottom: "auto",
    marginLeft: "20px",
  },
  assigneeDialog: {
    padding: "0px !important",
    justifyContent: "center",
    width: "280px !important",
    border: "none !important",
  },
  uploadButton: {
    bottom: "18px",
    right: "18px",
  },
  logo: {
    marginBottom: "5px",
    marginTop: "7px",
  },
  smallButton: {
    backgroundColor: theme.palette.primary.light,
    height: "48px",
    width: "48px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteImageCard: {
    backgroundColor: theme.palette.primary.light,
    height: "auto",
  },
  deleteImageList: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "-14px",
  },
  deleteImageListItem: {
    width: "auto",
    marginRight: "-10px",
    marginBottom: "-10ox",
  },
  bottomLeftButtons: {
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: theme.palette.primary.light,
  },
  bottomToolbar: { bottom: "10px", width: "274px" },
  collectionViewer: {
    height: "53px",
    backgroundColor: theme.palette.primary.light,
    paddingTop: "1px",
    marginLeft: "10px",
    width: "61px",
    paddingRight: "9px",
    bottom: "18px",
    left: "15px",
  },
  infoSelection: { fontWeight: 500, width: "1000px" },
  divButton: {
    position: "relative" as const,
    "& > button": {
      margin: "5px",
    },
  },
});

export enum UserAccess {
  Owner = "owner",
  Member = "member",
  Collaborator = "collaborator",
}

interface Props extends WithStyles<typeof styles> {
  metadata?: Metadata;
  saveImageCallback?: (
    imageFileInfo: ImageFileInfo[],
    image: ImageBitmap[][][]
  ) => Promise<void>;
  showAppBar: boolean;
  saveLabelsCallback?: (imageUid: string, newLabels: string[]) => void;
  defaultLabels?: string[];
  saveDefaultLabelsCallback?: (
    newLabels: string[],
    restrictLabels: boolean,
    multiLabel: boolean
  ) => void;
  saveAssigneesCallback?: (
    imageUid: string[],
    newAssignees: string[][]
  ) => void;
  deleteImagesCallback?: (imageUids: string[]) => void;
  annotateCallback?: (id: string) => void;
  downloadDatasetCallback?: () => void;
  // eslint-disable-next-line react/no-unused-prop-types
  setTask?: (task: { isLoading: boolean; description?: string }) => void;
  // eslint-disable-next-line react/no-unused-prop-types
  setIsLoading?: (isLoading: boolean) => void;
  updateImagesCallback?: () => void;
  plugins?: PluginObject | null;
  profiles?: Profile[] | null;
  userAccess?: UserAccess;
  launchPluginSettingsCallback?: (() => void) | null;
  saveMetadataCallback?: ((data: any) => void) | null;
  restrictLabels?: boolean; // restrict image labels to defaultLabels
  multiLabel?: boolean;
}

interface State {
  metadata: Metadata;
  metadataKeys: string[];
  activeFilters: Filter[];
  defaultLabels: string[];
  expanded: string | boolean;
  openImageUid: string; // Uid for the image whose metadata is shown in the drawer
  selectedImagesUid: string[]; // Uids for selected images
  thumbnailWidth: number;
  thumbnailHeight: number;
  selectMultipleImagesMode: boolean;
  sortedBy: string;
  isGrouped: boolean;
  showPluginsAccordion: boolean;
  restrictLabels: boolean;
  multiLabel: boolean;
}

class UserInterface extends Component<Props, State> {
  public static defaultProps: Omit<Props, "showAppBar" | "classes"> = {
    metadata: null,
    saveImageCallback: null,
    saveLabelsCallback: null,
    saveDefaultLabelsCallback: null,
    saveAssigneesCallback: null,
    deleteImagesCallback: null,
    annotateCallback: null,
    downloadDatasetCallback: null,
    defaultLabels: null,
    setTask: null,
    setIsLoading: null,
    plugins: null,
    updateImagesCallback: null,
    profiles: null,
    userAccess: UserAccess.Collaborator,
    launchPluginSettingsCallback: null,
    restrictLabels: false,
    multiLabel: true,
    saveMetadataCallback: null,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      metadata: this.addFieldSelectedToMetadata(this.props.metadata),
      metadataKeys: this.props.metadata?.length
        ? this.getMetadataKeys(this.props.metadata[0])
        : [],
      defaultLabels: this.props.defaultLabels || [],
      expanded: "labels-filter-toolbox",
      openImageUid: null,
      selectedImagesUid: [],
      activeFilters: [],
      thumbnailWidth: thumbnailSizes[2].size,
      thumbnailHeight: thumbnailSizes[2].size,
      selectMultipleImagesMode: false,
      sortedBy: null,
      isGrouped: false,
      showPluginsAccordion: false,
      restrictLabels: false,
      multiLabel: true,
    };

    /* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */
    this.addUploadedImages = this.addUploadedImages.bind(this);
  }

  @pageLoading
  componentDidMount(): void {}

  /* eslint-disable react/no-did-update-set-state */
  componentDidUpdate = (prevProps: Props): void => {
    if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
      if (this.props.metadata.length > 0) {
        this.setState({
          metadataKeys: this.getMetadataKeys(this.props.metadata[0]),
        });
      }
      this.setState((oldState) => ({
        metadata: this.addFieldSelectedToMetadata(this.props.metadata),
        defaultLabels: this.props.defaultLabels || oldState.defaultLabels,
        restrictLabels: this.props.restrictLabels,
        multiLabel: this.props.multiLabel,
      }));
    }
  };

  // Add field "selected" to metadata; this field is used to define which
  // metadata items are displayed on the dashboard.
  addFieldSelectedToMetadata = (metadata: Metadata = []): Metadata =>
    metadata.map((mitem) => ({ ...mitem, selected: true }));

  handleMetadataHide = (): void => {
    this.setState({ openImageUid: null });
  };

  handleMetadataShow = (imageUid: string): void => {
    this.setState({ openImageUid: imageUid });
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

  resetSearchFilters = (): void => {
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
      const newMetadata = filterMetadata(metadata, activeFilters);

      return newMetadata ? { metadata } : undefined;
    });

    if (this.state.isGrouped) {
      this.groupByValue(this.state.sortedBy);
    }
  };

  handleOnLabelSelection = (selectedLabels: string[] | null): void => {
    // Filter metadata based on selected labels.
    this.setState((prevState) => {
      prevState.metadata.forEach((mitem) => {
        if (selectedLabels === null) {
          // select all unlabelled images
          mitem.selected = (mitem.imageLabels as string[]).length === 0;
        } else {
          const intersection = (mitem.imageLabels as string[]).filter((l) =>
            selectedLabels.includes(l)
          );
          mitem.selected = intersection.length === selectedLabels.length;
        }
      });

      return { metadata: prevState.metadata };
    });

    if (this.state.isGrouped) {
      this.groupByValue(this.state.sortedBy);
    }
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

  resizeThumbnails = (size: number): void => {
    this.setState({
      thumbnailHeight: size,
      thumbnailWidth: size,
    });
  };

  handleOnActiveFiltersChange = (filter: Filter): void => {
    // If a filter is removed, update list of active filters and metadata selection.
    this.setActiveFilter(filter);
  };

  handleOnSortSubmit = (key: string, sortOrder: string): void => {
    // Handle sort by key

    if (key === "") return; // for some reason this function is being called on startup with an empty key

    this.setState(({ metadata }: State) => {
      const newMetadata = sortMetadata(metadata, key, sortOrder === "asc");
      return newMetadata ? { metadata: newMetadata, sortedBy: key } : undefined;
    });

    if (this.state.isGrouped) {
      this.groupByValue(key);
    }
  };

  groupByValue = (key: string): void => {
    // Assign the newGroup field to all items, based on the same key used for sort
    if (!key) return;
    const areValuesEqual = key?.toLowerCase().includes("date")
      ? (value: unknown, previousValue: unknown) =>
          this.getMonthAndYear(value as string) !==
          this.getMonthAndYear(previousValue as string)
      : (value: unknown, previousValue: unknown) => value !== previousValue;

    let prevValue: unknown = null;
    this.setState(({ metadata }) => {
      metadata.forEach((mitem) => {
        if (!mitem.selected) return;
        // Number.MAX_VALUE added to handle missing values
        const value = (mitem[key] as string) || Number.MAX_VALUE;
        if (!prevValue || areValuesEqual(value, prevValue)) {
          mitem.newGroup = true;
        } else {
          mitem.newGroup = false;
        }
        prevValue = value;
      });
      return { metadata };
    });
  };

  getMonthAndYear = (date: string): string =>
    date !== undefined
      ? new Date(date).toLocaleDateString("en-GB", {
          month: "short",
          year: "numeric",
        })
      : "";

  toggleIsGrouped = (): void => {
    this.setState(({ isGrouped }) => ({ isGrouped: !isGrouped }));
  };

  getImageLabels = (metadata: Metadata): string[] => {
    // returns the set of all labels that are assigned to at least one image
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
    ctx.globalCompositeOperation = "lighter";
    image[0].forEach((channel) => {
      ctx.drawImage(
        channel,
        0,
        0,
        imageWidth,
        imageHeight,
        (canvas.width - imageWidth * ratio) / 2,
        (canvas.height - imageHeight * ratio) / 2,
        imageWidth * ratio,
        imageHeight * ratio
      );
    });
    return canvas.toDataURL();
  };

  deleteSelectedImages = (): void => {
    if (!this.state.selectedImagesUid) return;

    this.props.deleteImagesCallback?.(this.state.selectedImagesUid);

    if (!this.props.deleteImagesCallback) {
      // running standalone, so remove images here and now rather than waiting for store to update:
      this.setState((state) => {
        const metadata: Metadata = state.metadata.filter(
          (mitem) => !state.selectedImagesUid.includes(mitem.id as string)
        );

        return {
          selectedImagesUid: [],
          metadata,
        };
      });
    }
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
        };
      });
    };

  updateDefaultLabels = (
    newLabels: string[],
    restrictLabels: boolean,
    multiLabel: boolean,
    sync = false
  ): void => {
    this.setState({ defaultLabels: newLabels, restrictLabels, multiLabel });
    if (sync && this.props.saveDefaultLabelsCallback) {
      this.props.saveDefaultLabelsCallback(
        newLabels,
        restrictLabels,
        multiLabel
      );
    }
  };

  updateAssignees = (imageUids: string[], newAssignees: string[][]): void => {
    // Update assignees for the images selected
    if (imageUids.length !== newAssignees.length) return;

    this.setState((prevState) => ({
      metadata: prevState.metadata.map((mitem) => {
        const index = imageUids.indexOf(mitem.id as string);
        if (index !== -1) {
          mitem.assignees = newAssignees[index];
        }
        return mitem;
      }),
    }));

    if (this.props.saveAssigneesCallback) {
      this.props.saveAssigneesCallback(imageUids, newAssignees);
    }
  };

  getCurrentAssignees = (): string[] => {
    // Get assignees for the images selected

    let currentAssignees: string[] = [];
    this.state.metadata.forEach(({ id, assignees }) => {
      if (this.state.selectedImagesUid.includes(id as string)) {
        currentAssignees = currentAssignees.concat(assignees as string[]);
      }
    });
    return Array.from(new Set(currentAssignees));
  };

  private isOwnerOrMember = (): boolean =>
    this.props.userAccess === UserAccess.Owner ||
    this.props.userAccess === UserAccess.Member;

  @logTaskExecution("Image(s) upload")
  async addUploadedImages(
    imageFileInfo: ImageFileInfo[],
    images: ImageBitmap[][][]
  ): Promise<void> {
    if (this.props.userAccess === UserAccess.Collaborator) return;

    const newMetadata: MetaItem[] = [];
    for (let i = 0; i < images.length; i += 1) {
      const thumbnail = this.makeThumbnail(images[i]);
      const today = new Date();
      newMetadata.push({
        imageName: imageFileInfo[i].fileName,
<<<<<<< HEAD
        id: imageFileInfo[i].content_hash,
=======
>>>>>>> dfa0445e1c55fb2ef779a35de0f5844d9be1687c
        dateCreated: today.toLocaleDateString("gb-EN"),
        size: imageFileInfo[i].size.toString(),
        dimensions: `${imageFileInfo[i].width} x ${imageFileInfo[i].height}`,
        numberOfDimensions: images.length === 1 ? "2" : "3",
        numberOfChannels: images[i][0].length.toString(),
        imageLabels: [] as Array<string>,
        thumbnail,
        selected: true,
        newGroup: false,
      });
    }

    if (this.props.saveImageCallback) {
      // Store uploaded image
      await this.props.saveImageCallback(imageFileInfo, images);
      this.setState({ sortedBy: null });
    } else {
      // add the uploaded image directly to state.metadata
      this.setState((state) => {
        const metaKeys =
          state.metadataKeys.length === 0
            ? this.getMetadataKeys(newMetadata[0])
            : state.metadataKeys;
        return {
          metadata: state.metadata.concat(newMetadata),
          metadataKeys: metaKeys,
          sortedBy: null,
        };
      });
    }
  }

  render = (): ReactNode => {
    const { classes, showAppBar } = this.props;

    const appBar = !showAppBar ? null : (
      <AppBar position="fixed" className={classes.appBar} elevation={0}>
        <Toolbar>
          <Grid container direction="row">
            <Grid item className={classes.logo}>
              <Logo />
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    );

    const toolBoxCard = (
      <>
        <Box
          display="flex"
          justifyContent="space-between"
          className={classes.toolBoxCard}
        >
          <Card>
            <SizeThumbnails resizeThumbnails={this.resizeThumbnails} />
          </Card>
          <Card className={classes.smallButton}>
            <SortPopover
              metadataKeys={this.state.metadataKeys}
              callbackSort={this.handleOnSortSubmit}
              isGrouped={this.state.isGrouped}
              toggleIsGrouped={this.toggleIsGrouped}
            />
          </Card>

          <Card className={classes.smallButton}>
            <IconButton
              tooltip={tooltips.selectMultipleImages}
              fill={this.state.selectMultipleImagesMode}
              icon={tooltips.selectMultipleImages.icon}
              tooltipPlacement="bottom"
              onClick={() => {
                this.setState((prevState) => ({
                  selectMultipleImagesMode: !prevState.selectMultipleImagesMode,
                  openImageUid: null,
                }));
              }}
              id="select-multiple-images"
              size="small"
            />
          </Card>
        </Box>
        <Box
          display="flex"
          justifyContent="flex-start"
          className={classes.toolBoxCard}
        >
          {this.isOwnerOrMember() && this.props.profiles && (
            <Card
              className={classes.smallButton}
              style={{ marginRight: "14px" }}
            >
              <AutoAssignDialog
                profiles={this.props.profiles}
                metadata={this.state.metadata}
                selectedImagesUids={this.state.selectedImagesUid}
                updateAssignees={this.updateAssignees}
              />
            </Card>
          )}
          {this.props.userAccess !== UserAccess.Collaborator && (
            <Card className={classes.smallButton}>
              <DefaultLabelsDialog
                labels={this.state.defaultLabels}
                restrictLabels={this.state.restrictLabels}
                multiLabel={this.state.multiLabel}
                updateDefaultLabels={this.updateDefaultLabels}
              />
            </Card>
          )}
        </Box>
      </>
    );

    const deleteImageCard = !this.state.selectMultipleImagesMode ? null : (
      <Card className={classes.deleteImageCard}>
        <List component="div" style={{ display: "flex" }}>
          <ListItem
            className={classes.infoSelection}
            style={{ fontWeight: 500, justifyContent: "left" }}
          >{`${this.state.selectedImagesUid.length} images selected`}</ListItem>
          {this.isOwnerOrMember() && this.props.profiles && (
            <ListItem className={classes.assigneeDialog}>
              <AssigneesDialog
                profiles={this.props.profiles}
                selectedImagesUids={this.state.selectedImagesUid}
                updateAssignees={this.updateAssignees}
                getCurrentAssignees={this.getCurrentAssignees}
              />
            </ListItem>
          )}
          <ListItem style={{ padding: 0 }}>
            <BaseIconButton
              tooltip={tooltips.deleteImages}
              fill={null}
              onClick={this.deleteSelectedImages}
              tooltipPlacement="bottom"
            />
          </ListItem>
        </List>
      </Card>
    );

    return (
      <StylesProvider generateClassName={generateClassName("curate")}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <CssBaseline />

            <Container maxWidth={false}>
              {appBar}
              <Grid
                container
                spacing={2}
                style={{ marginTop: this.props.showAppBar ? "108px" : 0 }}
              >
                <Grid item className={classes.sideBar}>
                  {toolBoxCard}

                  {deleteImageCard}

                  {(this.state.openImageUid == null ||
                    this.state.selectMultipleImagesMode) && (
                    <>
                      <SearchBar
                        metadata={this.state.metadata}
                        metadataKeys={this.state.metadataKeys}
                        callbackSearch={this.handleOnSearchSubmit}
                      />
                      <SearchFilterCard
                        activeFilters={this.state.activeFilters}
                        callback={this.handleOnActiveFiltersChange}
                      />
                      <LabelsFilterAccordion
                        expanded={
                          this.state.expanded === "labels-filter-toolbox"
                        }
                        handleToolboxChange={this.handleToolboxChange(
                          "labels-filter-toolbox"
                        )}
                        allLabels={this.getImageLabels(this.state.metadata)}
                        callbackOnLabelSelection={this.handleOnLabelSelection}
                        callbackOnAccordionExpanded={this.resetSearchFilters}
                      />
                      {this.state.showPluginsAccordion && (
                        <PluginsAccordion
                          plugins={this.props.plugins}
                          expanded={this.state.expanded === "plugins-toolbox"}
                          handleToolboxChange={this.handleToolboxChange(
                            "plugins-toolbox"
                          )}
                          metadata={this.state.metadata}
                          selectedImagesUid={this.state.selectedImagesUid}
                          updateImagesCallback={this.props.updateImagesCallback}
                          launchPluginSettingsCallback={
                            this.props.launchPluginSettingsCallback
                          }
                          saveMetadataCallback={this.props.saveMetadataCallback}
                        />
                      )}
                    </>
                  )}

                  <div>
                    {this.state.openImageUid !== null &&
                      !this.state.selectMultipleImagesMode && (
                        <MetadataDrawer
                          metadata={
                            this.state.metadata.filter(
                              (mitem) => mitem.id === this.state.openImageUid
                            )[0]
                          }
                          handleMetadataHide={this.handleMetadataHide}
                        />
                      )}
                  </div>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    position="fixed"
                    className={classes.bottomToolbar}
                  >
                    <Card className={classes.bottomLeftButtons}>
                      <IconButton
                        tooltip={tooltips.viewCollection}
                        icon={tooltips.viewCollection.icon}
                        fill={null}
                        tooltipPlacement="top"
                      />
                    </Card>

                    <Card className={classes.bottomLeftButtons}>
                      {this.isOwnerOrMember() && (
                        <UploadImage
                          setUploadedImage={this.addUploadedImages}
                          multiple
                          spanElement={
                            <IconButton
                              id="upload-image"
                              tooltip={tooltips.uploadImage}
                              icon={tooltips.uploadImage.icon}
                              fill={null}
                              tooltipPlacement="top"
                              component="span"
                            />
                          }
                        />
                      )}
                      <IconButton
                        tooltip={tooltips.downloadDataset}
                        icon={tooltips.downloadDataset.icon}
                        fill={null}
                        tooltipPlacement="top"
                        onClick={this.props.downloadDatasetCallback}
                      />
                    </Card>

                    <Card className={classes.bottomLeftButtons}>
                      <IconButton
                        icon={icons.plugins}
                        tooltip={{ name: "Plugins" }}
                        fill={this.state.showPluginsAccordion}
                        disabled={this.props.plugins === null}
                        tooltipPlacement="top"
                        onClick={() =>
                          this.setState((prevState) => ({
                            expanded: "plugins-toolbox",
                            selectMultipleImagesMode: true, // to keep metadata drawer closed
                            showPluginsAccordion:
                              !prevState.showPluginsAccordion,
                          }))
                        }
                      />
                    </Card>
                  </Box>
                </Grid>

                <Grid
                  className={classes.imagesContainer}
                  style={{ flexWrap: "wrap" }}
                >
                  {this.state.metadata
                    .filter((mitem) => mitem.selected)
                    .map((mitem: MetaItem, itemIndex) => (
                      <Fragment key={mitem.id as string}>
                        {this.state.isGrouped && (
                          <GroupBySeparator
                            mitem={mitem}
                            sortedBy={this.state.sortedBy}
                            getMonthAndYear={this.getMonthAndYear}
                          />
                        )}
                        <Grid
                          item
                          style={{
                            backgroundColor:
                              this.state.selectedImagesUid.includes(
                                mitem.id as string
                              ) && theme.palette.primary.main,
                          }}
                        >
                          <div className={classes.divButton}>
                            <Button
                              id="images"
                              onClick={(e: MouseEvent) => {
                                const imageUid = mitem.id as string;
                                this.handleMetadataShow(imageUid);

                                if (e.metaKey || e.ctrlKey) {
                                  // Add clicked image to the selection if unselected; remove it if already selected
                                  this.setState((state) => {
                                    if (
                                      state.selectedImagesUid.includes(imageUid)
                                    ) {
                                      state.selectedImagesUid.splice(
                                        state.selectedImagesUid.indexOf(
                                          imageUid
                                        ),
                                        1
                                      );
                                    } else {
                                      state.selectedImagesUid.push(imageUid);
                                    }
                                    return {
                                      selectedImagesUid:
                                        state.selectedImagesUid,
                                    };
                                  });
                                } else if (
                                  e.shiftKey &&
                                  this.state.selectedImagesUid.length > 0
                                ) {
                                  // Selected all images between a pair of clicked images.
                                  this.setState((state) => {
                                    const currIdx =
                                      this.getIndexFromUid(imageUid);
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

                                    for (
                                      let i = startIdx;
                                      i <= endIdx;
                                      i += 1
                                    ) {
                                      if (
                                        !selectedImagesUid.includes(
                                          state.metadata[i].id as string
                                        )
                                      ) {
                                        selectedImagesUid.push(
                                          state.metadata[i].id as string
                                        );
                                      }
                                    }
                                    return { selectedImagesUid };
                                  });
                                } else {
                                  // Select single item
                                  this.setState({
                                    selectedImagesUid: [imageUid],
                                  });
                                }
                              }}
                              onDoubleClick={() => {
                                this.props.annotateCallback?.(
                                  mitem.id as string
                                );
                              }}
                              onKeyDown={(e: KeyboardEvent) => {
                                if (
                                  e.shiftKey &&
                                  (e.key === "ArrowLeft" ||
                                    e.key === "ArrowRight")
                                ) {
                                  // Select consecutive images to the left or to the right of the clicked image.
                                  const index =
                                    this.getItemUidNextToLastSelected(
                                      e.key === "ArrowRight"
                                    );
                                  if (index !== null) {
                                    this.setState((state) => {
                                      const uid = state.metadata[index]
                                        .id as string;
                                      if (
                                        state.selectedImagesUid.includes(uid)
                                      ) {
                                        state.selectedImagesUid.pop();
                                      } else {
                                        state.selectedImagesUid.push(uid);
                                      }
                                      return {
                                        selectedImagesUid:
                                          state.selectedImagesUid,
                                      };
                                    });
                                  }
                                } else if (e.key === "Escape") {
                                  // Deselect all
                                  this.setState({ selectedImagesUid: [] });
                                }
                              }}
                            >
                              <Tile
                                mitem={mitem}
                                width={this.state.thumbnailWidth}
                                height={this.state.thumbnailHeight}
                              />
                            </Button>
                            <LabelsPopover
                              id={mitem.id as string}
                              imageName={mitem.imageName as string}
                              labels={mitem.imageLabels as string[]}
                              updateLabels={this.updateLabels(itemIndex)}
                              restrictLabels={this.state.restrictLabels}
                              defaultLabels={this.state.defaultLabels}
                              multiLabel={this.state.multiLabel}
                            />
                          </div>
                        </Grid>
                      </Fragment>
                    ))}
                </Grid>
              </Grid>
            </Container>
          </ThemeProvider>
        </StyledEngineProvider>
      </StylesProvider>
    );
  };
}

export { UserInterface as UI };
export default withStyles(styles)(UserInterface);
