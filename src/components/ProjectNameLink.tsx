interface Props {
  name: string;
  onClick: () => void;
}

export function ProjectNameLink({ name, onClick }: Props) {
  return (
    <button type="button" className="project-name-link" onClick={onClick}>
      {name}
    </button>
  );
}
