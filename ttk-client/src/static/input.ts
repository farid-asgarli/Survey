import { NumberInputProps } from "@mantine/core";
import ErrorMessages from "./messages/errorMessages";

export const inputDecimalProps: NumberInputProps = {
  decimalSeparator: ".",
  precision: 2,
};

export const limitMax = (val: number, message?: string) => ({
  max: {
    message: !message ? `Maksimum rəqəm ${val}-ə bərabər olmalıdır` : message,
    value: val,
  },
});

export const limitMin = (val: number, message?: string) => ({
  max: {
    message: !message ? `Minimum rəqəm ${val}-ə bərabər olmalıdır` : message,
    value: val,
  },
});

export const commonRules = {
  required: ErrorMessages.FieldIsRequired,
};
