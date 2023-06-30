import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../functions";

const initialState = {
    value: {
        firstName: '',
        lastName: '',
        isMember: -1
    }
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateUser: (state, action: PayloadAction<User>) => {
            state.value = action.payload;
        }
    }
});

export default userSlice;
export const { updateUser } = userSlice.actions;
