import CustomRouter from "./custom.routes.js";
import MuestraService from "../services/muestra.service.js";
import RegistroService from "../services/registro.service.js";
import mongoose from "mongoose";

class MuestraRouter extends CustomRouter {
    
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

    init() {

        /**
         * @swagger
         * /api/muestras/{muestraId}:
         *   get:
         *     summary: Obtener una muestra por su ID
         *     tags: [Muestras]
         *     parameters:
         *       - in: path
         *         name: muestraId
         *         required: true
         *         schema:
         *           type: string
         *         description: ID de la muestra
         *     responses:
         *       200:
         *         description: Muestra encontrada
         *       400:
         *         description: ID inválido
         *       404:
         *         description: Muestra no encontrada
         */
        this.get("/:muestraId", ["CREATOR", "ADMIN", "MONITOR"], async (req, res) => {
            try {
                const { muestraId } = req.params;
                if(!muestraId){
                    const mensaje = this.errores.faltanParametros(["muestraId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(muestraId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje);
                }
                const muestra = await MuestraService.getMuestraById(muestraId);
                if (!muestra) {
                    const mensaje = this.errores.noEncontrado("Muestra")
                    return res.sendNotFound(mensaje);
                }
                return res.sendSuccess(muestra);
            } 
            catch (error) {
                const mensaje = this.errores.errorServidor("obtener muestra");
                return res.sendServerError(`${mensaje} Error: ${error}`);
            }
        });

        /**
         * @swagger
         * /api/muestras/{muestraId}:
         *   put:
         *     summary: Actualizar una muestra por su ID
         *     tags: [Muestras]
         *     parameters:
         *       - in: path
         *         name: muestraId
         *         required: true
         *         schema:
         *           type: string
         *         description: ID de la muestra
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               valor:
         *                 type: number
         *     responses:
         *       200:
         *         description: Muestra actualizada
         *       400:
         *         description: Datos inválidos
         *       404:
         *         description: Muestra no encontrada
         */
        this.put("/:muestraId", ["CREATOR", "ADMIN", "MONITOR"], async (req, res) => {
            try {
                const { muestraId } = req.params;
                if(!muestraId){
                    const mensaje = this.errores.faltanParametros(["muestraId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(muestraId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje);
                }
                const muestraData = req.body;
                if (!muestraData || typeof muestraData !== "object") {
                    const mensaje = this.errores.faltanParametros(["muestraData"]);
                    return res.sendBadRequestError(mensaje);
                }
                const muestra = await MuestraService.updateMuestraById(muestraId, muestraData);
                if (!muestra) {
                    const mensaje = this.errores.noEncontrado("Muestra")
                    return res.sendNotFound(mensaje);
                }
                return res.sendSuccess(muestra);
            } 
            catch (error) {
                const mensaje = this.errores.errorServidor("actualizar una muestra");
                return res.sendServerError(`${mensaje} Error: ${error}`);
            }
        });

        /**
         * @swagger
         * /api/muestras/{muestraId}:
         *   delete:
         *     summary: Eliminar una muestra por su ID
         *     tags: [Muestras]
         *     parameters:
         *       - in: path
         *         name: muestraId
         *         required: true
         *         schema:
         *           type: string
         *         description: ID de la muestra
         *     responses:
         *       200:
         *         description: Muestra eliminada
         *       400:
         *         description: ID inválido
         *       404:
         *         description: Muestra o registro no encontrado
         */
        this.delete("/:muestraId", ["CREATOR", "ADMIN", "MONITOR"], async (req, res) => {
            try {
                const { muestraId } = req.params;
                if(!muestraId){
                    const mensaje = this.errores.faltanParametros(["muestraId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(muestraId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje);
                }
                const muestra = await MuestraService.deleteMuestraById(muestraId);
                if(!muestra){
                    const mensaje = this.errores.noEncontrado("Muestra");
                    return res.sendNotFound(mensaje);
                }
                const registro = await RegistroService.getRegistroById(muestra.registroId);
                if (!registro) {
                    const mensaje = this.errores.noEncontrado("Registro");
                    return res.sendNotFound(mensaje);
                }
                // Eliminar referencia de la muestra en el registro
                const nuevasMuestras = registro.muestras.filter(
                    id => id.toString() !== muestraId
                );

                await RegistroService.updateRegistroById(registro._id, {
                    muestras: nuevasMuestras
                });

                return res.sendSuccess(muestra);
            } 
            catch (error) {
                const mensaje = this.errores.errorServidor("eliminar muestra");
                return res.sendServerError(`${mensaje} Error: ${error}`);
            }
        });
    }
}

export default MuestraRouter;