import { ThemeProvider, createMuiTheme, Theme } from "@material-ui/core";

const theme: Theme = createMuiTheme({
  palette: {
    primary: {
      main: "#02FFAD",
    },
    secondary: {
      main: "#AE79FF",
    },
  },
  typography: {
    fontFamily: "Roboto",
  },
  shape: {
    borderRadius: 6,
  },

  overrides: {
    MuiButton: {
      root: {
        color: "#000000",
        "&:hover": {
          backgroundColor: "transparent",
        },
      },
    },

    MuiPaper:{
          root:{

  backgroundColor: "transparent"          }
    },

    MuiIconButton: {
      root: {
        "&:hover": {
          backgroundColor: "transparent",
        },
      },
    },

    MuiCheckbox: {
      colorSecondary: {
        color: "#000",
      },
      checked: {
        fill: "#02FFAD",
      },
    },

    MuiSlider: {
      root: {
        color: "#000000",
        textAlign: "center",
      },
      vertical: {
        height: "auto",
      },
    },

    MuiPopover: {
      root: {
        marginLeft: "20px",
      },
    },

    MuiButtonGroup: {
      root: {
        border: "1px solid #dadde9",
        borderRadius: "9px",
        padding: "8px",
        background: "#fafafa",
        width: "63px",
      },
    },
    MuiDivider: {
      root: {
        marginTop: "-15px",
        width: "90%",
        marginLeft: "12px",
        marginBottom: "17px",
      },
    },

    MuiAvatar: {
      colorDefault: {
        backgroundColor: "#fff",
        "&:hover": {
          backgroundColor: "#02FFAD",
        },
      },
    },
  },

  props: {
    MuiIconButton: {
      disableRipple: true,
    },

    MuiButtonGroup: {
      orientation: "vertical",
      variant: "outlined",
      disableRipple: true,
    },

    MuiPopover: {
      anchorOrigin: {
        vertical: "top",
        horizontal: "right",
      },
      transformOrigin: {
        vertical: "top",
        horizontal: "left",
      },
    },
  },
});

export { ThemeProvider, theme };
