import { ReactElement, ChangeEvent, useState } from "react";
import {
  Paper,
  Divider,
  MenuList,
  ButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Avatar,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import SVG from "react-inlinesvg";
import {
  theme,
  icons,
  IconButton,
  WarningSnackbar,
  HtmlTooltip,
  BaseTooltipTitle,
  Typography,
  MenuItem,
} from "@gliff-ai/style";
import type { PluginElement, PluginObject } from "./interfaces";
import { Metadata } from "@/interfaces";
import { PluginDialog } from "./PluginDialog";

const useStyles = makeStyles({
  accordion: {
    marginTop: "15px",
    borderRadius: "9px",
  },
  paperHeader: {
    borderRadius: (accordionOpened) =>
      accordionOpened ? "9px 9px 0 0" : "9px",
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
  },
  menuItem: {
    margin: 0,
    fontSize: "16px",
    paddingLeft: "12px",
    height: "40px",
    "&:hover": {
      backgroundColor: theme.palette.grey[300],
    },
  },
  divider: { margin: 0, width: "100%", lineHeight: "1px" },
  paperFooter: {
    borderRadius: "9px",
    padding: "0 12px",
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
  updateImagesCallback: () => void | null;
  launchPluginSettingsCallback: (() => void) | null;
  saveMetadataCallback: ((data: any) => void) | null;
}

export const PluginsAccordion = ({
  expanded,
  plugins,
  handleToolboxChange,
  updateImagesCallback,
  metadata,
  selectedImagesUid,
  saveMetadataCallback,
  launchPluginSettingsCallback,
}: Props): ReactElement | null => {
  const classes = useStyles(expanded);
  const [error, setError] = useState<string | null>(null);
  const [dialogContent, setDialogContent] = useState<JSX.Element | null>(null);

  if (!plugins) return null;

  const runPlugin = async (plugin: PluginElement): Promise<void> => {
    try {
      const collectionUid = window.location.href.split("/").pop();

      // If any image is selected, a JS plugin works on this selection,
      // otherwise it works on all the images open in CURATE.
      const imageUids =
        selectedImagesUid.length === 0
          ? metadata.map(({ id }) => id)
          : selectedImagesUid;

      let data;
      if (plugin.type === "Javascript") {
        data = {
          metadata: metadata
            .map(({ selected, newGroup, ...mitem }) => mitem) // exclude keys added in CURATE
            .filter(({ id }) => imageUids.includes(id)),
        };
      } else {
        data = {
          collectionUid,
          imageUid: selectedImagesUid[0] || undefined,
        };
      }

      const response = await plugin.onClick(data);
      if (updateImagesCallback) {
        updateImagesCallback();
      }

      if (response?.message) {
        setError(response.message);
      }

      if (response?.domElement) {
        setDialogContent(response.domElement);
      }

      if (response?.data) {
        // only allow to update the metadata for the selected images
        const newMetadata = response?.data?.metadata?.filter(({ id }) =>
          imageUids.includes(id)
        );

        if (
          newMetadata !== undefined &&
          Object.keys(newMetadata).length !== 0 &&
          saveMetadataCallback
        ) {
          saveMetadataCallback({
            collectionUid,
            metadata: newMetadata,
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getPluginButtons = (): JSX.Element[][] => {
    const pluginNames = Object.keys(plugins);

    return pluginNames.map((name) => {
      const plugin = plugins[name];

      return plugin.map((p) => (
        <MenuItem
          key={p.name}
          onClick={() => runPlugin(p)}
          className={classes.menuItem}
          dense
        >
          <HtmlTooltip
            placement="top"
            title={
              <BaseTooltipTitle
                tooltip={{
                  name: `${p.name} — ${p.tooltip}`,
                }}
              />
            }
          >
            <Typography className={classes.truncate}>
              {p.name}&nbsp;—&nbsp;{p.tooltip}
            </Typography>
          </HtmlTooltip>
        </MenuItem>
      ));
    });
  };

  return (
    <>
      <Accordion
        disableGutters
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
                  window.open("https://docs.gliff.app/", "_blank");
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
