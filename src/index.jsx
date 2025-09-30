import { createRoot } from "react-dom/client";
import { ConfigProvider } from "./contexts/ConfigContext";
import { MaterialProvider } from "./contexts/MaterialContext";
// import { InwardProvider } from "./contexts/Inward";
// import { MaterialProvider } from "./contexts/MaterialContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./index.scss";
import { InwardProvider } from "./contexts/Inward";
import { InventoryProvider } from "./contexts/InventoryContext";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ConfigProvider>
    <MaterialProvider>
      <InwardProvider>  
        <InventoryProvider>
              <App />
        </InventoryProvider>
         {/* ✅ now correctly imported */}
      
      </InwardProvider>
    </MaterialProvider>
  </ConfigProvider>
);

reportWebVitals();
