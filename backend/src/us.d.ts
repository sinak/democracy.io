declare module 'us' {
  interface State { name: string; abbr: string; }
  export function lookup(input: string): State | undefined;
}
