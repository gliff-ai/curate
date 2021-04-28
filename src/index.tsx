import React from "react";
import { Grid } from "@material-ui/core";
import { Drawer, List, ListItem } from "@material-ui/core";
import { render } from "react-dom";

export interface Tile {
  id: string;
  name: string;
  metadata: Metadata;
  thumbnail: string; // base64
}

export interface Metadata {
  size: string;
  created: string;
  numberOfDimensions: number;
  dimensions: string;
  numberOfChannels: number;
  imageLabels: string[];
  fileMetaVersion: string;
}

interface Props {
  tiles: Array<Tile>;
}

interface State {
  selected: number;
}

export class UserInterface extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selected: 0,
    };
  }

  setSelected = (i: number): void => {
    this.setState({
      selected: i,
    });
  };

  render = () => (
    <div>
      <h1>CURATE</h1>
      <Grid container spacing={3}>
        {this.props.tiles.map((tile, index) => (
          <Grid item xs={1} key={tile.id}>
            <img
              height={128}
              src={`data:image/png;base64,${tile.thumbnail}`}
              alt={tile.name}
              onClick={() => {
                this.setSelected(index);
              }}
            />
          </Grid>
        ))}
      </Grid>

      <Drawer variant="permanent" anchor="right">
        {this.state.selected !== null && (
          <List>
            {Object.entries(this.props.tiles[this.state.selected].metadata).map(
              ([key, value], index) => (
                <ListItem key={index}>{`${key}: ${value}`}</ListItem>
              )
            )}
          </List>
        )}
      </Drawer>
    </div>
  );
}
