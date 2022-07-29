import { Component, ChangeEvent, ReactNode } from "react";
import StylesProvider from "@mui/styles/StylesProvider";
import { UploadImage, ImageFileInfo } from "@gliff-ai/upload";
import {
  CssBaseline,
  AppBar,
  theme,
  generateClassName,
  IconButton,
  Logo,
  icons,
  Toolbar,
  Grid,
  List,
  ListItem,
  Container,
  MuiCard,
  Box,
  ThemeProvider,
  StyledEngineProvider,
  ButtonGroup,
} from "@gliff-ai/style";

import {
  tooltips,
  thumbnailSizes,
  SizeThumbnails,
  LabelsPopover,
  AssigneesDialog,
  AutoAssignDialog,
  DefaultLabelsDialog,
  ViewAnnotationsDialog,
  datasetType,
} from "@/components";

import { SortPopover } from "@/sort";
import { logTaskExecution, pageLoading } from "@/decorators";
import MetadataDrawer, { dataNameMap } from "./MetadataDrawer";
import { UserAccess } from "./interfaces";
import type { Metadata, MetaItem, Profile } from "./interfaces";
import { SearchBar, LabelsFilterAccordion, SearchFilterCard } from "@/search";
import { getLabelsFromKeys, makeThumbnail } from "@/helpers";
import { PluginObject, PluginsAccordion } from "./components/plugins";
import { DatasetView as DatasetViewToggle } from "./components/DatasetView";
import { TableView } from "./TableView";
import { TileView } from "@/TileView";
import { Filters, FilterData } from "@/filter";

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
  annotateCallback?: (
    imageUid: string,
    username1?: string,
    usernam2?: string
  ) => void;
  downloadDatasetCallback?: () => void;
  // eslint-disable-next-line react/no-unused-prop-types
  setTask?: (task: {
    isLoading: boolean;
    description?: string;
    progress?: number;
  }) => void;
  // eslint-disable-next-line react/no-unused-prop-types
  setIsLoading?: (isLoading: boolean) => void;
  updateImagesCallback?: () => void;
  plugins?: PluginObject | null;
  profiles?: Profile[] | null;
  userAccess?: UserAccess;
  launchPluginSettingsCallback?: (() => void) | null;
  saveMetadataCallback?: ((data: unknown) => void) | null;
  restrictLabels?: boolean; // restrict image labels to defaultLabels
  multiLabel?: boolean;
  ZooDialog?: ReactNode;
  logPluginCall?: (data: {
    pluginName: string;
    pluginType?: string;
    imageUid: string;
    imageMetadata?: Metadata;
  }) => void;
}

interface State {
  metadata: Metadata;
  defaultLabels: string[];
  expanded: string | boolean;
  thumbnailSize: number;
  selectMultipleImagesMode: boolean;
  showPluginsAccordion: boolean;
  restrictLabels: boolean;
  multiLabel: boolean;
  datasetViewType: string;
  selectedImagesUid: Set<string>;
}

type SelectedImagesAction =
  | {
      type: "add" | "delete" | "toggle";
      id: string;
    }
  | {
      type: "set";
      id: string[];
    };

class UserInterface extends Component<Props, State> {
  private filters: Filters;

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
    ZooDialog: null,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      metadata: this.props.metadata.map((mitem) => ({
        ...mitem,
        filterShow: true,
      })),
      defaultLabels: this.props.defaultLabels || [],
      expanded: "labels-filter-toolbox",
      thumbnailSize: thumbnailSizes[2].size,
      selectMultipleImagesMode: false,
      showPluginsAccordion: false,
      restrictLabels: false,
      multiLabel: true,
      datasetViewType: datasetType[0].name,
      selectedImagesUid: new Set<string>(),
    };
    this.filters = new Filters();

    /* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */
    this.addUploadedImages = this.addUploadedImages.bind(this);
  }

  @pageLoading
  componentDidMount(): void {}

  /* eslint-disable react/no-did-update-set-state */
  componentDidUpdate = ({ ZooDialog, ...prevProps }: Props): void => {
    const { ZooDialog: currZooDialog, ...currProps } = this.props;

    if (JSON.stringify(prevProps) !== JSON.stringify(currProps)) {
      this.setState((oldState) => ({
        metadata: this.props.metadata.map((mitem) => ({
          ...mitem,
          filterShow: true,
        })),
        selectedImagesUid: new Set( // deselect images that have been deleted
          [...this.state.selectedImagesUid.values()].filter((id: string) =>
            this.props.metadata.map((mitem) => mitem.id).includes(id)
          )
        ),
        defaultLabels: this.props.defaultLabels || oldState.defaultLabels,
        restrictLabels: this.props.restrictLabels,
        multiLabel: this.props.multiLabel,
      }));
    }
  };

  handleToolboxChange =
    (panel: string) =>
    (event: ChangeEvent, isExpanded: boolean): void => {
      this.setState({ expanded: isExpanded ? panel : false });
    };

  // This can be swapped out for useReducer when this is a functional
  dispatchSelectedImagesUid = (action: SelectedImagesAction): void => {
    function reducer(
      oldState: Set<string>,
      { type, id }: SelectedImagesAction
    ): Set<string> {
      const state = new Set([...oldState]);
      switch (type) {
        case "add":
          return state.add(id);
        case "delete":
          state.delete(id);
          return state;
        case "toggle":
          if (state.has(id)) {
            state.delete(id);
          } else {
            state.add(id);
          }

          return state;
        case "set":
          return new Set(id);
        default:
          throw new Error();
      }
    }

    this.setState((oldState) => ({
      selectedImagesUid: reducer(oldState.selectedImagesUid, action),
    }));
  };

  applySearchFiltersToMetadata = (): void => {
    this.setState((prevState) => {
      // filter the data
      let newMetadata = this.filters.filterData(
        prevState.metadata as FilterData
      );

      // group data by value
      newMetadata = this.filters.groupByValue(newMetadata);

      return { metadata: newMetadata as Metadata };
    });
  };

  handleOnLabelSelection = (selectedLabels: string[] | null): void => {
    // Filter metadata based on selected labels.
    this.setState((prevState) => {
      prevState.metadata.forEach((mitem) => {
        if (selectedLabels === null) {
          // select all unlabelled images
          mitem.filterShow = mitem.imageLabels.length === 0;
        } else {
          const intersection = mitem.imageLabels.filter((l) =>
            selectedLabels.includes(l)
          );
          mitem.filterShow = intersection.length === selectedLabels.length;
        }
      });

      const newMetadata = this.filters.groupByValue(
        prevState.metadata as FilterData
      ) as Metadata;

      return { metadata: newMetadata };
    });
  };

  resizeThumbnails = (size: number): void => {
    this.setState({
      thumbnailSize: size,
    });
  };

  changeDatasetViewType = (name: string): void => {
    this.setState({
      datasetViewType: name,
    });
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

  deleteSelectedImages = (): void => {
    if (!this.state.selectedImagesUid) return;

    this.props.deleteImagesCallback?.([...this.state.selectedImagesUid]);

    if (!this.props.deleteImagesCallback) {
      // running standalone, so remove images here and now rather than waiting for store to update:
      this.setState((state) => {
        const metadata: Metadata = state.metadata.filter(
          (mitem) => !state.selectedImagesUid.has(mitem.id)
        );

        return {
          selectedImagesUid: new Set(),
          metadata,
        };
      });
    }
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
      if (this.state.selectedImagesUid.has(id)) {
        currentAssignees = currentAssignees.concat(assignees);
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
      const thumbnail = makeThumbnail(images[i]);
      const today = new Date();
      newMetadata.push({
        imageName: imageFileInfo[i].fileName,
        dateCreated: today.toLocaleDateString("gb-EN"),
        size: imageFileInfo[i].size.toString(),
        dimensions: `${imageFileInfo[i].width} x ${imageFileInfo[i].height}`,
        numberOfDimensions: images.length === 1 ? "2" : "3",
        numberOfChannels: images[i][0].length.toString(),
        imageLabels: [] as Array<string>,
        assignees: [],
        usersWithAnnotations: [],
        thumbnail,
        selected: true,
        newGroup: false,
      });
    }

    if (this.props.saveImageCallback) {
      // Store uploaded image
      await this.props.saveImageCallback(imageFileInfo, images);
      this.filters.resetSort();
    } else {
      // add the uploaded image directly to state.metadata
      this.setState((state) => ({
        metadata: state.metadata.concat(newMetadata),
      }));
      this.filters.resetSort();
    }
  }

  updateMetadata = (func: (data: FilterData) => FilterData) => {
    this.setState((prevState) => {
      const newMetadata = func(prevState.metadata as FilterData) as Metadata;

      return { metadata: newMetadata ? newMetadata : undefined };
    });
  };

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
          <MuiCard variant="outlined">
            <SizeThumbnails
              disabled={this.state.datasetViewType !== "View Dataset as Images"}
              resizeThumbnails={this.resizeThumbnails}
            />
          </MuiCard>
          <MuiCard variant="outlined">
            <DatasetViewToggle
              changeDatasetViewType={this.changeDatasetViewType}
            />
          </MuiCard>
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          sx={{ margin: "15px 0 15px" }}
        >
          <MuiCard variant="outlined">
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
                  selectedImagesUids={[...this.state.selectedImagesUid]}
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
          <MuiCard variant="outlined" sx={{ ...smallButton }}>
            <SortPopover
              data={this.state.metadata as FilterData}
              filters={this.filters}
              updateData={this.updateMetadata}
              getLabelsFromKeys={getLabelsFromKeys(dataNameMap)([
                "imageLabels",
              ])}
            />
          </MuiCard>
        </Box>
      </>
    );

    const deleteImageCard = (
      <MuiCard variant="outlined">
        <List component="div" style={{ display: "flex" }}>
          <ListItem
            sx={{
              fontWeight: 500,
              justifyContent: "left",
              width: "1000px",
            }}
          >{`${this.state.selectedImagesUid.size} images selected`}</ListItem>
          <ButtonGroup
            orientation="horizontal"
            variant="text"
            size="small"
            sx={{
              border: "none",
              backgroundColor: "transparent",
            }}
          >
            {this.isOwnerOrMember() && this.props.profiles && (
              <AssigneesDialog
                profiles={this.props.profiles}
                selectedImagesUids={[...this.state.selectedImagesUid]}
                updateAssignees={this.updateAssignees}
                getCurrentAssignees={this.getCurrentAssignees}
              />
            )}
            <IconButton
              tooltip={tooltips.deleteImages}
              icon={icons.delete}
              fill={null}
              onClick={this.deleteSelectedImages}
              disabled={this.state.selectedImagesUid.size === 0}
              tooltipPlacement="bottom"
            />
          </ButtonGroup>
        </List>
      </MuiCard>
    );
    this.isOwnerOrMember();

    const selectedImageAnnotators =
      this.state.selectedImagesUid.size === 1
        ? this.props.profiles
            .filter((profile) =>
              this.state.metadata
                .find(
                  (mitem) =>
                    mitem.id ===
                    [...this.state.selectedImagesUid.values()].pop()
                )
                .usersWithAnnotations.includes(profile.email)
            )
            .map((profile) => ({
              label: `${profile.name} - ${profile.email}`,
              email: profile.email,
            }))
        : [];

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

                  {this.state.selectedImagesUid.size === 1 &&
                  !this.state.selectMultipleImagesMode ? (
                    <MetadataDrawer
                      metadata={this.state.metadata.find(
                        ({ id }) =>
                          id ===
                          [...this.state.selectedImagesUid.values()].pop()
                      )}
                      close={() => {
                        // deselect the image to close the drawer
                        this.setState({ selectedImagesUid: new Set() });
                      }}
                    />
                  ) : (
                    <>
                      <SearchBar
                        data={this.state.metadata as FilterData}
                        filters={this.filters}
                        updateData={(
                          func: (data: FilterData) => FilterData
                        ): void => {
                          if (this.state.expanded !== "search-filter-toolbox") {
                            this.setState({
                              expanded: "search-filter-toolbox",
                            });
                          }

                          this.updateMetadata(func);
                        }}
                        getLabelsFromKeys={getLabelsFromKeys(dataNameMap)()}
                      />
                      <SearchFilterCard
                        filters={this.filters}
                        updateData={this.updateMetadata}
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
                        callbackOnAccordionExpanded={() =>
                          this.setState((prevState) => ({
                            metadata: this.filters.resetFilters(
                              prevState.metadata as FilterData
                            ) as Metadata,
                          }))
                        }
                      />
                      {this.state.showPluginsAccordion && (
                        <PluginsAccordion
                          plugins={this.props.plugins}
                          expanded={this.state.expanded === "plugins-toolbox"}
                          handleToolboxChange={this.handleToolboxChange(
                            "plugins-toolbox"
                          )}
                          metadata={this.state.metadata}
                          selectedImagesUid={[...this.state.selectedImagesUid]}
                          updateImagesCallback={this.props.updateImagesCallback}
                          launchPluginSettingsCallback={
                            this.props.launchPluginSettingsCallback
                          }
                          saveMetadataCallback={this.props.saveMetadataCallback}
                          logPluginCall={this.props.logPluginCall}
                        />
                      )}
                    </>
                  )}

                  {this.state.selectedImagesUid.size === 1 &&
                    this.isOwnerOrMember() && (
                      <Box
                        display="flex"
                        justifyContent="flex-end"
                        sx={{ marginTop: "10px" }}
                      >
                        <MuiCard variant="outlined">
                          <ViewAnnotationsDialog
                            users={selectedImageAnnotators}
                            annotateCallback={(
                              username1: string,
                              username2: string
                            ) =>
                              this.props.annotateCallback(
                                [
                                  ...this.state.selectedImagesUid.values(),
                                ].pop(),
                                username1,
                                username2
                              )
                            }
                            compare={false}
                          />
                        </MuiCard>
                        <MuiCard sx={{ marginLeft: "10px" }}>
                          <ViewAnnotationsDialog
                            users={selectedImageAnnotators}
                            annotateCallback={(
                              username1: string,
                              username2: string
                            ) =>
                              this.props.annotateCallback(
                                [
                                  ...this.state.selectedImagesUid.values(),
                                ].pop(),
                                username1,
                                username2
                              )
                            }
                            compare
                          />
                        </MuiCard>
                      </Box>
                    )}

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    position="fixed"
                    sx={{ bottom: "10px", width: "274px" }}
                  >
                    <MuiCard variant="outlined" sx={{ ...bottomLeftButtons }}>
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
                    {this.props.ZooDialog && (
                      <MuiCard
                        variant="outlined"
                        sx={{ marginRight: "-50px", ...bottomLeftButtons }}
                      >
                        {this.props.ZooDialog}
                      </MuiCard>
                    )}
                    {this.state.datasetViewType !== "View Dataset as Table" && (
                      <MuiCard variant="outlined" sx={{ ...smallButton }}>
                        <IconButton
                          tooltip={tooltips.selectMultipleImages}
                          fill={this.state.selectMultipleImagesMode}
                          icon={tooltips.selectMultipleImages.icon}
                          tooltipPlacement="bottom"
                          onClick={() => {
                            this.setState((prevState) => ({
                              selectMultipleImagesMode:
                                !prevState.selectMultipleImagesMode,
                            }));
                          }}
                          id="select-multiple-images"
                          size="small"
                        />
                      </MuiCard>
                    )}
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
                  {this.state.datasetViewType === "View Dataset as Images" ? (
                    <TileView
                      metadata={this.state.metadata.filter(
                        (mitem) => mitem.filterShow
                      )}
                      selectedImagesUid={[
                        this.state.selectedImagesUid,
                        this.dispatchSelectedImagesUid,
                      ]}
                      thumbnailSize={this.state.thumbnailSize}
                      isGrouped={this.filters.isGrouped}
                      selectMultipleImagesMode={
                        this.state.selectMultipleImagesMode
                      }
                      sortedBy={this.filters.sortedBy}
                      onDoubleClick={(id) => {
                        this.props.annotateCallback?.(id);
                      }}
                      labelsPopover={(mitem: MetaItem, index: number) => (
                        <LabelsPopover
                          id={mitem.id}
                          imageName={mitem.imageName}
                          labels={mitem.imageLabels}
                          updateLabels={this.updateLabels(index)}
                          restrictLabels={this.state.restrictLabels}
                          defaultLabels={this.state.defaultLabels}
                          multiLabel={this.state.multiLabel}
                        />
                      )}
                    />
                  ) : (
                    <TableView
                      metadata={this.state.metadata.filter(
                        (mitem) => mitem.filterShow
                      )}
                      selectedImagesUid={[
                        this.state.selectedImagesUid,
                        this.dispatchSelectedImagesUid,
                      ]}
                    />
                  )}
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
