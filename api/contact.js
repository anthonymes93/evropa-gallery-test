// Vercel Function: independent of WordPress / wp-admin.
// Configure RESEND_API_KEY and CONTACT_FROM_EMAIL in the Vercel project.
// Optional CONTACT_TO_EMAIL defaults to the publicly listed company mailbox.
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }
  try {
    const data = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const name = String(data.name || "").trim().slice(0, 150);
    const email = String(data.email || "").trim().slice(0, 254);
    const subject = String(data.subject || "Website contact").trim().slice(0, 150);
    const message = String(data.message || "").trim().slice(0, 5000);
    const honeypot = String(data.company_website || "").trim();
    if (honeypot) return res.status(200).json({ ok: true });
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
      return res.status(400).json({ error: "Please provide a name, valid email and message." });
    }
    if (!process.env.RESEND_API_KEY || !process.env.CONTACT_FROM_EMAIL) {
      return res.status(503).json({ error: "Automatic email delivery is not configured." });
    }
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.RESEND_API_KEY,
        "Content-Type": "application/json",
        "User-Agent": "EvropaFlooring-Contact/1.0"
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL,
        to: [process.env.CONTACT_TO_EMAIL || "Evropaflooring@gmail.com"],
        reply_to: [email],
        subject: "Evropa Flooring: " + subject,
        text: "Name: " + name + "\nEmail: " + email + "\nSubject: " + subject + "\n\n" + message
      })
    });
    if (!response.ok) return res.status(502).json({ error: "Email delivery could not be completed." });
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(400).json({ error: "Unable to process the message." });
  }
}
