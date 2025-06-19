import CustomRouter from "./custom.routes.js";
import ExperimentoEnCursoService from "../services/experimentoEnCurso.service.js";

class ExperimentoEnCursoRouter extends  CustomRouter{

    errores = {
        noEncontrado: (entidad = "Elemento") => `${entidad} no encontrado.`,
        errorServidor: (accion = "procesar la solicitud") => `Se produjo un error al ${accion}.`
    }

    init(){
        /**
        * @swagger
        * /api/experimentoEnCurso:
        *   get:
        *     summary: Obtener el experimento que está en curso actualmente
        *     tags: [Experimentos]
        *     security:
        *       - bearerAuth: []
        *     responses:
        *       200:
        *         description: Experimento en curso encontrado exitosamente
        *         content:
        *           application/json:
        *             schema:
        *               type: object
        *               properties:
        *                 status:
        *                   type: string
        *                   example: "success"
        *                 payload:
        *                   type: object
        *                   description: Datos del experimento en curso
        *       404:
        *         description: No hay un experimento en curso
        *       500:
        *         description: Error del servidor al buscar el experimento en curso
        */

        this.get("/", ["CREATOR", "ADMIN", "MONITOR", "SISTEMA"], async (req, res) => {
            try {
                const enCurso = await ExperimentoEnCursoService.getExperimentoEnCurso();
                if (!enCurso){
                    const mensaje = this.errores.noEncontrado("Experimento en curso");
                    return res.sendNotFound(mensaje);
                } 
                return res.sendSuccess(enCurso);
            } 
            catch (error) {
                const mensaje = this.errores.errorServidor("obtener experimento en curso");
                return res.sendServerError(`${mensaje} Error: ${mensaje}`);
            }
        });
    }   
}

export default ExperimentoEnCursoRouter;