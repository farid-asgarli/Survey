import clsx from 'clsx';
import styles from './Group.module.scss';
import React from 'react';
import Card, { CardProps } from '@src/primitives/Card/Card';

interface FormGroupProps extends JSX.CommonHTMLProps<'children'>, CardProps {
  loading?: boolean;
  cols?: number;
  footer?: React.ReactNode;
}

function Group({ className, title, header, footer, loading, cols, children, ...props }: FormGroupProps) {
  return (
    <div className={clsx(styles.form_group, cols && styles.grid)} {...props}>
      <Card header={header} title={title}>
        <div
          className={clsx(styles.elements, className)}
          style={
            cols
              ? {
                  gridTemplateColumns: `repeat(${cols},1fr)`,
                }
              : undefined
          }
        >
          {loading
            ? React.Children.map(children, (elem) => React.isValidElement(elem) && React.cloneElement(elem, { ...elem.props, loading }))
            : children}
        </div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </Card>
    </div>
  );
}
export default Group;
