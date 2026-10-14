import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { backendApi, type AuthUser } from "../api/backend";
import type { tg } from "../telegram/telegram";

type TelegramUser = NonNullable<
  NonNullable<typeof tg>["initDataUnsafe"]["user"]
>;

interface UserState {
  user: AuthUser | null;
  telegramUser: TelegramUser | null;
}

const initialState: UserState = { user: null, telegramUser: null };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setTelegramUser(state, action: PayloadAction<TelegramUser | null>) {
      state.telegramUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(backendApi.endpoints.authorize.matchPending, (state) => {
        state.user = null;
      })
      .addMatcher(
        backendApi.endpoints.authorize.matchFulfilled,
        (state, action) => {
          state.user = action.payload.user;
        },
      )
      .addMatcher(backendApi.endpoints.authorize.matchRejected, (state) => {
        state.user = null;
      });
  },
});

export const { setTelegramUser } = userSlice.actions;
export const userReducer = userSlice.reducer;
