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
};

export const sendEmailChangedEmail = async (oldEmail, newEmail) => {
    try {
    await transporter.sendMail({
      from: `${APP_NAME} <${MAIL_FROM}>`,
      to: oldEmail,
      subject: "Tu email ha sido actualizado",
      html: `
        <h2>Cambio de correo detectado</h2>
        <p>Tu dirección de correo ha sido modificada.</p>
        <p><strong>Nuevo correo:</strong> ${newEmail}</p>
        <p>Si no has realizado este cambio, por favor cambia tu contraseña inmediatamente.</p>
        <p>Fecha: ${new Date().toLocaleString()}</p>
      `,
    });
  } catch (error) {
    console.error("Error enviando email de cambio de correo:", error);
  }
};

export const sendVerifyNewEmail = async (newEmail, token) => {
  try {
    const url = `${process.env.FRONTEND_URL}/verify-new-email?token=${token}`;

    await transporter.sendMail({
      from: `${APP_NAME} <${MAIL_FROM}>`,
      to: newEmail,
      subject: "Verifica tu nuevo correo",
      html: `
        <h2>Verifica tu nuevo correo electrónico</h2>
        <p>Haz clic en el siguiente botón para confirmar el cambio de tu correo:</p>
        <a href="${url}" style="padding: 10px 20px; background: #4CAF50; color: #fff; text-decoration:none;">
          Verificar nuevo correo
        </a>
        <p>Si no has solicitado este cambio, ignora este mensaje.</p>
      `
    });
  } catch (error) {
    console.error("Error enviando verificación de nuevo correo:", error);
  }
};

