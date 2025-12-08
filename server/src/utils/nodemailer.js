import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

const { MAIL_FROM, MAIL_PASSWORD, IP_SERVER_HTTPS, APP_NAME } = process.env;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: MAIL_FROM,
        pass: MAIL_PASSWORD,
    },
});

export async function sendPasswordResetEmail(toEmail, token) {
    const resetLink = `https://${IP_SERVER_HTTPS}/reset-password?token=${token}`;

    const mailOptions = {
        from: `${APP_NAME} <${MAIL_FROM}>`,
        to: toEmail,
        subject: 'Restablecer contraseña',
        html: `
            <div style="font-family: Verdana; text-align: center;">
                <h2>Recuperar contraseña</h2>
                <p>Haz clic en el botón para crear una nueva contraseña:</p>

                <a href="${resetLink}" 
                    style="
                        display:inline-block;
                        padding: 12px 20px;
                        background-color: #4CAF50;
                        color: white;
                        text-decoration:none;
                        border-radius:5px;
                        margin-top:20px;
                    ">
                    Restablecer contraseña
                </a>

                <p style="margin-top: 20px; font-size:13px;">Si no pediste esto, ignora este mensaje.</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
}
