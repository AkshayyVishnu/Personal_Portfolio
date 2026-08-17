import Skills from '../components/Skills';

const education = [
  'National Institute of Technology, Warangal',
  'Bachelor of Technology in Computer Science and Engineering',
  'Aug 2024 - May 2028',
  'CGPA: 9.01 / 10',
];

const achievements = [
  'Winner - ISEA National Fintech & Cybersecurity Hackathon, IIT Ropar.',
  'National Finalist - The Arch Hackathon, IIT Kharagpur; ranked #1 entering the finals.',
  'Winner & Special Mention - Hitachi Innothon 3.0.',
  'Winner - FINNOVATE Hackathon, NIT Warangal.',
  'Top 500 - Smart India Hackathon 2025.',
  'Represented the CSE Department at the Academic - Industry Conclave.',
  'Awarded Most Outstanding Student of the Year from a cohort of 211 students.',
];

const extracurriculars = [
  'Represented Tamil Nadu in Badminton.',
  'Gold Medalist - Inter-University Badminton Championship.',
  'Executive Member - Computer Science and Engineering Society (CSES), NIT Warangal.',
  'Executive Member - HAM ARC.',
  'Best Public Speaker - Junior Toastmasters.',
];

function About() {
  return (
    <>
      <section id="about">
        <h1>About</h1>
        <h2>Education</h2>
        <ul className="card-list">
          {education.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section id="experience">
        <h2>Experience</h2>
        <ul className="card-list">
          <li>
            <h3>Undergraduate Researcher - On-Device Machine Learning</h3>
            <p>
              Built privacy-preserving mobile inference for SMS fraud and phishing detection. Full
              technical detail is under Projects.
            </p>
          </li>
        </ul>
      </section>

      <section id="achievements">
        <h2>Achievements</h2>
        <ul className="card-list">
          {achievements.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <Skills />

      <section id="extracurriculars">
        <h2>Extracurriculars and Positions of Responsibility</h2>
        <ul className="card-list">
          {extracurriculars.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>
    </>
  );
}

export default About;
