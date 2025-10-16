import { memo } from "react";
import { useTheme, THEMES } from "../../providers/ThemeProvider.jsx";
import lightLogo from "../../assets/logo-light.png";
import darkLogo from "../../assets/logo-dark.png";
import "./Logo.css";

export const Logo = memo(function Logo({ size = 48, withText = false }) {
  const { theme } = useTheme();
  const src = theme === THEMES.DARK ? darkLogo : lightLogo;

  return (
    <div className="logo__wrapper" style={{ "--logo-size": `${size}px` }}>
      <img className="logo__image" src={src} alt="Ecommerce logo" />
      {withText ? <span className="logo__text">ecommerce</span> : null}
    </div>
  );
});
