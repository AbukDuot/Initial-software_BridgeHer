import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/responsive.css";
import "./styles/responsive-fixes.css";
import * as serviceWorker from "./serviceWorker";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for offline support
serviceWorker.register({
  onSuccess: () => console.log('✅ Offline mode enabled'),
  onUpdate: () => console.log('🔄 New version available')
});
