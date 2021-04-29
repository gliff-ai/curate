import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { SearchClass } from "./search/SearchClass";

export const UserInterface: React.FC = (): React.ReactElement => (
  <div style={{ flexGrow: 1 }}>
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">Curate</Typography>
        <SearchClass />
      </Toolbar>
    </AppBar>
  </div>
);
