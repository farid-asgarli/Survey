export default function Dashboard(props: JSX.IntrinsicElements["svg"]) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 4h6v8h-6z" />
      <path d="M4 16h6v4h-6z" />
      <path d="M14 12h6v8h-6z" />
      <path d="M14 4h6v4h-6z" />
    </svg>
  );
}
