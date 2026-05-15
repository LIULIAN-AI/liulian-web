// src/LiulianText.tsx
import { jsx } from "react/jsx-runtime";
var VARIANT_STYLES = {
  display: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--fontsize-6xl)",
    fontWeight: 500,
    lineHeight: 0.95,
    letterSpacing: "-0.04em"
  },
  displayShort: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--fontsize-5xl)",
    fontWeight: 500,
    lineHeight: 0.98,
    letterSpacing: "-0.035em"
  },
  heading: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--fontsize-4xl)",
    fontWeight: 500,
    lineHeight: 1.05,
    letterSpacing: "-0.025em"
  },
  title: {
    fontFamily: "var(--font-display)",
    fontSize: "var(--fontsize-3xl)",
    fontWeight: 500,
    lineHeight: 1.12,
    letterSpacing: "-0.02em"
  },
  subtitle: {
    fontFamily: "var(--font-body)",
    fontSize: "var(--fontsize-xl)",
    fontWeight: 500,
    lineHeight: 1.35,
    letterSpacing: "-0.01em"
  },
  body: {
    fontFamily: "var(--font-body)",
    fontSize: "var(--fontsize-md)",
    fontWeight: 400,
    lineHeight: 1.55
  },
  bodyStrong: {
    fontFamily: "var(--font-body)",
    fontSize: "var(--fontsize-md)",
    fontWeight: 500,
    lineHeight: 1.55
  },
  caption: {
    fontFamily: "var(--font-body)",
    fontSize: "var(--fontsize-xs)",
    fontWeight: 400,
    lineHeight: 1.45
  },
  monoLabel: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--fontsize-xs)",
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: "0.10em",
    textTransform: "uppercase"
  }
};
var VARIANT_DEFAULT_TAG = {
  display: "h1",
  displayShort: "h1",
  heading: "h2",
  title: "h3",
  subtitle: "p",
  body: "p",
  bodyStrong: "p",
  caption: "p",
  monoLabel: "span"
};
function LiulianText({
  variant = "body",
  color = "var(--color-ink-charcoal)",
  as,
  align = "left",
  className,
  children
}) {
  const Tag = as ?? VARIANT_DEFAULT_TAG[variant] ?? "p";
  const style = {
    ...VARIANT_STYLES[variant],
    color,
    textAlign: align,
    margin: 0
  };
  const Component = Tag;
  return /* @__PURE__ */ jsx(Component, { style, className, children });
}

// src/LiulianButton.tsx
import { useState } from "react";
import { jsx as jsx2 } from "react/jsx-runtime";
var HEIGHT = {
  sm: "var(--control-height-sm)",
  md: "var(--control-height-md)",
  lg: "var(--control-height-lg)"
};
var PADDING_X = {
  sm: "var(--control-paddingx-sm)",
  md: "var(--control-paddingx-md)",
  lg: "var(--control-paddingx-lg)"
};
var FONT_SIZE = {
  sm: "var(--fontsize-sm)",
  md: "var(--fontsize-md)",
  lg: "var(--fontsize-lg)"
};
function backgroundFor(variant, hovered) {
  if (hovered) {
    switch (variant) {
      case "primary":
        return "var(--color-unibe-red-deep)";
      case "secondary":
        return "var(--color-canvas-warm)";
      case "ghost":
        return "var(--color-canvas-warm)";
      case "danger":
        return "var(--color-unibe-red-deep)";
    }
  }
  switch (variant) {
    case "primary":
      return "var(--color-unibe-red)";
    case "secondary":
      return "var(--color-surface-pure)";
    case "ghost":
      return "transparent";
    case "danger":
      return "var(--color-unibe-red-deep)";
  }
}
function foregroundFor(variant) {
  switch (variant) {
    case "primary":
    case "danger":
      return "var(--color-surface-pure)";
    case "secondary":
      return "var(--color-ink-charcoal)";
    case "ghost":
      return "var(--color-ink-muted)";
  }
}
function LiulianButton({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  ariaLabel,
  onPress,
  children
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const bg = backgroundFor(variant, hovered && !disabled && !loading);
  const fg = foregroundFor(variant);
  const style = {
    height: HEIGHT[size],
    padding: `0 ${PADDING_X[size]}`,
    backgroundColor: bg,
    color: fg,
    border: variant === "secondary" ? "1px solid var(--color-hairline)" : "none",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    fontSize: FONT_SIZE[size],
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    transform: pressed && !disabled ? "scale(0.98)" : hovered && !disabled ? "translateY(-1px)" : "translateY(0)",
    transition: `background-color var(--motion-duration-fast) var(--motion-ease-out-quart), transform var(--motion-duration-instant) var(--motion-ease-out)`,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--control-icongap)",
    outline: "none",
    minHeight: "var(--touch-mintarget-ios)"
  };
  return /* @__PURE__ */ jsx2(
    "button",
    {
      type: "button",
      style,
      "aria-label": ariaLabel,
      "aria-disabled": disabled,
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => {
        setHovered(false);
        setPressed(false);
      },
      onMouseDown: () => setPressed(true),
      onMouseUp: () => setPressed(false),
      onClick: () => {
        if (!disabled && !loading) onPress?.();
      },
      onFocus: (e) => {
        e.currentTarget.style.outline = `var(--focus-ringwidth) solid var(--color-unibe-red)`;
        e.currentTarget.style.outlineOffset = `var(--focus-ringoffset)`;
      },
      onBlur: (e) => {
        e.currentTarget.style.outline = "none";
      },
      disabled: disabled || loading,
      children: loading ? /* @__PURE__ */ jsx2(
        "span",
        {
          "aria-hidden": true,
          style: {
            width: "var(--control-iconsize-md)",
            height: "var(--control-iconsize-md)",
            border: `2px solid ${fg}`,
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "liulian-spin 600ms linear infinite"
          }
        }
      ) : children
    }
  );
}
if (typeof document !== "undefined" && !document.getElementById("liulian-keyframes")) {
  const style = document.createElement("style");
  style.id = "liulian-keyframes";
  style.textContent = "@keyframes liulian-spin { to { transform: rotate(360deg); } }";
  document.head.appendChild(style);
}

// src/LiulianCard.tsx
import { useState as useState2 } from "react";
import { Fragment, jsx as jsx3, jsxs } from "react/jsx-runtime";
var PADDING = {
  compact: "var(--spacing-4)",
  default: "var(--spacing-6)",
  spacious: "var(--spacing-7)"
};
var GAP = {
  compact: "var(--spacing-3)",
  default: "var(--spacing-4)",
  spacious: "var(--spacing-5)"
};
function LiulianCard({
  size = "default",
  interactive = false,
  selected = false,
  disabled = false,
  ariaLabel,
  onPress,
  header,
  footer,
  children
}) {
  const [hovered, setHovered] = useState2(false);
  const [pressed, setPressed] = useState2(false);
  const borderColor = selected ? "var(--color-unibe-red)" : hovered && interactive ? "var(--color-hairline-strong)" : "var(--color-hairline)";
  const borderWidth = selected ? 2 : 1;
  const style = {
    padding: PADDING[size],
    background: "var(--color-surface-pure)",
    border: `${borderWidth}px solid ${borderColor}`,
    borderRadius: "var(--radius-md)",
    display: "flex",
    flexDirection: "column",
    gap: GAP[size],
    cursor: interactive && !disabled ? "pointer" : "default",
    transform: interactive && pressed && !disabled ? "scale(0.99)" : interactive && hovered && !disabled ? "translateY(-2px)" : "translateY(0)",
    boxShadow: interactive && hovered && !disabled ? "var(--shadow-raise)" : "none",
    transition: `transform var(--motion-duration-medium) var(--motion-ease-out-quart), box-shadow var(--motion-duration-medium) var(--motion-ease-out-quart)`,
    opacity: disabled ? 0.4 : 1,
    outline: "none"
  };
  const inner = /* @__PURE__ */ jsxs(Fragment, { children: [
    header && /* @__PURE__ */ jsxs(Fragment, { children: [
      header,
      /* @__PURE__ */ jsx3("div", { style: { height: 1, background: "var(--color-hairline)", margin: 0 } })
    ] }),
    children,
    footer && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx3("div", { style: { height: 1, background: "var(--color-hairline)", margin: 0 } }),
      footer
    ] })
  ] });
  if (interactive) {
    return /* @__PURE__ */ jsx3(
      "div",
      {
        role: "button",
        tabIndex: disabled ? -1 : 0,
        "aria-label": ariaLabel,
        "aria-pressed": selected,
        "aria-disabled": disabled,
        style,
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => {
          setHovered(false);
          setPressed(false);
        },
        onMouseDown: () => setPressed(true),
        onMouseUp: () => setPressed(false),
        onClick: () => {
          if (!disabled) onPress?.();
        },
        onKeyDown: (e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) {
            e.preventDefault();
            onPress?.();
          }
        },
        children: inner
      }
    );
  }
  return /* @__PURE__ */ jsx3("div", { style, children: inner });
}
export {
  LiulianButton,
  LiulianCard,
  LiulianText
};
//# sourceMappingURL=index.js.map