
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { encryptedLocalStorage } from '@/utils/encryptedLocalStorage';
interface AuthState {
  accessToken: string | null;
  guestToken: string | null;
  isAuthenticated: boolean;
  user_id: string | null;
}

const initialState: AuthState = {
  accessToken: encryptedLocalStorage.getItem('accessToken') ?? null,
  guestToken: encryptedLocalStorage.getItem('guestToken') ?? null,
  isAuthenticated: encryptedLocalStorage.getItem('isAuthenticated') ? true : false,
  user_id: JSON.parse(encryptedLocalStorage.getItem('user_id') as string),
  // user_id:  "3a1a510e-b3e7-ea61-d8d1-0b2ae21fcd1a",

};

const TokenSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthToken: (
      state,
      action: PayloadAction<{
        accessToken?: string | null;
        guestToken?: string | null;
        isAuthenticated: boolean;
        user_id?: string | null;
      }>
    ) => {
      const { accessToken, guestToken, isAuthenticated, user_id } = action.payload;
      if (accessToken !== undefined) {
        state.accessToken = accessToken;
        encryptedLocalStorage.setItem("accessToken", accessToken || '');
      }
      
      if (guestToken !== undefined) {
        state.guestToken = guestToken;
        encryptedLocalStorage.setItem("guestToken", guestToken || '');
      }
      
      if (isAuthenticated !== undefined) {
        state.isAuthenticated = isAuthenticated;
        encryptedLocalStorage.setItem("isAuthenticated", JSON.stringify(isAuthenticated));
      }
      if (user_id !== undefined) {
        state.user_id = user_id;
        encryptedLocalStorage.setItem("user_id", JSON.stringify(user_id));
      }
    },
    clearAuthToken: (state) => {
      state.accessToken = null;
      state.guestToken = null;
      state.user_id = null;
      state.isAuthenticated = false;
      
      try {
        encryptedLocalStorage.removeItem("accessToken");
        encryptedLocalStorage.removeItem("guestToken");
        localStorage.removeItem("isAuthenticated");
        localStorage.clear()
        

      } catch (error) {
        console.error("Failed to clear localStorage:", error);
      }
    }
  },
});

export const { setAuthToken, clearAuthToken } = TokenSlice.actions;
export default TokenSlice.reducer;
