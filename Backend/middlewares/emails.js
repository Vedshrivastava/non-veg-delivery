import { MailtrapClient } from "mailtrap"
import { mailtrapClient, sender } from "./mailtrap.js"
import { PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE } from "./emailTemplates.js"
import { smsClient, TWILIO_PHONE_NUMBER } from '../middlewares/twilio.js'; 

export const sendVerificationSMS = async (phone, verificationToken) => {
    const message = `Your verification code is: ${verificationToken}`;

    try {
        // Ensure that the "From" number is not the same as the "To" number
        if (phone === TWILIO_PHONE_NUMBER) {
            throw new Error('The "To" and "From" numbers cannot be the same.');
        }

        console.log("phone no.====>>>", TWILIO_PHONE_NUMBER)
        const response = await smsClient.messages.create({
            from: TWILIO_PHONE_NUMBER, 
            to: phone,                 
            body: message              
        });

        console.log("Verification SMS sent successfully", response);
    } catch (error) {
        console.error(`Error sending verification SMS`, error);
        throw new Error(`Error Sending Verification SMS: ${phone}`);
    }
}

export const sendPasswordResetSMS = async (phone, resetLink) => {
    console.log('reset link sms---->',resetLink)
    const message = `Your password reset link is: ${resetLink}`;

    try {
        // Ensure that the "From" number is not the same as the "To" number
        if (phone === TWILIO_PHONE_NUMBER) {
            throw new Error('The "To" and "From" numbers cannot be the same.');
        }

        console.log("From number:", TWILIO_PHONE_NUMBER);
        const response = await smsClient.messages.create({
            from: TWILIO_PHONE_NUMBER,
            to: phone,
            body: message
        });

        console.log("Password reset SMS sent successfully", response);
    } catch (error) {
        console.error(`Error sending password reset SMS`, error);
        throw new Error(`Error Sending Password Reset SMS: ${phone}`);
    }
};



export const sendVerificationEmail = async (email, verificationToken) => {
    
    const recipient = [{email}]
    
    try {
        const response = mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your email.",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        });

        console.log("Verification email sent successfully", response);

        console.log("Email sent Successfully", response);
    } catch (error) {
        console.error(`Error sending verification`, error);
        throw new error(`Error Sending Verification Email: ${email}`);
    }
}

export const sendWelcomeEmail = async (email, name ) => {

    const recipient = [{email}];

    try {
        
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "72140660-a0ba-478e-9375-882f5c6748f1",
            template_variables: {
                company_info_name: "Test_Company_info_name",
                name: name
            }
        });

        console.log("Welcome, email sent successfully", response);

    } catch (error) {
        console.error(`Error sending verification`, error);
        throw new error(`Error Sending Verification Email: ${email}`);
    }

}

export const sendPasswordResetEmail = async (email, resetURL) => {

    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password Reset"
        });

        console.log("Password Reset email sent successfully", response);

    } catch (error) {
        console.error(`Error sending reset password`, error);
        throw new error(`Error Sending reset password Email: ${email}`);
    }

}

export const sendResetSuccessEmail = async (email) => {

    const recipient = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password reset successfull",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset"
        });

        console.log("Password Reset success email sent successfully", response);

    } catch (error) {
        console.error(`Error sending reset password success mail`, error);
        throw new error(`Error Sending reset password success Email: ${email}`);
    }
}