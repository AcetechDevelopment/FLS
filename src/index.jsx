import { createRoot } from "react-dom/client";
import { ConfigProvider } from "./contexts/ConfigContext";
import { MaterialProvider } from "./contexts/MaterialContext";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./index.scss";
import { InwardProvider } from "./contexts/Inward";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ConfigProvider>
    <MaterialProvider>
      <InwardProvider>   {/* ✅ now correctly imported */}
        <App />
      </InwardProvider>
    </MaterialProvider>
  </ConfigProvider>
);

reportWebVitals();
