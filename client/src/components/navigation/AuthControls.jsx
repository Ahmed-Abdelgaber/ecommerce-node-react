import { Button, Dropdown, Avatar } from "antd";
import { UserOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";

export function AuthControls() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, profile, clearTokens } = useUser();

  const onSignIn = () => navigate("/auth/signin");
  const onRegister = () => navigate("/auth/register");

  const menuItems = useMemo(
    () => [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: t("header.profile", "My profile"),
        onClick: () => navigate("/account"),
      },
      {
        key: "settings",
        icon: <SettingOutlined />,
        label: t("header.settings", "Settings"),
        onClick: () => navigate("/account/settings"),
      },
      {
        key: "logout",
        danger: true,
        icon: <LogoutOutlined />,
        label: t("header.logout", "Sign out"),
        onClick: () => {
          clearTokens();
          navigate("/auth/signin");
        },
      },
    ],
    [navigate, t, clearTokens],
  );

  if (!isAuthenticated) {
    return (
      <div className="header-auth__buttons">
        <Button type="text" onClick={onSignIn}>
          {t("header.signIn")}
        </Button>
        <Button type="primary" onClick={onRegister}>
          {t("header.register")}
        </Button>
      </div>
    );
  }

  return (
    <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
      <Button
        type="text"
        className="header-auth__avatar-btn"
        icon={
          <Avatar size={32} src={profile?.avatarUrl}>
            {profile?.displayName?.[0] ?? profile?.name?.[0] ?? "U"}
          </Avatar>
        }
      />
    </Dropdown>
  );
}
