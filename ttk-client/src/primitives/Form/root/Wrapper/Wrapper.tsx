import { BASE_FORM_KEY } from '@src/static/form-keys';

export default function Wrapper(props: JSX.IntrinsicElements['form']) {
  return <form id={BASE_FORM_KEY} {...props} />;
}
