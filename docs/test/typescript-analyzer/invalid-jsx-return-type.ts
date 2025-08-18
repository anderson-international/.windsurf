// Invalid: Function without JSX.Element return type
export function MyComponent(props: { title: string }) {
  return <div>{props.title}</div>
}
