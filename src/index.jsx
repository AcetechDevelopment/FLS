import { createRoot } from "react-dom/client";
import { ConfigProvider } from "./contexts/ConfigContext";
import { MaterialProvider } from "./contexts/MaterialContext"; // ✅ import

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./index.scss";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ConfigProvider>
    <MaterialProvider>   {/* ✅ wrap app */}
      <App />
    </MaterialProvider>
  </ConfigProvider>
);

reportWebVitals();
