import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ProjectSchema = new Schema({
    title: { type: String },
    description: { type: String },
    link: { type: String }
});

const UserSchema = new Schema({
    email: { type: String, required: true },
    name: { type: String },
    username: { type: String, required: true },
    profilepic: { type: String },
    coverpic: { type: String },
    razorpayid: { type: String },
    razorpaysecret: { type: String },
    phone: { type: String },
    phoneVerified: { type: Boolean, default: false },
    
    // Portfolio fields
    college: { type: String },
    graduationYear: { type: String },
    github: { type: String },
    linkedin: { type: String },
    leetcode: { type: String },
    skills: { type: String },
    certifications: { type: String },
    achievements: { type: String },
    projects: [ProjectSchema],

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

if (process.env.NODE_ENV === "development") {
    delete mongoose.models.User;
}

export default mongoose.models.User || model("User", UserSchema);