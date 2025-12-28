import nodemailer from 'nodemailer';
const sendOTP = async (email, otp) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: '"Auction App" <no-reply@auction.com>',
        to: email,
        subject: 'Your Verification Code',
        text: `Your OTP code is: ${otp}. It expires in 10 minutes.`
    });
    return true;
};

export default { sendOTP };