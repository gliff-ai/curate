import React, { ReactElement } from "react";
import { svgSrc } from "@/helpers";

import SVG from "react-inlinesvg";

import { Avatar, IconButton, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { HtmlTooltip } from "@/components/HtmlTooltip";
import { theme } from "@/theme";

interface Props {
  tooltip: string;
  svgSrc: string;
  size?: "small" | "large";
  onClick?: () => void;
  isActive?: boolean;
}

const useStyles = makeStyles({
  iconButton: {
    padding: ({ size }: Props) => (size === "small" ? "4px" : "5px 11px"),
  },
  svg: {
    width: "22px",
    height: "100%",
    marginLeft: "-1px",
    fill: ({ isActive }: Props) =>
      isActive ? theme.palette.primary.main : "inherit",
  },
});

export default function FloatingButton(props: Props): ReactElement {
  const classes = useStyles(props);

  return (
    <HtmlTooltip
      title={<Typography color="inherit">{props.tooltip}</Typography>}
    >
      <IconButton className={classes.iconButton} onClick={props.onClick}>
        <Avatar variant="circular">
          <SVG src={svgSrc(props.svgSrc)} className={classes.svg} />
        </Avatar>
      </IconButton>
    </HtmlTooltip>
  );
}

FloatingButton.defaultProps = {
  size: "small",
  isActive: false,
  onClick: (): null => null,
};
