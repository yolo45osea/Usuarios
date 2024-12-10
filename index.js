const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
const app = express();

// Configurar CORS para permitir todo
app.use(cors());
app.use(express.json());

// Crear servidor json-server
const server = jsonServer.create();
const router = jsonServer.router('usuarios.json');
const middlewares = jsonServer.defaults();
server.use(middlewares);
server.use(router);

const JWT_SECRET = 'your-secret-key';
const JWT_EXPIRATION = '1h';

// Configurar el servidor Express para manejar el envío de correos
app.post('/forgot-password', async (req, res) => {
    try {
        const { to, subject, text, userId } = req.body;

        const token = jwt.sign({ userId: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
        const resetLink = `http://localhost:3000/reset-password?token=${token}`;

        text = `Haz clic en este enlace para restablecer tu contraseña: ${resetLink}`;

        let transporter = nodemailer.createTransport({
          host: "smtp.office365.com",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: "benj.romeroc@duocuc.cl",
            pass: "Josebenj@1979"
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        const mailOptions = {
            from: 'benj.romeroc@duocuc.cl',
            to,
            subject,
            text
        };

        const info = await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Correo enviado', info });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

const bcrypt = require('bcryptjs');

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Obtener usuarios desde la nube
    const { data: users } = await axios.get(USERS_URL);

    // Buscar al usuario por ID
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[userIndex].password = hashedPassword;

    // Enviar los datos actualizados a la nube (suponiendo que la API permite POST/PUT)
    await axios.put(USERS_URL, users); // Asegúrate de que tu endpoint soporte PUT

    res.status(200).json({ message: 'Contraseña actualizada con éxito' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Token inválido o expirado' });
  }
});


// Usar el servidor json-server en el puerto 10000
server.listen(10000, () => {
    console.log('Servidor json-server corriendo en http://localhost:10000');
});

// Usar el servidor Express para manejar otras rutas
app.listen(3000, () => {
    console.log('Servidor Express corriendo en http://localhost:3000');
});
