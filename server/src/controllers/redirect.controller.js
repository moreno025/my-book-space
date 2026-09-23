// Redirect controller for deep link email compatibility
// Email clients don't recognize custom schemes like mybookspace://
// This endpoint redirects HTTPS links to the app's deep link scheme

// Strict RFC 3986 encoding: the token is interpolated into HTML attributes and
// inline JS strings, so characters encodeURIComponent leaves as-is (like ') are encoded too
const encodeToken = (token) =>
  encodeURIComponent(String(token)).replace(
    /[!'()*~]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );

export const redirectToResetPassword = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Token Inválido</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          h1 { color: #d32f2f; }
        </style>
      </head>
      <body>
        <h1>Token Inválido</h1>
        <p>El enlace de restablecimiento de contraseña no es válido.</p>
      </body>
      </html>
    `);
  }

  const safeToken = encodeToken(token);

  // Production deep link (for standalone app builds)
  const productionDeepLink = `mybookspace://reset-password?token=${safeToken}`;

  // Development deep link (for Expo Go), only outside production
  // EXPO_DEV_URL format: exp://YOUR_IP:8081
  const isDevelopment = process.env.NODE_ENV !== "production";
  const expoDevUrl = process.env.EXPO_DEV_URL;
  const devDeepLink = isDevelopment && expoDevUrl
    ? `${expoDevUrl}/--/reset-password?token=${safeToken}`
    : null;

  // HTML with both options
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Abriendo la aplicación...</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 50px;
          background-color: #f4f4f4;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 8px;
          max-width: 500px;
          margin: 0 auto;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #666; line-height: 1.6; margin: 10px 0; }
        .button {
          display: inline-block;
          padding: 14px 28px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin: 10px;
          font-weight: bold;
        }
        .button-dev {
          background-color: #4CAF50;
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .hidden { display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="spinner" id="spinner"></div>
        <h1>Abriendo la aplicación...</h1>
        <p>Si la aplicación no se abre automáticamente, pulsa uno de los botones:</p>
        
        <div id="buttons">
          ${devDeepLink ? `<a href="${devDeepLink}" class="button button-dev">Abrir en Expo Go (Dev)</a>` : ""}
          <a href="${productionDeepLink}" class="button">Abrir App</a>
        </div>
        
        <p style="margin-top: 30px; font-size: 14px; color: #999;">
          Si no tienes la aplicación instalada, descárgala desde tu tienda de aplicaciones.
        </p>
      </div>
      <script>
        ${devDeepLink ? `
        // Try development link first (Expo Go)
        setTimeout(function() {
          window.location.href = '${devDeepLink}';
        }, 100);
        ` : ""}
        // Production link (fallback after 1 second when the dev link is tried first)
        setTimeout(function() {
          window.location.href = '${productionDeepLink}';
        }, ${devDeepLink ? 1000 : 100});
        
        // Hide spinner after 2 seconds
        setTimeout(function() {
          document.getElementById('spinner').style.display = 'none';
        }, 2000);
      </script>
    </body>
    </html>
  `;

  res.send(html);
};

export const redirectToVerifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Token Inválido</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          h1 { color: #d32f2f; }
        </style>
      </head>
      <body>
        <h1>Token Inválido</h1>
        <p>El enlace de verificación no es válido.</p>
      </body>
      </html>
    `);
  }

  const deepLink = `mybookspace://verify-new-email?token=${encodeToken(token)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="refresh" content="0;url=${deepLink}">
      <title>Abriendo la aplicación...</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 50px;
          background-color: #f4f4f4;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 8px;
          max-width: 500px;
          margin: 0 auto;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { color: #333; margin-bottom: 20px; }
        p { color: #666; line-height: 1.6; }
        .button {
          display: inline-block;
          padding: 14px 28px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          margin-top: 20px;
          font-weight: bold;
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4CAF50;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="spinner"></div>
        <h1>Abriendo la aplicación...</h1>
        <p>Si la aplicación no se abre automáticamente, pulsa el botón de abajo:</p>
        <a href="${deepLink}" class="button">Abrir aplicación</a>
        <p style="margin-top: 30px; font-size: 14px; color: #999;">
          Si no tienes la aplicación instalada, descárgala desde tu tienda de aplicaciones.
        </p>
      </div>
      <script>
        window.location.href = '${deepLink}';
        setTimeout(function() {
          document.querySelector('.spinner').style.display = 'none';
        }, 2000);
      </script>
    </body>
    </html>
  `;

  res.send(html);
};
