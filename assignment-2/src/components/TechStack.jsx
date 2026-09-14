function TechStack({ items }) {
  return (
    <p className="tech-stack">
      <strong>Tech Stack:</strong> {items.join(', ')}
    </p>
  );
}

export default TechStack;
