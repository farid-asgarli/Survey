function Bold(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M7 5h6a3.5 3.5 0 0 1 0 7h-6z" />
      <path d="M13 12h1a3.5 3.5 0 0 1 0 7h-7v-7" />
    </svg>
  );
}

function Italic(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M11 5l6 0" />
      <path d="M7 19l6 0" />
      <path d="M14 5l-4 14" />
    </svg>
  );
}

function Strikethrough(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M5 12l14 0" />
      <path d="M16 6.5a4 2 0 0 0 -4 -1.5h-1a3.5 3.5 0 0 0 0 7h2a3.5 3.5 0 0 1 0 7h-1.5a4 2 0 0 1 -4 -1.5" />
    </svg>
  );
}

function Underline(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M7 5v5a5 5 0 0 0 10 0v-5" />
      <path d="M5 19h14" />
    </svg>
  );
}

function UnorderedList(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M9 6l11 0" />
      <path d="M9 12l11 0" />
      <path d="M9 18l11 0" />
      <path d="M5 6l0 .01" />
      <path d="M5 12l0 .01" />
    </svg>
  );
}

function OrderedList(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M11 6h9" />
      <path d="M11 12h9" />
      <path d="M12 18h8" />
      <path d="M4 16a2 2 0 1 1 4 0c0 .591 -.5 1 -1 1.5l-3 2.5h4" />
      <path d="M6 10v-6l-2 2" />
    </svg>
  );
}

function HorizontalRule(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M5 12h2" />
      <path d="M17 12h2" />
      <path d="M11 12h2" />
    </svg>
  );
}

function Link(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M9 15l6 -6" />
      <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" />
      <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" />
    </svg>
  );
}

function Unlink(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M9 15l3 -3m2 -2l1 -1" />
      <path d="M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464" />
      <path d="M3 3l18 18" />
      <path d="M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463" />
    </svg>
  );
}
function Justify(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 6l16 0" />
      <path d="M4 12l16 0" />
      <path d="M4 18l12 0" />
    </svg>
  );
}

function JustifyCenter(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 6l16 0" />
      <path d="M8 12l8 0" />
      <path d="M6 18l12 0" />
    </svg>
  );
}

function JustifyLeft(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 6l16 0" />
      <path d="M4 12l10 0" />
      <path d="M4 18l14 0" />
    </svg>
  );
}

function JustifyRight(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 6l16 0" />
      <path d="M10 12l10 0" />
      <path d="M6 18l14 0" />
    </svg>
  );
}

function RemoveFormat(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M17 15l4 4m0 -4l-4 4" />
      <path d="M7 6v-1h11v1" />
      <path d="M7 19l4 0" />
      <path d="M13 5l-4 14" />
    </svg>
  );
}

function FontSize(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M17.5 15.5m-3.5 0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0" />
      <path d="M3 19v-10.5a3.5 3.5 0 0 1 7 0v10.5" />
      <path d="M3 13h7" />
      <path d="M21 12v7" />
    </svg>
  );
}

function Subscript(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M5 7l8 10m-8 0l8 -10" />
      <path d="M21 20h-4l3.5 -4a1.73 1.73 0 0 0 -3.5 -2" />
    </svg>
  );
}

function Superscript(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M5 7l8 10m-8 0l8 -10" />
      <path d="M21 11h-4l3.5 -4a1.73 1.73 0 0 0 -3.5 -2" />
    </svg>
  );
}

function Highlight(props: JSX.IntrinsicElements['svg']) {
  return (
    <svg {...props}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M3 19h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
      <path d="M12.5 5.5l4 4" />
      <path d="M4.5 13.5l4 4" />
      <path d="M21 15v4h-8l4 -4z" />
    </svg>
  );
}

export const RichTextIcons = {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  UnorderedList,
  OrderedList,
  HorizontalRule,
  Link,
  Unlink,
  Justify,
  JustifyCenter,
  JustifyLeft,
  JustifyRight,
  RemoveFormat,
  FontSize,
  Subscript,
  Superscript,
  Highlight,
};
