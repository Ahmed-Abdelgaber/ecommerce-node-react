import { Layout, Space, Flex, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocale } from "../../providers/LocaleProvider.jsx";
import { Logo } from "../brand/Logo.jsx";
import { ThemeToggle } from "../navigation/ThemeToggle.jsx";
import { LocaleToggle } from "../navigation/LocaleToggle.jsx";
import { AuthControls } from "../navigation/AuthControls.jsx";
import { CartButton } from "../navigation/CartButton.jsx";
import { SearchBar } from "../../features/search/components/SearchBar.jsx";
import { SearchDialog } from "../../features/search/components/SearchDialog.jsx";
import "./SiteHeader.css";

const { Header } = Layout;

export function SiteHeader() {
  const { direction } = useLocale();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  const openSearch = useCallback(() => setIsSearchOpen(true), []);

  return (
    <Header className="site-header" data-direction={direction}>
      <motion.div
        className="site-header__content"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
      >
        <Flex align="center" gap="large">
          <Flex align="center" gap="middle" className="site-header__start">
            <Logo size={40} />
          </Flex>

          <div className="site-header__search">
            <SearchBar onOpen={openSearch} />
          </div>

          <motion.div className="site-header__actions" initial="initial" animate="animate">
            <Space size="middle" align="center">
              <motion.div className="site-header__mobile-search">
                <Button type="text" size="large" icon={<SearchOutlined />} onClick={openSearch} />
              </motion.div>
              <LocaleToggle />
              <ThemeToggle />
              <CartButton />
              <AuthControls />
            </Space>
          </motion.div>
        </Flex>
      </motion.div>
      <SearchDialog open={isSearchOpen} onClose={closeSearch} />
    </Header>
  );
}
