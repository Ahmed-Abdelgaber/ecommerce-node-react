import { Badge, Button, Tooltip } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { selectCartCount } from "../../store/cart/cartSlice";
import { useUser } from "../../hooks/useUser";

export function CartButton() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const count = useAppSelector(selectCartCount);
  const { isAuthenticated } = useUser();

  const handleClick = () => {
    if (isAuthenticated) {
      navigate("/cart");
    } else {
      navigate("/auth/signin?redirect=/cart");
    }
  };

  return (
    <Tooltip title={t("header.cart")}>  
      <Badge count={count} size="small" offset={[4, -2]}>
        <Button type="text" icon={<ShoppingCartOutlined />} onClick={handleClick} className="header-cart__button" />
      </Badge>
    </Tooltip>
  );
}
