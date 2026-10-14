import { Provider } from "react-redux";
import { store } from "./store";
import { setTelegramUser } from "./store/userSlice";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import "./styles/pages.css";
import { backendApi } from "./api/backend";
import { initTelegram, isTelegram, tg } from "./telegram/telegram";

initTelegram();
store.dispatch(setTelegramUser(tg?.initDataUnsafe.user ?? null));

if (isTelegram && tg) {
  // Run once outside React effects, including in development StrictMode.
  void store.dispatch(
    backendApi.endpoints.authorize.initiate(tg.initDataUnsafe, {
      fixedCacheKey: "startup-auth",
    }),
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
