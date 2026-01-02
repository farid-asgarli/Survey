export default function ChartArcs(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
      <path d="M16.924 11.132a5 5 0 1 0 -4.056 5.792" />
      <path d="M3 12a9 9 0 1 0 9 -9" />
    </svg>
  );
}
