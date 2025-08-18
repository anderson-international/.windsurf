// Valid: Function with JSX.Element return type
export function MyComponent(props: { title: string }): JSX.Element {
  return <div>{props.title}</div>
}
