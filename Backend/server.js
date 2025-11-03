// server.js
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // parse JSON body

const PORT = process.env.PORT || 5000;

// Create a transporter using Gmail + App Password
// For production, OAuth2 is recommended. See Nodemailer docs.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,        // SSL port
  secure: true,     // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,    // your Gmail or company email
    pass: process.env.EMAIL_PASS,    // App Password (16 chars)
  },
});

// Basic health check
app.get("/", (req, res) => res.send("Mailer server is up"));

// Endpoint to receive contact form
app.post("/send", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    // Nodemailer options
const mailOptions = {
  from: `"Azaya Marketing" <${process.env.EMAIL_USER}>`,
  replyTo: email, // user email from form
  to: process.env.RECEIVER_EMAIL || process.env.EMAIL_USER,
  subject: `New Contact Form Submission from ${name}`,
  html: `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; background-color: #f2f2f2;">
      <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
        <div style="background-color: #007bff; color: #fff; text-align: center; padding: 15px;">
          <h2>New Contact Form Submission</h2>
        </div>
        <div style="padding: 15px;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f9f9f9; padding: 10px; border-left: 4px solid #007bff; border-radius: 5px;">
            ${message.replace(/\n/g, "<br/>")}
          </div>
        </div>
        <div style="padding: 10px; font-size: 12px; color: #777; text-align: center; background: #f2f2f2;">
          This email was sent from Azaya Marketing contact form.
        </div>
      </div>
    </div>
  `,
};



    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error("Send email error:", err);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
