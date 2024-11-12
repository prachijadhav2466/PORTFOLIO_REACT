console.log("Server is starting...");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON data

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("MongoDB Connected...");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

// Create a Mongoose schema and model for the contact form data
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true }
});

const ContactMessage = mongoose.model("ContactMessage", contactSchema);

// Define the API endpoint to handle contact form submissions
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Create a new document with the submitted data
    const newMessage = new ContactMessage({
      name,
      email,
      message
    });

    // Save the document to MongoDB
    await newMessage.save();

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error saving contact message:", error);
    res.status(500).json({ message: "Error saving your message. Please try again later." });
  }
});

// Serve static files from the React app in production
if (process.env.NODE_ENV === "production") {
  // Set the static folder to "Frontend/dist" (assuming that's where your build is located)
  app.use(express.static(path.join(__dirname, "Frontend", "dist")));

  // Any route that doesn't match an API endpoint will serve the index.html from React
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "Frontend", "dist", "index.html"));
  });
}

// Start the Express server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
