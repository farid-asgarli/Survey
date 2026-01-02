export default function SquareRounded(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M9 12h6"></path>
      <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z"></path>
    </svg>
  );
}
