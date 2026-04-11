const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp:   { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,        // ← remove () — Date.now not Date.now()
    expires: 5 * 60,          // ← 5 minutes not 5 hours (5*60*60 = 5hrs)
  },
});

async function sendVerificationMail(email, otp) {
  await mailSender(
    email,
    "OTP Verification – AITools",
    `<h2>Your OTP is: <strong>${otp}</strong></h2><p>Valid for 5 minutes.</p>`
  );
}

otpSchema.pre("save", async function (next) {
  if (this.isNew) {   // ← only send email on first save, not updates
    await sendVerificationMail(this.email, this.otp);
  }
});

module.exports = mongoose.model("Otp", otpSchema);