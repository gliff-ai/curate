import { ThemeProvider, createMuiTheme, Theme } from "@material-ui/core";
import type {} from "@material-ui/lab/themeAugmentation";

const theme: Theme = createMuiTheme({
  palette: {
    primary: {
      main: "#02FFAD",
      light: "#FFFFFF",
    },
    secondary: {
      main: "#AE79FF",
      light: "#fafafa",
    },
    text: {
      primary: "#2B2F3A",
      secondary: "#A1A1A1",
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

    MuiAccordionSummary: {
      root: {
        "&$expanded": {
          minHeight: "4px",
        },
      },
    },

    MuiCardContent: {
      root: {
        "&:last-child": {
          paddingBottom: "18px",
        },
      },
    },

    MuiAutocomplete: {
      option: {
        '&[data-focus="true"]': {
          backgroundColor: "#02FFAD",
        },
      },
    },

    MuiCollapse: {
      container: {
        backgroundColor: "#ffffff",
      },
    },

    MuiPaper: {
      root: {
        backgroundColor: "transparent",
      },
    },

    MuiFormControl: {
      root: {
        display: "flex",
      },
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
      },
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
      rounded: {
        "&:hover": {
          backgroundColor: "transparent",
        },
        display: "contents",
      },
      circular: {
        backgroundColor: "transparent",
        "&:hover": {
          backgroundColor: "#02FFAD",
        },
      },
      circle: {
        backgroundColor: "transparent",
        "&:hover": {
          backgroundColor: "#fff",
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

    MuiButtonBase: {
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
