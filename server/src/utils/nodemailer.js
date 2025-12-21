import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { log } from 'console';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });


const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI;
const EMAIL_FROM = process.env.EMAIL_FROM;
const APP_NAME = process.env.APP_NAME || 'MyBookSpace';
const IP_SERVER_HTTPS = process.env.IP_SERVER_HTTPS;


const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function createTransporter() {
  const accessToken = (await oAuth2Client.getAccessToken())?.token;
  if (!accessToken) throw new Error('No se pudo generar access token');

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: EMAIL_FROM,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken
    },
  });
}

export async function getTransporter() {
  return createTransporter();
}

export async function sendPasswordResetEmail(toEmail, token) {
  const transporter = await getTransporter();
  // Use HTTPS link that redirects to deep link (email clients make HTTPS links clickable)
  const resetLink = `${IP_SERVER_HTTPS}/redirect/reset-password?token=${token}`;

  console.log('🔗 Reset link generado:', resetLink);

  const html = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Restablecer contraseña</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px;">
              <tr>
                <td align="center" style="padding: 40px 30px;">
                  <h2 style="color: #333333; font-family: Arial, sans-serif; font-size: 24px; margin: 0 0 20px 0;">Restablecer contraseña</h2>
                  <p style="color: #666666; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                    Pulsa el siguiente botón para actualizar tu contraseña:
                  </p>
                  <!-- Button -->
                  <table border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="border-radius: 6px; background-color: #007bff;">
                        <!--[if mso]>
                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetLink}" style="height:50px;v-text-anchor:middle;width:250px;" arcsize="10%" strokecolor="#007bff" fillcolor="#007bff">
                          <w:anchorlock/>
                          <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Restablecer contraseña</center>
                        </v:roundrect>
                        <![endif]-->
                        <!--[if !mso]><!-->
                        <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; background-color: #007bff;">
                          Restablecer contraseña
                        </a>
                        <!--<![endif]-->
                      </td>
                    </tr>
                  </table>
                  <!-- End Button -->
                  <p style="color: #999999; font-family: Arial, sans-serif; font-size: 14px; line-height: 20px; margin: 30px 0 10px 0;">
                    Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.
                  </p>
                  <p style="color: #999999; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; margin: 10px 0 0 0;">
                    O copia y pega este enlace en tu navegador móvil:<br/>
                    <a href="${resetLink}" style="color: #007bff; word-break: break-all;">${resetLink}</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `${APP_NAME} <${EMAIL_FROM}>`,
    to: toEmail,
    subject: "Restablecer contraseña",
    html,
    text: `Restablecer contraseña\n\nPulsa el siguiente enlace para actualizar tu contraseña:\n\n${resetLink}\n\nSi no solicitaste restablecer tu contraseña, puedes ignorar este correo.`
  });
}



export async function sendEmailChangedEmail(oldEmail, newEmail) {
  const transporter = await getTransporter();
  await transporter.sendMail({
    from: `${APP_NAME} <${EMAIL_FROM}>`,
    to: oldEmail,
    subject: 'Tu email ha sido actualizado',
    html: `
      <h2>Cambio de correo detectado</h2>
      <p>Tu dirección de correo ha sido modificada.</p>
      <p><strong>Nuevo correo:</strong> ${newEmail}</p>
      <p>Fecha: ${new Date().toLocaleString()}</p>
    `,
  });
}

export async function sendVerifyNewEmail(newEmail, token) {
  const transporter = await getTransporter();
  const url = `${IP_SERVER_HTTPS}/redirect/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `${APP_NAME} <${EMAIL_FROM}>`,
    to: newEmail,
    subject: 'Verifica tu nuevo correo',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
      </head>
      <body style="margin:0; padding:0; font-family: Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto;" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #ffffff; padding: 40px 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Verifica tu correo electrónico</h2>
                    <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                      Haz clic en el siguiente botón para confirmar tu correo:
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="border-radius: 6px; background-color: #4CAF50;">
                          <a href="${url}" 
                             style="display: inline-block; padding: 14px 28px; font-family: Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                            Verificar nuevo correo
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="color: #999999; font-size: 14px; line-height: 20px; margin: 30px 0 0 0;">
                      Si no solicitaste cambiar tu correo, puedes ignorar este mensaje.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
}

