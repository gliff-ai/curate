import { ReactElement, MouseEvent } from "react";
import { svgSrc } from "@/helpers";

import SVG from "react-inlinesvg";

import { Avatar, IconButton, Button, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { theme, HtmlTooltip } from "@gliff-ai/style";

interface Props {
  tooltip: string;
  svgSrc: string;
  size?: "small" | "large" | "inline";
  onClick?: (event?: MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
  type?: "button" | "submit";
  component?: "button" | "span";
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
  const {
    size,
    isActive,
    type,
    component,
    tooltip,
    svgSrc: src,
    onClick,
  } = props;
  const classes = useStyles({ size, isActive });

  const avatarIcon = (
    <Avatar variant="circular" className={classes.avatar}>
      <SVG src={svgSrc(src)} className={classes.svg} />
    </Avatar>
  );

  return (
    <HtmlTooltip title={<Typography color="inherit">{tooltip}</Typography>}>
      {component === "span" ? (
        <Button
          component="span"
          className={classes.iconButton}
          onClick={onClick}
        >
          {avatarIcon}
        </Button>
      ) : (
        <IconButton
          type={type}
          className={classes.iconButton}
          onClick={onClick}
        >
          {avatarIcon}
        </IconButton>
      )}
    </HtmlTooltip>
  );
}

TooltipButton.defaultProps = {
  size: "small",
  isActive: false,
  type: "button",
  component: "button",
  onClick: (): null => null,
};
