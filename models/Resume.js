import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ResumeSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    college: { type: String, required: true },
    cgpa: { type: String },
    linkedin: { type: String },
    github: { type: String },
    leetcode: { type: String },
    codeforces: { type: String },
    skills: { type: String },
    description: { type: String },
    certification: { type: String },
    razorpayOrderId: { type: String, required: true },
    paymentStatus: { type: String, default: "pending" },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Resume || model("Resume", ResumeSchema);
