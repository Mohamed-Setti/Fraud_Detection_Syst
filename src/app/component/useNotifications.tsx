import { useNotificationsContext } from "./NotificationProvider";

export const useNotifications = () => {
  return useNotificationsContext();
};