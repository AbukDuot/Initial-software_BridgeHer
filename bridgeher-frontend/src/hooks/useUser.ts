import { useContext } from "react";
import { UserContext } from "../context/UserContext";

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used within a UserProvider");
  return ctx;
}

export function useUser() {
  return useUserContext();
}
