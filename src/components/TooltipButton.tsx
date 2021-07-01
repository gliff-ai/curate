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
    padding: ({ size }: Partial<Props>) => {
      if (size === "small") return "4px";
      if (size === "large") return "5px 11px";

      return "2px";
    },
  },
  svg: {
    width: "22px",
    height: "100%",
    marginLeft: "-1px",
    fill: ({ isActive }: Partial<Props>) =>
      isActive ? theme.palette.primary.main : "inherit",
  },
  avatar: {
    "&:hover": { backgroundColor: theme.palette.primary.main },
    "&:hover > svg": { fill: "#000" },
  },
});

export default function TooltipButton(props: Props): ReactElement {
  const { size, isActive, type, tooltip, svgSrc: src, onClick } = props;
  const classes = useStyles({ size, isActive });

  return (
    <HtmlTooltip title={<Typography color="inherit">{tooltip}</Typography>}>
      <IconButton type={type} className={classes.iconButton} onClick={onClick}>
        <Avatar variant="circular" className={classes.avatar}>
          <SVG src={svgSrc(src)} className={classes.svg} />
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
