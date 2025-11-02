import "../styles/about.css";
import member1 from "../assets/member1.jpg";
import member2 from "../assets/member2.jpg";
import member3 from "../assets/member3.jpg";
import mission from "../assets/ConcordiaCampus.jpg";
import values from "../assets/ConcordiaCampus1.jpg";

export default function About() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About Us</h1>
          <p>
            We’re passionate about creating opportunities for students and communities to
            connect, grow, and make an impact. Our platform helps people discover events,
            register seamlessly, and share experiences together.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-section">
        <div className="about-text">
          <h2>Our Mission</h2>
          <p>
            Our mission is to empower organizations and students by making event
            management simple, accessible, and inspiring. Whether you’re hosting a
            workshop, social night, or academic conference — we’re here to make your
            events unforgettable.
          </p>
        </div>
        <div className="about-image about-image-right">
          <img src={mission} alt="Our mission" />
        </div>
      </section>

      {/* Values Section */}
      <section className="about-section reverse">
        <div className="about-image about-image-left">
          <img src={values} alt="Our values" />
        </div>
        <div className="about-text">
          <h2>Our Values</h2>
          <ul>
            <li><strong>Community:</strong> We believe in bringing people together.</li>
            <li><strong>Innovation:</strong> We embrace new ideas and technologies.</li>
            <li><strong>Integrity:</strong> We act with honesty and purpose.</li>
            <li><strong>Growth:</strong> We never stop learning and improving.</li>
          </ul>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team">
        <h2>Meet the Team</h2>
        <div className="team-grid">
          <div className="card team-member">
            <img src={member1} alt="Team member 1" />
            <h3>Alex Johnson</h3>
            <p>Founder & Developer</p>
          </div>
          <div className="card team-member">
            <img src={member2} alt="Team member 2" />
            <h3>Jamie Lee</h3>
            <p>UI/UX Designer</p>
          </div>
          <div className="card team-member">
            <img src={member3} alt="Team member 3" />
            <h3>Taylor Smith</h3>
            <p>Community Manager</p>
          </div>
        </div>
      </section>
    </div>
  );
}