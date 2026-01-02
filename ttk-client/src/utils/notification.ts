import { NotificationProps, notifications } from '@mantine/notifications';
import { Icon } from '@src/components/icons';
import React from 'react';

/**
 * Notifications object which includes various types of notification methods
 * such as success, error, warning, loading, and close.
 *
 * @namespace Notifications
 */
export const Notifications = {
  /**
   * Displays an informational notification with a specified message.
   *
   * @function success
   * @memberof Notifications
   * @param {NotificationProps["message"]} message - The message to be displayed.
   * @param {Omit<NotificationProps, "message">} [props] - Optional additional notification properties.
   */
  info: (message: NotificationProps['message'], props?: Omit<NotificationProps, 'message'>) =>
    notifications.show({
      message,
      color: 'blue',
      icon: React.createElement(Icon, {
        size: '1.1rem',
        name: 'Info',
      }),
      radius: 'md',
      title: 'Məlumat',
      ...props,
    }),
  /**
   * Displays a success notification with a specified message.
   *
   * @function success
   * @memberof Notifications
   * @param {NotificationProps["message"]} message - The message to be displayed.
   * @param {Omit<NotificationProps, "message">} [props] - Optional additional notification properties.
   */
  success: (message: NotificationProps['message'], props?: Omit<NotificationProps, 'message'>) =>
    notifications.show({
      message,
      color: 'teal',
      radius: 'md',
      icon: React.createElement(Icon, {
        size: '1.1rem',
        name: 'Check',
      }),
      ...props,
    }),
  /**
   * Displays an error notification with a specified message.
   *
   * @function error
   * @memberof Notifications
   * @param {NotificationProps["message"]} message - The message to be displayed.
   * @param {Omit<NotificationProps, "message">} [props] - Optional additional notification properties.
   */
  error: (message: NotificationProps['message'], props?: Omit<NotificationProps, 'message'>) =>
    notifications.show({
      message,
      color: 'red',
      radius: 'md',

      icon: React.createElement(Icon, {
        size: '1.1rem',
        name: 'Close',
      }),
      title: 'Xəta',
      ...props,
    }),
  /**
   * Displays a warning notification with a specified message.
   *
   * @function warning
   * @memberof Notifications
   * @param {NotificationProps["message"]} message - The message to be displayed.
   * @param {Omit<NotificationProps, "message">} [props] - Optional additional notification properties.
   */
  warning: (message: NotificationProps['message'], props?: Omit<NotificationProps, 'message'>) =>
    notifications.show({
      message,
      color: 'orange',
      radius: 'md',

      icon: React.createElement(Icon, {
        size: '1.1rem',
        name: 'AlertCircle',
      }),
      title: 'Xəbərdarlıq',
      withCloseButton: false,
      ...props,
    }),
  /**
   * Displays a loading notification with a specified or default message.
   *
   * @function loading
   * @memberof Notifications
   * @param {NotificationProps["message"]} [message = "Yüklənir..."] - The message to be displayed.
   * @param {Omit<NotificationProps, "message">} [props] - Optional additional notification properties.
   */
  loading: (message: NotificationProps['message'] = 'Yüklənir...', props?: Omit<NotificationProps, 'message'>) =>
    notifications.show({
      message,
      loading: true,
      radius: 'md',

      withCloseButton: false,
      ...props,
    }),
  /**
   * Closes all notifications.
   *
   * @function close
   * @memberof Notifications
   */
  close: () => notifications.clean(),
};
