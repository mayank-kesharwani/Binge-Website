import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

export const sendEmail = async ({
  to,
  name,
  subject,
  htmlContent,
}) => {
  try {
    const response =
      await brevo.transactionalEmails.sendTransacEmail({
        sender: {
          name: process.env.BREVO_SENDER_NAME || "Binge",
          email: process.env.BREVO_SENDER_EMAIL,
        },

        to: [
          {
            email: to,
            name: name || "Binge User",
          },
        ],

        subject,
        htmlContent,
      });

    console.log(
      "Brevo email sent:",
      response.messageId,
    );

    return response;
  } catch (error) {
    console.error(
      "Brevo email sending error:",
      error,
    );

    throw error;
  }
};