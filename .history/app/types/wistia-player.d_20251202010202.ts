// Allow JSX to accept the Wistia web component <wistia-player>
declare namespace JSX {
  interface IntrinsicElements {
    "wistia-player": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}
