import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
        title: 'Gbese API',
        description: 'API Documentation for Gbese 🚀',
        version: '1.0.0',
    },
    servers: [
      {
        url: 'https://gbese.onrender.com',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], 
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
