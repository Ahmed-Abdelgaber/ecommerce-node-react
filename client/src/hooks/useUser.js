import { useUserContext } from "../providers/UserProvider.jsx";

export function useUser() {
  return useUserContext();
}

export { USER_STATUS } from "../providers/UserProvider.jsx";
