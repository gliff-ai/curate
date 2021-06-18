import { ThemeProvider, createMuiTheme, Theme } from "@material-ui/core";

const theme: Theme = createMuiTheme({
  palette: {
    primary: {
      main: "#02FFAD",
    },
    secondary: {
      main: "#AE79FF",
    },
     text: {
      primary: "#2B2F3A",
      secondary:"#A1A1A1"
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

    MuiCollapse:{
      container:{
        backgroundColor: "#ffffff"
      }
    },

    MuiPaper:{
          root:{
          backgroundColor: "transparent" 
        }
    },

    MuiFormControl:{
      root:{
        display: "flex"
      }
    },

    MuiIconButton: {
      root: {
        "&:hover": {
          backgroundColor: "transparent",
        },
      },
    },

      MuiListItem: {
      button: {
      "&:hover": {
          backgroundColor: "transparent",
        },
      }
    },

    MuiList: {
      root: {
        "&:hover": {
          backgroundColor: "#ffffff",
        },
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
        backgroundColor: "transparent",
        "&:hover": {
          backgroundColor: "#02FFAD",
        },
      },
      rounded: {
        backgroundColor: "transparent",
        "&:hover": {
          backgroundColor: "transparent",
        },
        display: "contents",
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

    MuiButtonBase: {
         disableRipple: true
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