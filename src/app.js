import express from "express"
import {experimentoRouter, autenticacionRouter, usuarioRouter, configuracionesRouter, registroRouter, experimentoEnCursoRouter, muestraRouter, muestraFDRRouter} from "./routes/index.js";
import cors from "cors";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

const app = express();
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Swagger middleware
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/experimentos", experimentoRouter.getRouter());
app.use("/api/autenticacion", autenticacionRouter.getRouter());
app.use("/api/usuarios", usuarioRouter.getRouter());
app.use("/api/configuraciones", configuracionesRouter.getRouter());
app.use("/api/registros", registroRouter.getRouter());
app.use("/api/experimentoEnCurso", experimentoEnCursoRouter.getRouter());
app.use("/api/muestras", muestraRouter.getRouter());
app.use("/api/muestrasFDR", muestraFDRRouter.getRouter());

export default app;