import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice";
import { checkAuthState } from "@/utils/auth";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check and restore auth state on app startup
    const authState = checkAuthState();
    if (authState) {
      console.log("Restoring user state from localStorage");
      dispatch(setUser(authState.user));
    }
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;
