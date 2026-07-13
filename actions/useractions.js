"use server"

import Razorpay from "razorpay"
import Payment from "@/models/Payment"
import connectDb from "@/db/connectDb"
import User from "@/models/User"
import Resume from "@/models/Resume"


export const initiate = async (amount, to_username, paymentform) => {
    await connectDb()
    // fetch the secret of the user who is getting the payment 
    let user = await User.findOne({username: to_username})
    const secret = user.razorpaysecret

    var instance = new Razorpay({ key_id: user.razorpayid, key_secret: secret })



    let options = {
        amount: Number.parseInt(amount),
        currency: "INR",
    }

    let x = await instance.orders.create(options)

    // create a payment object which shows a pending payment in the database
    await Payment.create({ oid: x.id, amount: amount/100, to_user: to_username, name: paymentform.name, message: paymentform.message })

    return x

}


export const fetchuser = async (usernameOrEmail) => {
    await connectDb()
    let u = await User.findOne({
        $or: [
            { username: usernameOrEmail },
            { email: usernameOrEmail }
        ]
    })
    if (!u) return null;
    let user = u.toObject({ flattenObjectIds: true })
    return user
}

export const fetchpayments = async (username) => {
    await connectDb()
    // find all payments sorted by decreasing order of amount and flatten object ids
    let p = await Payment.find({ to_user: username, done:true }).sort({ amount: -1 }).limit(10).lean()
    return p
}

export const updateProfile = async (ndata, oldusernameOrEmail) => {
    await connectDb()
    
    const updateData = { ...ndata }
    delete updateData._id
    delete updateData.__v
    delete updateData.email // Prevent primary/account email from being modified

    // Find the user by their old username or email first to get the correct document
    let existingUser = await User.findOne({
        $or: [
            { username: oldusernameOrEmail },
            { email: oldusernameOrEmail }
        ]
    })

    if (!existingUser) {
        return { error: "User not found" }
    }

    // If the username is being updated, check if the new username is already taken by someone else
    if (existingUser.username !== updateData.username) {
        let u = await User.findOne({ username: updateData.username })
        if (u && u.email !== existingUser.email) {
            return { error: "Username already exists" }
        }
        
        await User.updateOne({ _id: existingUser._id }, updateData)
        // Now update all the usernames in the Payments table
        await Payment.updateMany({ to_user: existingUser.username }, { to_user: updateData.username })
    } else {
        await User.updateOne({ _id: existingUser._id }, updateData)
    }
    return { success: true }
}

export const initiateResumePayment = async (resumeForm) => {
    await connectDb();

    const key_id = process.env.KEY_ID;
    const key_secret = process.env.KEY_SECRET;

    if (!key_id || !key_secret) {
        throw new Error("Razorpay credentials are not configured on the server.");
    }

    const instance = new Razorpay({ key_id, key_secret });

    // Amount for resume generation: ₹1 (100 paise)
    const amount = 100; 

    const options = {
        amount: amount,
        currency: "INR",
    };

    const order = await instance.orders.create(options);

    // Save pending resume record
    const newResume = await Resume.create({
        name: resumeForm.name,
        email: resumeForm.email,
        college: resumeForm.college,
        cgpa: resumeForm.cgpa,
        linkedin: resumeForm.linkedin,
        github: resumeForm.github,
        leetcode: resumeForm.leetcode,
        codeforces: resumeForm.codeforces,
        skills: resumeForm.skills,
        description: resumeForm.description,
        certification: resumeForm.certification,
        razorpayOrderId: order.id,
        paymentStatus: "pending",
    });

    return {
        orderId: order.id,
        amount: amount,
        keyId: key_id,
        resumeId: newResume._id.toString()
    };
}

