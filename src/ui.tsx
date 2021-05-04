import React, { Component, ChangeEvent, ReactNode } from "react";
import { AppBar, Toolbar, Grid, Typography } from "@material-ui/core";
import { Metadata, MetaItem } from "./search/interfaces";
import ComboBox from "./search/ComboBox";
import LabelsAccordion from "./search/LabelsAccordion";

export interface Tile {
  id: string;
  name: string;
  label: string;
  thumbnail: string; // base64
}
interface Props {
  tiles: Array<Tile>;
  filteredMeta?: Metadata;
}
interface State {
  filteredMeta: Metadata;
  metadata: Metadata;
  metadataKeys: string[];
  imageLabels: string[];
  expanded: string | boolean;
}

export class UserInterface extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      filteredMeta: this.props.filteredMeta || [],
      metadata: [],
      metadataKeys: [],
      imageLabels: [],
      expanded: "labels-toolbox",
    };
  }

  componentDidMount = (): void => {
    this.loadMeta("../examples/metadata.json", (data: Metadata): void => {
      // Load metadata from json file.
      if (data && data.length > 0) {
        this.setState({
          metadata: data,
          metadataKeys: Object.keys(data[0]),
          imageLabels: this.getImageLabels(data),
        });
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
    console.log(filteredMeta);
    this.setState({ filteredMeta });
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
      const intersectionLabels = mitem.imageLabels.filter((l) =>
        selectedLabels.includes(l)
      );
      if (intersectionLabels.length !== 0) {
        filteredMeta.push(mitem);
      }
    });
    console.log(filteredMeta);
    this.setState({ filteredMeta });
  };

  getImageLabels = (data: Metadata): string[] => {
    const labels: Set<string> = new Set();
    data.forEach((mitem: MetaItem): void => {
      mitem.imageLabels.forEach((l) => labels.add(l));
    });
    return Array.from(labels);
  };

  loadMeta = (
    jsonUrl: string,
    onLoadCallback: (data: Metadata) => void
  ): void => {
    // const myRequest = new Request(jsonUrl);
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
          <Typography variant="h6">CURATE</Typography>
          <ComboBox
            metadata={this.state.metadata}
            metadataKeys={this.state.metadataKeys}
            callback={this.handleOnSearchSubmit}
          />
        </Toolbar>
      </AppBar>

      <Grid container spacing={0} wrap="nowrap">
        <Grid item style={{ position: "relative", width: "200px" }}>
          <LabelsAccordion
            expanded={this.state.expanded === "labels-toolbox"}
            handleToolboxChange={this.handleToolboxChange("labels-toolbox")}
            imageLabels={this.state.imageLabels}
            callback={this.handleOnLabelSelection}
          />
        </Grid>
        <Grid item style={{ position: "relative", width: "80%" }}>
          <Grid container spacing={3}>
            {this.props.tiles.map((tile) => (
              <Grid item xs={1} key={tile.id}>
                <img
                  height={128}
                  src={`data:image/png;base64,${tile.thumbnail}`}
                  alt={tile.name}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
