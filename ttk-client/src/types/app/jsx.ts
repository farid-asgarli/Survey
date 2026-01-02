declare global {
  namespace JSX {
    type CommonHTMLProps<T extends keyof IntrinsicElements[K] = "id", K extends keyof IntrinsicElements = "div"> = Pick<
      IntrinsicElements[K],
      "className" | "style" | "id" | T
    >;
  }
}

export {};
