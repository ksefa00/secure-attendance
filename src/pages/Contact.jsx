function Contact() {
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', color: '#2c3e50' }}>Contact Us</h1>
      <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#555' }}>
        We'd love to hear from you. Reach out to us through any of the following means:
      </p>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        <li><strong>Email:</strong> <a href="mailto:sefakelvin111@gmail.com" style={{ color: '#2980b9' }}>sefakelvin111@gmail.com</a></li>
        <li><strong>Phone:</strong> +233 599 612 632</li>
        <li><strong>Location:</strong> KNUST Campus, Kumasi, Ghana</li>
      </ul>
    </div>
  );
}

export default Contact;
