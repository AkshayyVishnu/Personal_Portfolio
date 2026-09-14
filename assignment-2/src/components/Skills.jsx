const skills = [
  ['Languages', 'C, C++, Python, Java, R'],
  ['ML / DL', 'XGBoost, CNNs, RNNs, LSTMs, Transformers, Regression, Classification'],
  ['Frameworks', 'TensorFlow, Keras, PyTorch, Scikit-learn, LangChain, NLTK'],
  ['Tools & Infra', 'NumPy, Pandas, Optuna, Jupyter, Git'],
  ['Coursework', 'Data Structures & Algorithms, OOP (Java), DBMS, Operating Systems'],
];

function Skills() {
  return (
    <section id="skills">
      <h2>Technical Skills</h2>
      <ul className="skill-list">
        {skills.map(([group, items]) => (
          <li key={group}><strong>{group}:</strong> {items}</li>
        ))}
      </ul>
    </section>
  );
}

export default Skills;
