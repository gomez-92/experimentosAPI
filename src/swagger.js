// swagger.js
import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Proyecto Final',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    // Esto indica que, por defecto, todas las rutas usan esta seguridad (opcional)
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/**/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;