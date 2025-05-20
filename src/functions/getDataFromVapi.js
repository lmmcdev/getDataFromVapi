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

    const { title, description, user_email, user_phone, url_audio } = body;

    if (!user_email) {
      return {
        status: 400,
        body: 'Need to provide user email',
      };
    }

    const config = {
      connectionString: process.env["SQL_CONNECTION_STRING"]
    };

    try {
      const now = new Date();
      await sql.connect(config.connectionString);
      await sql.query`INSERT INTO tickets (title, description, status, created_at, user_email, user_phone, ticket_source, url_audio) 
                      VALUES (${title}, ${description}, "New", ${now}, ${user_email}, ${user_phone}, "Voice", ${url_audio})`;
      return {
        status: 200,
        body: 'New ticket created',
      };
    } catch (error) {
      console.log('There is an error in SQL:', error);
      return {
        status: 500,
        body: `Error inserting data in SQL: ${error}`,
      };
    }
  },
});
