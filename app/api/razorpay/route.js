import { NextResponse } from "next/server";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import Payment from "@/models/Payment";
import Resume from "@/models/Resume";
import { handleResumeGenerationAndEmail } from "@/actions/resumeHelper";
import connectDb from "@/db/connectDb";
import User from "@/models/User";
export const POST = async (req) => {
    await connectDb()
    let body = await req.formData()
    body = Object.fromEntries(body)
    let isResume = false;
    let secret = "";
    let p = await Payment.findOne({oid: body.razorpay_order_id})
    
    if (p) {
        // fetch the secret of the user who is getting the payment 
        let user = await User.findOne({username: p.to_user})
        secret = user.razorpaysecret
    } else {
        let r = await Resume.findOne({razorpayOrderId: body.razorpay_order_id})
        if (r) {
            isResume = true;
            secret = process.env.KEY_SECRET; // Global developer secret for resume purchases
        } else {
            return NextResponse.json({success: false, message:"Order Id not found"})
        }
    }
    // Verify the payment
    let xx = validatePaymentVerification({"order_id": body.razorpay_order_id, "payment_id": body.razorpay_payment_id}, body.razorpay_signature, secret)
    if(xx){
        if (isResume) {
            // Update the resume status
            const updatedResume = await Resume.findOneAndUpdate({razorpayOrderId: body.razorpay_order_id}, {paymentStatus: "paid"}, {new: true})
            // Generate PDF and send Email
            await handleResumeGenerationAndEmail(updatedResume);
            
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/create-resume?success=true&id=${updatedResume._id}`, 303)
        } else {
            // Update the payment status
            const updatedPayment = await Payment.findOneAndUpdate({oid: body.razorpay_order_id}, {done: true}, {new: true})
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/${updatedPayment.to_user}?paymentdone=true`, 303)  
        }
    }
    else{
        return NextResponse.json({success: false, message:"Payment Verification Failed"})
    }
}
