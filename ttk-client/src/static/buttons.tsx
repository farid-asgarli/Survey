import { Icon } from '@src/components/icons';
import Button, { ButtonProps } from '@src/components/interface/Button/Button';
import React from 'react';

export const CommonButtons = {
  Submit: React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
    <Button ref={ref} leftIcon={<Icon name="Check" />} type="submit" children="Yadda saxla" {...props} />
  )),
  Reject: React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
    <Button ref={ref} leftIcon={<Icon name="Close" />} variant="outline" children="İmtina" {...props} />
  )),
  Back: React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
    <Button ref={ref} leftIcon={<Icon name="ArrowLeft" />} variant="outline" children="Geri" {...props} />
  )),
  Print: React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
    <Button ref={ref} leftIcon={<Icon name="Print" />} variant="outline" children="Çap et" color="indigo" {...props} />
  )),
  Reload: React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => (
    <Button ref={ref} leftIcon={<Icon name="Reload" />} variant="outline" children="Yenilə" {...props} />
  )),
  New: React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => <Button ref={ref} leftIcon={<Icon name="Plus" />} {...props} />),
};
