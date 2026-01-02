import React from 'react';
import clsx from 'clsx';
import styles from './Element.module.scss';

export default function Element({ className, ...props }: React.HtmlHTMLAttributes<HTMLDivElement>) {
  return <div className={clsx(styles.form_element, className)} {...props} />;
}
