import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.GMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendBookingEmail = async (
  toEmail: string | undefined,
  bookingId: string
) => {
  await transporter.sendMail({
    from: '"Smart Parking" <bodhinayakaindra@gmail.com>',
    to: toEmail as string,
    subject: "Parking Booking Confirmed",
    html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
                .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { padding: 20px; }
                .booking-id { background: #F3F4F6; padding: 15px; border-radius: 5px; text-align: center; font-size: 18px; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; color: #6B7280; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Booking Confirmed ✅</h1>
                </div>
                <div class="content">
                    <p>Dear Valued Customer,</p>
                    <p>Your parking booking has been successfully confirmed. Here are your booking details:</p>
                    
                    <div class="booking-id">
                        Booking ID: ${bookingId}
                    </div>
                    
                    <p>Please keep this Booking ID safe as you'll need it for entry and exit.</p>
                    <p>If you have any questions, please contact our support team.</p>
                </div>
                <div class="footer">
                    <p>Thank you for choosing Smart Parking!</p>
                    <p>© ${new Date().getFullYear()} Smart Parking. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
      `,
  });
  console.log(`✅ Email sent to ${toEmail}`);
};
