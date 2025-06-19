import AutenticacionRouter from "./autenticacion.routes.js";
import UsuarioRouter from "./usuario.routes.js";
import ExperimentoRouter from "./experimento.routes.js";
import RegistroRouter from "./registro.router.js";
import ConfiguracionesRouter from "./configuraciones.router.js";
import MuestraRouter from "./muestra.routes.js";
import ExperimentoEnCursoRouter from "./experimentoEnCurso.routes.js";
import MuestraFDRRouter from "./muestraFDR.routes.js";

export const autenticacionRouter = new AutenticacionRouter();
export const usuarioRouter = new UsuarioRouter();
export const experimentoRouter = new ExperimentoRouter();
export const registroRouter = new RegistroRouter();
export const configuracionesRouter = new ConfiguracionesRouter();
export const muestraRouter = new MuestraRouter();
export const experimentoEnCursoRouter = new ExperimentoEnCursoRouter();
export const muestraFDRRouter = new MuestraFDRRouter();