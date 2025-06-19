import CustomRouter from "./custom.routes.js";
import MuestraFDRService from "../services/muestraFDR.service.js";
import ExperimentoService from "../services/experimento.service.js";
import mongoose from "mongoose";

class MuestraFDRRouter extends  CustomRouter{

    esIdValido = (id) => {
        return mongoose.Types.ObjectId.isValid(id);
    }
            
    errores = {
        faltanParametros: (campos = []) => `Faltan parámetros obligatorios: ${campos.join(", ")}.`,
        idInvalido: "Formato de ID inválido.",
        noEncontrado: (entidad = "Elemento") => `${entidad} no encontrado.`,
        noAutorizado: (accion = "realizar esta acción") => `No tiene autorización para ${accion}.`,
        errorServidor: (accion = "procesar la solicitud") => `Se produjo un error al ${accion}.`
    }
    
    init(){
        /**
        * @swagger
        * tags:
        *   name: MuestraFDR
        *   description: CRUD MuestraFDR
        */

        /**
        * @swagger
        * /api/muestrasFDR/{muestraFDRId}:
        *   delete:
        *     summary: Elimina una muestra FDR.
        *     description: Elimina una muestra FDR por su ID. Si existe una referencia a esta muestra en un experimento, también se elimina del listado de muestras FDR del experimento.
        *     tags:
        *       - Muestra FDR
        *     parameters:
        *       - in: path
        *         name: muestraFDRId
        *         required: true
        *         description: ID de la muestra FDR a eliminar.
        *         schema:
        *           type: string
        *     responses:
        *       200:
        *         description: Muestra FDR eliminada correctamente.
        *         content:
        *           application/json:
        *             schema:
        *               type: object
        *               description: Objeto de la muestra eliminada.
        *       400:
        *         description: Parámetro inválido o error en la eliminación.
        *         content:
        *           application/json:
        *             schema:
        *               type: object
        *               properties:
        *                 message:
        *                   type: string
        *       404:
        *         description: Muestra FDR no encontrada.
        *         content:
        *           application/json:
        *             schema:
        *               type: object
        *               properties:
        *                 message:
        *                   type: string
        */

        this.delete("/:muestraFDRId", ["CREATOR", "ADMIN"], async (req, res) => {
            try {
                const { muestraFDRId } = req.params;
                
                if(!muestraFDRId){
                    const mensaje = this.errores.faltanParametros(["muestraFDRId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(muestraFDRId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje);
                }
                const muestraFDR = await MuestraFDRService.getMuestraFDRById(muestraFDRId);

                if (!muestraFDR) {
                    const mensaje = this.errores.noEncontrado("MuestraFDR")
                    return res.sendNotFound(mensaje);
                }
                
                const experimento = await ExperimentoService.getExperimentoById(muestraFDR.experimentoId);

                if (experimento) {
                    const muestrasFDR = experimento.muestrasFDR.filter(id => id.toString() === muestraFDRId);
                    await ExperimentoService.updateExperimentoById(experimento._id, { muestrasFDR });
                }

                const muestraFDREliminada = await MuestraFDRService.deleteMuestraFDRById(muestraFDR._id);

                if (!muestraFDREliminada) {
                    const mensaje = this.errores.noEncontrado("MuestraFDR")
                    return res.sendNotFound(mensaje);
                }

                return res.sendSuccess(muestraFDREliminada);
            } 
            catch (error) {
                const mensaje = this.errores.errorServidor("eliminar muestraFDR");
                return res.sendServerError(`${mensaje} Error: ${error}.`);
            }
        });
    }
}

export default MuestraFDRRouter;