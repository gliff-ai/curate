import {
  Component,
  ChangeEvent,
  ReactNode,
  KeyboardEvent,
  MouseEvent,
  Fragment,
} from "react";

import StylesProvider from "@mui/styles/StylesProvider";

import { UploadImage, ImageFileInfo } from "@gliff-ai/upload";
import {
  CssBaseline,
  AppBar,
  theme,
  BaseIconButton,
  generateClassName,
  IconButton,
  Logo,
  icons,
  MuiCard,
  Box,
  Toolbar,
  Grid,
  List,
  ListItem,
  Button,
  Container,
  ThemeProvider,
  StyledEngineProvider,
  DataGrid,
  Chip,
  ButtonGroup,
  Typography,
  GridRenderCellParams,
  GridColDef,
  HtmlTooltip,
} from "@gliff-ai/style";

import Tile, {
  tooltips,
  thumbnailSizes,
  SizeThumbnails,
  LabelsPopover,
  AssigneesDialog,
  AutoAssignDialog,
  DefaultLabelsDialog,
  datasetType,
} from "@/components";

import { SortPopover, GroupBySeparator } from "@/sort";
import { logTaskExecution, pageLoading } from "@/decorators";
import MetadataDrawer from "./MetadataDrawer";
import { UserAccess } from "./interfaces";
import type { Metadata, MetaItem, Filter, Profile } from "./interfaces";
import { SearchBar, LabelsFilterAccordion, SearchFilterCard } from "@/search";
import { sortMetadata, filterMetadata } from "@/helpers";
import { PluginObject, PluginsAccordion } from "./components/plugins";
import { DatasetView } from "./components/DatasetView";

const bottomLeftButtons = {
  display: "flex",
  justifyContent: "space-between",
  backgroundColor: theme.palette.primary.light,
};

const smallButton = {
  backgroundColor: theme.palette.primary.light,
  height: "48px",
  width: "48px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

interface Props {
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
  datasetViewType: string;
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
      datasetViewType: datasetType[0].name,
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
          mitem.selected = mitem.imageLabels.length === 0;
        } else {
          const intersection = mitem.imageLabels.filter((l) =>
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

  changeDatasetViewType = (name: string): void => {
    this.setState({
      datasetViewType: name,
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
      mitem.imageLabels.forEach((l) => labels.add(l));
    });
    return Array.from(labels);
  };

  getMetadataKeys = (mitem: MetaItem): string[] =>
    Object.keys(mitem).filter((k) => k !== "selected");

  getImageNames = (data: Metadata): string[] =>
    data.map((mitem: MetaItem) => mitem.imageName);

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
          (mitem) => !state.selectedImagesUid.includes(mitem.id)
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
            state.metadata[itemIndex].id,
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
        const index = imageUids.indexOf(mitem.id);
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
      if (this.state.selectedImagesUid.includes(id)) {
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
    const { showAppBar } = this.props;
    const appBar = !showAppBar ? null : (
      <AppBar
        position="fixed"
        elevation={0}
        sx={{ height: "90px", paddingTop: "9px" }}
      >
        <Toolbar>
          <Grid container direction="row">
            <Grid item sx={{ marginBottom: "5px", marginTop: "7px" }}>
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
          sx={{ marginBottom: "10px" }}
        >
          <MuiCard>
            <SizeThumbnails resizeThumbnails={this.resizeThumbnails} />
          </MuiCard>

          <MuiCard>
            <DatasetView changeDatasetViewType={this.changeDatasetViewType} />
          </MuiCard>
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          sx={{ margin: "15px 0 15px" }}
        >
          <MuiCard>
            <ButtonGroup
              orientation="horizontal"
              variant="text"
              sx={{
                alignItems: "center",
                height: "48px",
                border: "none",
              }}
            >
              {this.isOwnerOrMember() && this.props.profiles && (
                <AutoAssignDialog
                  profiles={this.props.profiles}
                  metadata={this.state.metadata}
                  selectedImagesUids={this.state.selectedImagesUid}
                  updateAssignees={this.updateAssignees}
                />
              )}
              {this.props.userAccess !== UserAccess.Collaborator && (
                <DefaultLabelsDialog
                  labels={this.state.defaultLabels}
                  restrictLabels={this.state.restrictLabels}
                  multiLabel={this.state.multiLabel}
                  updateDefaultLabels={this.updateDefaultLabels}
                />
              )}
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
                    showPluginsAccordion: !prevState.showPluginsAccordion,
                  }))
                }
              />
            </ButtonGroup>
          </MuiCard>
          <MuiCard sx={{ ...smallButton }}>
            <SortPopover
              metadataKeys={this.state.metadataKeys}
              callbackSort={this.handleOnSortSubmit}
              isGrouped={this.state.isGrouped}
              toggleIsGrouped={this.toggleIsGrouped}
            />
          </MuiCard>
        </Box>
      </>
    );

    const deleteImageCard = !this.state.selectMultipleImagesMode ? null : (
      <MuiCard>
        <List component="div" sx={{ display: "flex" }}>
          <ListItem
            sx={{
              fontWeight: 500,
              justifyContent: "left",
              width: "1000px",
            }}
          >{`${this.state.selectedImagesUid.length} images selected`}</ListItem>
          {this.isOwnerOrMember() && this.props.profiles && (
            <ListItem
              sx={{
                padding: "0px",
                justifyContent: "center",
                width: "280px",
                border: "none",
              }}
            >
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
      </MuiCard>
    );

    const defaultColumns = [
      {
        headerName: "Image Name",
        field: "imageName",
        width: 150,
        editable: false,
      },
      {
        headerName: "Annotation Progress",
        field: "annotationProgress",
        width: 250,
        editable: false,
      },
      {
        headerName: "Assignees",
        field: "assignees",
        width: 300,
        editable: false,
      },
      {
        headerName: "Labels",
        field: "labels",
        width: 250,
        editable: false,
        renderCell: (params: GridRenderCellParams<unknown, MetaItem>) => {
          const { imageLabels = [] } = params.row;
          const chipsLimit = 2;
          const chipsContent: string[] = imageLabels.slice(0, chipsLimit);
          const moreLabelsCount = imageLabels.length - chipsLimit;
          const showPlaceholder =
            moreLabelsCount > 0 ? (
              <HtmlTooltip title={imageLabels.join(", ")} placement="bottom">
                <Typography>+ {moreLabelsCount} more</Typography>
              </HtmlTooltip>
            ) : null;
          const chips = chipsContent.map((imageLabel: string) => (
            <Chip label={imageLabel} key={imageLabel} variant="outlined" />
          ));
          return [chips, showPlaceholder];
        },
      },

      {
        headerName: "Pixels",
        field: "dimensions",
        width: 150,
        editable: false,
      },
      {
        headerName: "Size",
        field: "size",
        width: 150,
        editable: false,
      },
    ];
    const ignoreMetaColumns = [
      "imageName",
      "annotationProgress",
      "assignees",
      "labels",
      "pixels",
      "size",
      "id",
      "dimensions",
    ];

    const colsObj = this.state.metadata.reduce((acc, el) => {
      Object.keys(el).forEach((k) => {
        if (!ignoreMetaColumns.includes(k)) {
          acc[k] = {
            field: k,
            headerName: k, // TODO split on capital, make pretty
            width: 150,
            editable: false,
            hide: true,
          };
        }
      });

      return acc;
    }, {} as { [index: string]: GridColDef });

    const allCols = [...defaultColumns, ...Object.values(colsObj)];

    const tableView = (
      <Box sx={{ width: "100%", marginTop: "14px" }}>
        <DataGrid
          title="Dataset Details"
          columns={allCols}
          rows={this.state.metadata}
          sx={{ height: "82.7vh" }}
          hideFooterPagination
          pageSize={this.state.metadata.length}
        />
      </Box>
    );

    const imagesView = this.state.metadata
      .filter((mitem) => mitem.selected)
      .map((mitem: MetaItem, itemIndex) => (
        <Fragment key={mitem.id}>
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
                this.state.selectedImagesUid.includes(mitem.id) &&
                theme.palette.primary.main,
            }}
          >
            <Box
              sx={{
                position: "relative" as const,
                "& > button": {
                  margin: "5px",
                },
              }}
            >
              <Button
                id="images"
                onClick={(e: MouseEvent) => {
                  const imageUid = mitem.id;
                  this.handleMetadataShow(imageUid);

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
                      const selectedImagesUid = [state.selectedImagesUid[0]];

                      const startIdx = prevIdx < currIdx ? prevIdx : currIdx;
                      const endIdx = prevIdx < currIdx ? currIdx : prevIdx;

                      for (let i = startIdx; i <= endIdx; i += 1) {
                        if (!selectedImagesUid.includes(state.metadata[i].id)) {
                          selectedImagesUid.push(state.metadata[i].id);
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
                  this.props.annotateCallback?.(mitem.id);
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
                        const uid = state.metadata[index].id;
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
                <Tile
                  mitem={mitem}
                  width={this.state.thumbnailWidth}
                  height={this.state.thumbnailHeight}
                />
              </Button>
              <LabelsPopover
                id={mitem.id}
                imageName={mitem.imageName}
                labels={mitem.imageLabels}
                updateLabels={this.updateLabels(itemIndex)}
                restrictLabels={this.state.restrictLabels}
                defaultLabels={this.state.defaultLabels}
                multiLabel={this.state.multiLabel}
              />
            </Box>
          </Grid>
        </Fragment>
      ));

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
                <Grid item sx={{ width: "290px" }}>
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
                    sx={{ bottom: "10px", width: "274px" }}
                  >
                    <MuiCard sx={{ ...bottomLeftButtons }}>
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
                    </MuiCard>

                    <MuiCard sx={{ ...smallButton }}>
                      <IconButton
                        tooltip={tooltips.selectMultipleImages}
                        fill={this.state.selectMultipleImagesMode}
                        icon={tooltips.selectMultipleImages.icon}
                        tooltipPlacement="bottom"
                        onClick={() => {
                          this.setState((prevState) => ({
                            selectMultipleImagesMode:
                              !prevState.selectMultipleImagesMode,
                            openImageUid: null,
                          }));
                        }}
                        id="select-multiple-images"
                        size="small"
                      />
                    </MuiCard>
                  </Box>
                </Grid>
                <Grid
                  sx={{
                    display: "flex",
                    width: "calc(100% - 310px)",
                    justifyContent: "flex-start",
                    marginBottom: "auto",
                    marginLeft: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  {this.state.datasetViewType === "View Dataset as Images"
                    ? imagesView
                    : tableView}
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
export default UserInterface;
