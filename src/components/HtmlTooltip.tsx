import { Tooltip, withStyles } from "@material-ui/core";
import { theme } from "@gliff-ai/style";
import { Theme } from "@material-ui/core/styles";

export const HtmlTooltip = withStyles((t: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.primary.light,
    fontSize: t.typography.pxToRem(12),
    border: "1px solid #dadde9",
    color: theme.palette.text.primary,
  },
}))(Tooltip);
