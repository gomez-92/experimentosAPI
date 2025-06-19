import CustomRouter from "./custom.routes.js";
import ConfiguracionService from "../services/configuracion.service.js";
import mongoose from "mongoose";
import RegistroService from "../services/registro.service.js";

class ConfiguracionesRouter extends CustomRouter{
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
        * /api/configuraciones/{configuracionId}:
        *   get:
        *     summary: Obtener una configuración por ID
        *     tags:
        *       - Configuración
        *     parameters:
        *       - in: path
        *         name: configuracionId
        *         required: true
        *         schema:
        *           type: string
        *         description: ID de la configuración a obtener
        *     responses:
        *       200:
        *         description: Configuración encontrada
        *       400:
        *         description: ID inválido o faltante
        *       404:
        *         description: Configuración no encontrada
        *       500:
        *         description: Error interno del servidor
        */

        // Obtener configuración
        this.get("/:configuracionId", ["CREATOR", "ADMIN", "MONITOR", "SISTEMA"], async(req, res) => {
            try{
                const { configuracionId } = req.params;
                if(!configuracionId){
                    const mensaje = this.errores.faltanParametros(["configuracionId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(configuracionId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje);
                }
                const configuracion = await ConfiguracionService.getConfiguracionById(configuracionId);
                if(!configuracion){
                    const mensaje = this.errores.noEncontrado("Configuracion");
                    return res.sendNotFound(mensaje);
                }
                return res.sendSuccess(configuracion);
            }
            catch(error){
                const mensaje = this.errores.errorServidor("obtener la configuracion");
                return res.sendServerError(`${mensaje} Error: ${error}`);
            }
        });
        
        /**
        * @swagger
        * /api/configuraciones/{configuracionId}:
        *   put:
        *     summary: Actualiza una configuración existente
        *     tags:
        *       - Configuración
        *     parameters:
        *       - in: path
        *         name: configuracionId
        *         required: true
        *         schema:
        *           type: string
        *         description: ID de la configuración a actualizar
        *     requestBody:
        *       required: true
        *       content:
        *         application/json:
        *           schema:
        *             type: object
        *             description: Datos actualizados de la configuracion (el campo `id` no es editable)
        *             properties:
        *               valorMin:
        *                 type: Number
        *                 example: 100
        *               valorMax:
        *                 type: Number
        *                 example: 1000
        *     responses:
        *       200:
        *         description: Configuración actualizada correctamente
        *       400:
        *         description: ID o cuerpo inválido
        *       404:
        *         description: Configuración no encontrada
        *       500:
        *         description: Error interno del servidor
        */

        // Actualizar configuración
        this.put("/:configuracionId", ["SISTEMA"], async(req, res) => {
            try{
                const { configuracionId } = req.params;
                if(!configuracionId){
                    const mensaje = this.errores.faltanParametros(["configuracionId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(configuracionId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje);
                }

                const configuracionData = req.body;
                if(!configuracionData){
                    const mensaje = this.errores.faltanParametros(["configuracionData"]);
                    return res.sendBadRequestError(mensaje);
                }

                const configuracion = await ConfiguracionService.updateConfiguracionById(configuracionId, configuracionData);
                if(!configuracion){
                    const mensaje = this.errores.noEncontrado("Configuracion");
                    return res.sendNotFound(mensaje);
                }
                return res.sendSuccess(configuracion);
            }
            catch(error){
                const mensaje = this.errores.errorServidor("actualizar la configuracion");
                return res.sendServerError(`${mensaje} Error: ${error}`);
            }
        });
        
        /**
         * @swagger
         * /api/configuraciones/{configuracionId}:
         *   delete:
         *     summary: Elimina una configuración por ID
         *     tags:
         *       - Configuración
         *     parameters:
         *       - in: path
         *         name: configuracionId
         *         required: true
         *         schema:
         *           type: string
         *         description: ID de la configuración a eliminar
         *     responses:
         *       200:
         *         description: Configuración eliminada correctamente
         *       400:
         *         description: ID inválido
         *       404:
         *         description: Configuración no encontrada
         *       500:
         *         description: Error interno del servidor
         */

        // Eliminar configuración
        this.delete("/:configuracionId", ["CREATOR", "ADMIN"], async(req, res) => {
            try{
                const { configuracionId } = req.params;
                if(!configuracionId){
                    const mensaje = this.errores.faltanParametros(["configuracionId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(configuracionId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje);
                }
                const configuracion = await ConfiguracionService.deleteConfiguracionById(configuracionId);
                if(!configuracion){
                    const mensaje = this.errores.noEncontrado("Configuracion");
                    return res.sendNotFound(mensaje);
                }

                const registro = await RegistroService.getRegistroById(configuracion.registroId);
                if(registro){
                    await RegistroService.updateRegistroById(registro._id, { configuracion: null });
                }

                return res.sendSuccess(configuracion);
            }
            catch(error){
                const mensaje = this.errores.errorServidor("eliminar la configuracion");
                return res.sendServerError(`${mensaje} Error: ${error}`);
            }
        });
        
    }
}

export default ConfiguracionesRouter;