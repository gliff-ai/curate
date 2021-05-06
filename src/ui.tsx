import React, { Component, ChangeEvent, ReactNode } from "react";
import { AppBar, Toolbar, Grid, Typography } from "@material-ui/core";
import { Metadata, MetaItem } from "./search/interfaces";
import ComboBox from "./search/ComboBox";
import LabelsAccordion from "./search/LabelsAccordion";
import BaseDrawer from "./components/BaseDrawer";

export interface Tile {
  id: string;
  name: string;
  label: string;
  thumbnail: string; // base64
}
interface Props {
  tiles: Array<Tile>;
}
interface State {
  metadata: Metadata;
  metadataKeys: string[];
  filteredMeta: Metadata;
  imageLabels: string[];
  imageNames: string[];
  expanded: string | boolean;
}

export class UserInterface extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      metadata: [],
      filteredMeta: [],
      metadataKeys: [],
      imageLabels: [],
      imageNames: [],
      expanded: "labels-toolbox",
    };
  }

  componentDidMount = (): void => {
    this.loadMeta("metadata.json", (data: Metadata): void => {
      // Load metadata from json file.
      if (data && data.length > 0) {
        this.setState({
          metadata: data,
          filteredMeta: data,
          metadataKeys: Object.keys(data[0]),
          imageLabels: this.getImageLabels(data),
          imageNames: this.getImageNames(data),
        });
      }
    });
  };

  handleOnSearchSubmit = (inputKey: string, inputValue: string): void => {
    // Filter metadata based on inputKey and inputValue
    if (inputKey === "" || inputValue === "") return;

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
    this.setState({
      filteredMeta,
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

    this.setState({
      filteredMeta,
      imageNames: this.getImageNames(filteredMeta),
    });
  };

  handleOnSortSubmit = (key: string, sortOrder: string): void => {
    function compare(a: string | Date, b: string | Date): number {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    }
    const sortDates = (key: string, sortOrder: string) => (
      a: MetaItem,
      b: MetaItem
    ): number => {
      const res = compare(
        new Date(a[key] as string),
        new Date(b[key] as string)
      );
      return sortOrder === "asc" ? res : -res;
    };

    const sortStrings = (key: string, sortOrder: string) => (
      a: MetaItem,
      b: MetaItem
    ): number => {
      const res = compare(
        (a[key] as string).toLowerCase(),
        (b[key] as string).toLowerCase()
      );
      return sortOrder === "asc" ? res : -res;
    };

    const filteredMeta = [...this.state.filteredMeta];
    if (key.toLowerCase().includes("date")) {
      filteredMeta.sort(sortDates(key, sortOrder));
    } else {
      filteredMeta.sort(sortStrings(key, sortOrder));
    }
    this.setState({ filteredMeta });
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

  getTileFromImageName = (imageName: string): Tile => {
    // Get tile from image name.
    const tiles = this.props.tiles.filter((tile) =>
      tile.name.includes(`/${imageName}.`)
    );
    return tiles[0];
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

  render = (): ReactNode => (
    <div style={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <BaseDrawer
            drawerContent={
              <LabelsAccordion
                expanded={this.state.expanded === "labels-toolbox"}
                handleToolboxChange={this.handleToolboxChange("labels-toolbox")}
                imageLabels={this.state.imageLabels}
                callback={this.handleOnLabelSelection}
              />
            }
          />
          <Typography variant="h6">CURATE</Typography>
          <ComboBox
            metadata={this.state.metadata}
            metadataKeys={this.state.metadataKeys}
            callbackSearch={this.handleOnSearchSubmit}
            callbackSort={this.handleOnSortSubmit}
          />
        </Toolbar>
      </AppBar>

      <Grid container spacing={0} wrap="nowrap">
        <Grid item style={{ position: "relative", width: "80%" }}>
          <Grid container spacing={3}>
            {this.state.filteredMeta.map((mitem: MetaItem) => {
              const tile = this.getTileFromImageName(mitem.imageName as string);
              return (
                <Grid item xs={1} key={tile.id}>
                  <img
                    height={128}
                    src={`data:image/png;base64,${tile.thumbnail}`}
                    alt={tile.name}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
