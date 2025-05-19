const { app } = require('@azure/functions');
const sql = require('mssql');

app.http('getDataFromVapi', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    console.log(`HTTP request for URL "${request.url}"`);

    let body;
    try {
      body = await request.json();
    } catch (err) {
      return {
        status: 400,
        body: 'Invalid JSON',
      };
    }

    const { nombre, correo } = body;

    if (!nombre || !correo) {
      return {
        status: 400,
        body: 'Faltan parámetros requeridos: nombre y correo',
      };
    }

    const config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_SERVER,
      database: process.env.DB_NAME,
      options: {
        encrypt: true, // requerido por Azure
        trustServerCertificate: false,
      },
    };

    try {
      await sql.connect(config);
      await sql.query`INSERT INTO agents (name, email) VALUES (${nombre}, ${correo})`;
      return {
        status: 200,
        body: 'Datos insertados correctamente',
      };
    } catch (error) {
      console.log('Error al insertar en SQL:', error);
      return {
        status: 500,
        body: `Error al insertar datos en la base de datos ${error}`,
      };
    }
  },
});
