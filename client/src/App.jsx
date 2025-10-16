import { Layout } from "antd";
import { SiteHeader } from "./components/layout/SiteHeader.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import "./styles/index.css";

function App() {
  return (
    <Layout className="app-shell">
      <SiteHeader />
      <Layout.Content className="app-shell__content">
        <AppRoutes />
      </Layout.Content>
    </Layout>
  );
}

export default App;
