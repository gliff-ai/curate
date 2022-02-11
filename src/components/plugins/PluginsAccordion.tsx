import { ReactElement, ChangeEvent, useState } from "react";
import {
  Paper,
  Typography,
  Divider,
  MenuList,
  MenuItem,
  ButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import SVG from "react-inlinesvg";
import { theme, icons, IconButton, WarningSnackbar } from "@gliff-ai/style";
import type { PluginElement, PluginObject } from "./interfaces";
import { Metadata } from "@/interfaces";
import { PluginDialog } from "./PluginDialog";

const useStyles = makeStyles({
  accordion: {
    borderRadius: (accordionOpened) => (accordionOpened ? "9px 9px 0 0" : 0),
  },
  paperHeader: {
    borderRadius: "inherit",
    height: "49px",
    minHeight: "49px !important",
    backgroundColor: (accordionOpened) =>
      accordionOpened
        ? theme.palette.primary.main
        : theme.palette.primary.light,
  },
  topography: {
    display: "inline",
    fontWeight: 500,
    marginLeft: "10px",
  },
  menuItem: {
    margin: 0,
    fontSize: "16px",
    paddingLeft: "20px",
    height: "40px",
    "&:hover": {
      backgroundColor: theme.palette.grey[300],
    },
  },
  divider: { margin: 0, width: "100%", lineHeight: "1px" },
  paperFooter: {
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonGroup: { border: "none", backgroundColor: "transparent" },
  truncate: {
    width: "250px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  accordionDetails: { margin: 0, padding: 0 },
  avatar: {
    backgroundColor: (accordionOpened) =>
      accordionOpened ? theme.palette.primary.light : "transparent",
    width: "30px",
    height: "30px",
  },
  expandIcon: {
    fill: (accordionOpened) =>
      accordionOpened ? theme.palette.primary.main : null,
    width: "15px",
    height: "auto",
    transform: "rotate(-90deg)",
  },
});

interface Props {
  expanded: boolean;
  handleToolboxChange: (event: ChangeEvent, isExpanded: boolean) => void;
  plugins: PluginObject | null;
  metadata: Metadata;
  selectedImagesUid: string[];
  updateImagesCallback: () => void;
  launchPluginSettingsCallback: (() => void) | null;
}

export const PluginsAccordion = ({
  expanded,
  plugins,
  handleToolboxChange,
  updateImagesCallback,
  metadata,
  selectedImagesUid,
  launchPluginSettingsCallback,
}: Props): ReactElement | null => {
  const classes = useStyles(expanded);
  const [error, setError] = useState<string | null>(null);
  const [dialogContent, setDialogContent] = useState<JSX.Element | null>(null);

  if (!plugins) return null;

  const runPlugin = async (plugin: PluginElement): Promise<void> => {
    // TODO: delete when plug-in is updated
    if (plugin.name === "Geolocation Map") {
      try {
        const onClick = plugin.onClick as unknown as (
          metadata: Metadata
        ) => Promise<JSX.Element | null>;

        const response = await onClick(metadata);

        if (response === null) {
          setError("No geolocation data found.");
          return;
        }

        setDialogContent(response);
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        const collectionUid = window.location.href.split("/").pop();

        const data = {
          collectionUid,
          imageUid: selectedImagesUid[0] || undefined,
          metadata,
        };

        const response = await plugin.onClick(data);
        updateImagesCallback();

        if (response?.message) {
          setError(response.message);
        }

        if (response?.domElement) {
          setDialogContent(response.domElement);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getPluginButtons = (): JSX.Element[][] => {
    const pluginNames = Object.keys(plugins);

    return pluginNames.map((name) => {
      const plugin = plugins[name];

      return plugin.map((p) => (
        <MenuItem
          onClick={() => runPlugin(p)}
          className={classes.menuItem}
          dense
        >
          <Typography className={classes.truncate}>
            {p.name}&nbsp;—&nbsp;{p.tooltip}
          </Typography>
        </MenuItem>
      ));
    });
  };

  return (
    <>
      <Accordion
        expanded={expanded}
        onChange={handleToolboxChange}
        className={classes.accordion}
      >
        <AccordionSummary
          className={classes.paperHeader}
          expandIcon={
            <Avatar className={classes.avatar}>
              <SVG className={classes.expandIcon} src={icons.previousNext} />
            </Avatar>
          }
        >
          <Typography className={classes.topography}>Plugins</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDetails}>
          <MenuList>{getPluginButtons()}</MenuList>
          <Divider className={classes.divider} />
          <Paper elevation={0} square className={classes.paperFooter}>
            <SVG src={icons.betaStatus} width="auto" height="25px" />
            <ButtonGroup
              className={classes.buttonGroup}
              orientation="horizontal"
              variant="text"
            >
              {launchPluginSettingsCallback && (
                <IconButton
                  tooltip={{ name: "Settings" }}
                  icon={icons.cog}
                  onClick={launchPluginSettingsCallback}
                  fill={false}
                  tooltipPlacement="top"
                  size="small"
                />
              )}
              <IconButton
                tooltip={{ name: "Docs" }}
                icon={icons.documentHelp}
                onClick={() => {
                  // TODO: Redirect to docs
                }}
                tooltipPlacement="top"
                size="small"
              />
            </ButtonGroup>
          </Paper>
        </AccordionDetails>
      </Accordion>
      <WarningSnackbar
        open={error !== null}
        onClose={() => setError(null)}
        messageText={error}
      />
      <PluginDialog setChildren={setDialogContent}>
        {dialogContent}
      </PluginDialog>
    </>
  );
};
