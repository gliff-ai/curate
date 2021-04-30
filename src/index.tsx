import React from "react";
import {
  AppBar,
  CssBaseline,
  Divider,
  Drawer,
  Grid,
  List,
  ListItem,
  ListItemText,
  Theme,
  Toolbar,
  Typography,
  withStyles,
} from "@material-ui/core";

const drawerWidth = 240;

const styles = (theme: Theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    // width: `calc(100% - ${drawerWidth}px)`,
    width: `calc(100%)`,
    // marginRight: drawerWidth,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(3),
  },
});

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
  classes: {
    root: string;
    appBar: string;
    drawer: string;
    drawerPaper: string;
    toolbar: string;
    content: string;
  };
}

interface State {
  selected: number;
}

class UserInterface extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selected: null,
    };
  }

  setSelected = (i: number): void => {
    this.setState({
      selected: i,
    });
  };

  render = () => {
    const { classes } = this.props;

    let drawerItems;
    if (this.state.selected !== null) {
      const { metadata } = this.props.tiles[this.state.selected];
      drawerItems = [
        ["Size", metadata.size],
        ["Created", metadata.created],
        ["Number Of Dimensions", metadata.numberOfDimensions],
        ["Dimensions", metadata.dimensions],
        ["Number Of Channels", metadata.numberOfChannels],
        ["Labels", metadata.imageLabels.toString()],
      ];
    }
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h5" noWrap>
              CURATE
            </Typography>
          </Toolbar>
        </AppBar>

        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Grid container spacing={3}>
            {this.props.tiles.map((tile, index) => (
              <Grid item key={tile.id}>
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
        </main>

        {this.state.selected !== null && (
          <Drawer
            variant="permanent"
            anchor="right"
            className={classes.drawer}
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            <ListItem>
              {/* <ListItemText primary={"Metadata"} /> */}
              <Typography variant="h4">Metadata</Typography>
            </ListItem>
            <Divider />

            <List>
              {drawerItems.map(([name, value]) => (
                <ListItem key={name}>
                  <ListItemText>{`${name}: ${value}`}</ListItemText>
                </ListItem>
              ))}
            </List>
          </Drawer>
        )}
      </div>
    );
  };
}

export default withStyles(styles)(UserInterface);
