export default function Check(props: JSX.IntrinsicElements["svg"]) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M5 12l5 5l10 -10" />
    </svg>
  );
}
