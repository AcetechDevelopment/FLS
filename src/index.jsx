import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { ConfigProvider } from "./contexts/ConfigContext";
import { MaterialProvider } from "./contexts/MaterialContext";
import ErrorBoundary from "./components/ErrorBoundary";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";

import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./index.scss";
import { InwardProvider } from "./contexts/Inward";
import { InventoryProvider } from "./contexts/InventoryContext";
import { store } from "./store";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ErrorBoundary>
    <Provider store={store}>
      <ConfigProvider>
        <MaterialProvider>
          <InwardProvider>  
            <InventoryProvider>
              <App />
            </InventoryProvider>
          </InwardProvider>
        </MaterialProvider>
      </ConfigProvider>
    </Provider>
  </ErrorBoundary>
);

reportWebVitals();
