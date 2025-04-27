import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import routerUsers from './routers/routerUsers.js';
import routerViajes from './routers/routerViajes.js';

const app = express();
const port = process.env.PORT || 4006;

// Middlewares
app.use(cors());
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TravelTales API',
      version: '1.0.0',
      description: 'API documentation for TravelTales'
    }
  },
  apis: ['./routers/*.js']
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/viajes', routerViajes);
app.use('/users', routerUsers);

// Start server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
