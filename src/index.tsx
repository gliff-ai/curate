import React from "react";
import { Grid } from "@material-ui/core";

export interface Tile {
  name: string;
  label: string;
  thumbnail: string; // base64
}

interface Props {
  tiles: Array<Tile>;
}

export const UserInterface = (props: Props): React.ReactElement => (
  <div>
    <h1>CURATE</h1>
    <Grid container spacing={3}>
      {props.tiles.map((tile, index) => (
        <Grid item xs={1} key={index}>
          <img
            height={128}
            src={`data:image/png;base64,${tile.thumbnail}`}
            alt={tile.name}
          />
        </Grid>
      ))}
    </Grid>
  </div>
);
