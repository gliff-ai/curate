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
  size?: "small" | "large" | "inline";
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
  type?: "button" | "submit";
}

const useStyles = makeStyles({
  iconButton: {
    padding: ({ size }: Props) => {
      if (size === "small") return "4px";
      if (size === "large") return "5px 11px";

      return "2px";
    },
  },
  svg: {
    width: "22px",
    height: "100%",
    marginLeft: "-1px",
    fill: ({ isActive }: Props) =>
      isActive ? theme.palette.primary.main : "inherit",
  },
});

export default function TooltipButton(props: Props): ReactElement {
  const classes = useStyles(props);

  return (
    <HtmlTooltip
      title={<Typography color="inherit">{props.tooltip}</Typography>}
    >
      <IconButton
        type={props.type}
        className={classes.iconButton}
        onClick={props.onClick}
      >
        <Avatar variant="circular">
          <SVG src={svgSrc(props.svgSrc)} className={classes.svg} />
        </Avatar>
      </IconButton>
    </HtmlTooltip>
  );
}

TooltipButton.defaultProps = {
  size: "small",
  isActive: false,
  type: "button",
  onClick: (): null => null,
};
