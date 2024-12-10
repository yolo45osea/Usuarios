const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const jsonServer = require('json-server');
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

// Configurar el servidor Express para manejar el envío de correos
app.post('/send-email', async (req, res) => {
    try {
        const { to, subject, text } = req.body;

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

// Usar el servidor json-server en el puerto 10000
server.listen(10000, () => {
    console.log('Servidor json-server corriendo en http://localhost:10000');
});

// Usar el servidor Express para manejar otras rutas
app.listen(3000, () => {
    console.log('Servidor Express corriendo en http://localhost:3000');
});
