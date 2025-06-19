import CustomRouter from "./custom.routes.js";
import RegistroService from "../services/registro.service.js";
import MuestraService from "../services/muestra.service.js";
import ExperimentoService from "../services/experimento.service.js";
import ConfiguracionService from "../services/configuracion.service.js";
import mongoose from "mongoose";

class RegistroRouter extends CustomRouter{

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
        *   name: Registros
        *   description: CRUD Registros
        */

        /**
         * @swagger
         * /api/registros/{registroId}:
         *   get:
         *     summary: Obtener un registro específico por ID
         *     tags: [Registros]
         *     parameters:
         *       - in: path
         *         name: registroId
         *         schema:
         *           type: string
         *         required: true
         *         description: ID del registro a obtener
         *     responses:
         *       200:
         *         description: Registro obtenido exitosamente
         *       400:
         *         description: ID inválido o ausente
         *       404:
         *         description: Registro no encontrado
         *       500:
         *         description: Error interno del servidor
         */

        // Obtener un registro específico
        this.get("/:registroId", ["CREATOR", "ADMIN", "MONITOR", "SISTEMA"], async(req, res) => {
            try{
                const { registroId } = req.params;
                if(!registroId){
                    const mensaje = this.errores.faltanParametros(["registroId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(registroId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje);
                }
                const registro = await RegistroService.getRegistroById(registroId);
                if(!registro){
                    const mensaje = this.errores.noEncontrado("Registro");
                    return res.sendNotFound(mensaje);
                }
                return res.sendSuccess(registro);
            }
            catch(error){
                const mensaje = this.errores.errorServidor("obtener un registro");
                return res.sendServerError(`${mensaje} Error: ${error}`);
            }
        })

        /**
         * @swagger
         * /api/registros/{registroId}:
         *   get:
         *     summary: Obtener el detalle un registro específico por ID
         *     tags: [Registros]
         *     parameters:
         *       - in: path
         *         name: registroId
         *         schema:
         *           type: string
         *         required: true
         *         description: ID del registro a obtener
         *     responses:
         *       200:
         *         description: Registro obtenido exitosamente
         *       400:
         *         description: ID inválido o ausente
         *       404:
         *         description: Registro no encontrado
         *       500:
         *         description: Error interno del servidor
         */

        // Obtener el detalle de un registro específico
        this.get("/:registroId/detalle", ["CREATOR", "ADMIN", "MONITOR"], async(req, res) => {
            try{
                const { registroId } = req.params;
                if(!registroId){
                    const mensaje = errores.faltanParametros(["registroId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!esIdValido(registroId)) {
                    const mensaje = errores.idInvalido();
                    return res.sendBadRequestError(mensaje);
                }
                const registro = await RegistroService.getRegistroDetalleById(registroId);
                if(!registro){
                    const mensaje = this.errores.noEncontrado("Registro");
                    return res.sendNotFound(mensaje);
                }
                return res.sendSuccess(registro);
            }
            catch(error){
                const mensaje = this.errores.errorServidor("obtener un registro");
                return res.sendServerError(`${mensaje} Error: ${error}`);
            }
        });

        /**
        * @swagger
        * /api/registros/{registroId}:
        *   put:
        *     summary: Actualizar un registro existente
        *     tags: [Registros]
        *     parameters:
        *       - in: path
        *         name: registroId
        *         schema:
        *           type: string
        *         required: true
        *         description: ID del registro a actualizar
        *     requestBody:
        *       required: true
        *       content:
        *         application/json:
        *           schema:
        *             type: object
        *             description: Datos actualizados del registro (el campo `id` no es editable)
        *             properties:
        *               nombre:
        *                 type: string
        *                 example: "Temperatura ambiente"
        *               tipo:
        *                 type: string
        *                 example: "sensor"
        *               unidad:
        *                 type: string
        *                 example: "°C"
        *               descripcion:
        *                 type: string
        *                 example: "Sensor ubicado en sala principal"
        *               activo:
        *                 type: boolean
        *                 example: true
        *     responses:
        *       200:
        *         description: Registro actualizado exitosamente
        *       400:
        *         description: Parámetros inválidos o ausentes
        *       404:
        *         description: Registro no encontrado
        *       500:
        *         description: Error interno del servidor
        */
        
        // Actualizar un registro específico
        this.put("/:registroId", ["CREATOR", "ADMIN", "MONITOR"], async (req, res) => {
            try {
                const { registroId } = req.params;
                if(!registroId){
                    const mensaje = this.errores.faltanParametros(["registroId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(registroId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje);
                }
                const registroData = req.body;
                if(!registroData){
                    const mensaje = this.errores.faltanParametros(["registroData"]);
                    return res.sendBadRequestError(mensaje);
                }
                const registro = await RegistroService.updateRegistroById(registroId, registroData);
                if(!registro){
                    const mensaje = this.errores.noEncontrado("Registro");
                    return res.sendNotFound(mensaje);
                }
                return res.sendSuccess(registro);
            } 
            catch (error) {
                const mensaje = this.errores.errorServidor("modificar un registro");
                return res.sendServerError(`${mensaje} Error: ${error}`);
            }
        });

        /**
         * @swagger
         * /api/registros/{registroId}:
         *   delete:
         *     summary: Eliminar un registro por ID
         *     tags: [Registros]
         *     parameters:
         *       - in: path
         *         name: registroId
         *         schema:
         *           type: string
         *         required: true
         *         description: ID del registro a eliminar
         *     responses:
         *       200:
         *         description: Registro eliminado exitosamente
         *       400:
         *         description: ID inválido o ausente
         *       404:
         *         description: Registro o experimento asociado no encontrado
         *       500:
         *         description: Error interno del servidor
         */

        // Eliminar un registro específico
        this.delete("/:registroId", ["CREATOR", "ADMIN", "MONITOR"], async (req, res) => {
            try {
                const { registroId } = req.params;
                if(!registroId){
                    const mensaje = this.errores.faltanParametros(["registroId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(registroId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje);
                }
                // Eliminar el registro
                const registro = await RegistroService.deleteRegistroById(registroId);
                if(!registro){
                    const mensaje = this.errores.noEncontrado("Registro");
                    return res.sendNotFound(mensaje);
                }
                // Eliminar las muestras asociadas al registro
                const muestrasRef = registro.muestras || [];
                for (const muestraRef of muestrasRef) {
                    await MuestraService.deleteMuestraById(muestraRef);
                }
                
                // Eliminar la configuracion
                if(registro.configuracion){
                    await ConfiguracionService.deleteConfiguracionById(registro.configuracion._id);
                }

                // Eliminar la referencia al registro en el experimento
                const experimento = await ExperimentoService.getExperimentoById(registro.experimentoId);
                if (!experimento) {
                    const mensaje = this.errores.noEncontrado("Registro");
                    return res.sendNotFound(mensaje);
                }
            
                const registros = experimento.registros.filter(reg => reg.registroId.toString() !== registroId);
                await ExperimentoService.updateExperimentoById(experimento._id, { registros });
            
                return res.sendSuccess(registro);
            } 
            catch (error) {
                const mensaje = this.errores.errorServidor("eliminar un registro");
                return res.sendServerError(`${mensaje} Error: ${error}`);
            }
        });
        
        /**
        * @swagger
        * /api/registros/{registroId}/muestras:
        *   post:
        *     summary: Crear una muestra y asociarla a un registro
        *     tags: [Muestras]
        *     parameters:
        *       - in: path
        *         name: registroId
        *         schema:
        *           type: string
        *         required: true
        *         description: ID del registro al que se agregará la muestra
        *     requestBody:
        *       required: true
        *       content:
        *         application/json:
        *           schema:
        *             type: object
        *             required: [muestraData]
        *             properties:
        *               valor:
        *                 type: number
        *                 description: Valor numérico de la muestra    
        *     responses:
        *       200:
        *         description: Muestra creada y registrada exitosamente
        *       400:
        *         description: Parámetros inválidos o ausentes
        *       404:
        *         description: Registro no encontrado
        *       500:
        *         description: Error interno del servidor
        */

        // Crear una muestra en un registro
        this.post("/:registroId/muestras", ["SISTEMA"], async (req, res) => {
            try {
                const { registroId } = req.params;
                if(!registroId){
                    const mensaje = this.errores.faltanParametros(["registroId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(registroId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje);
                }
                // Verificar que el registro existe antes de crear la muestra
                const registro = await RegistroService.getRegistroDetalleById(registroId);
                if (!registro) {
                    const mensaje = this.errores.noEncontrado("Registro");
                    return res.sendNotFound(mensaje);
                }

                // Compruebo el estado del experimento
                const experimento = await ExperimentoService.getExperimentoById(registro.experimentoId);
                if(!experimento){
                    const mensaje = this.errores.noEncontrado("Experimento");
                    return res.sendNotFound(mensaje);
                }

                if(experimento.estado !== "EN_CURSO"){
                    return res.sendBadRequestError("No puede asignar una muestra a un experimento que no está en curso");
                }

                const { valor } = req.body;
                if(!valor){
                    const mensaje = this.errores.faltanParametros(["valor"]);
                    return res.sendBadRequestError(mensaje);
                }


                // Crear la muestra
                const muestra = await MuestraService.createMuestra(registroId, valor);
            
                // Agregar la muestra al registro y actualizar
                registro.muestras.push(muestra._id);
                await RegistroService.updateRegistroById(registroId, {
                    muestras: registro.muestras
                });
            
                return res.sendSuccess(muestra);
            } 
            catch (error) {
                const mensaje = this.errores.errorServidor("registrar una muestra");
                return res.sendServerError(`${mensaje} Error: ${error}`);
            }
        });


        /**
        * @swagger
        * /api/registros/{registroId}/configuracion:
        *   post:
        *     summary: Crea o actualiza la configuración de un registro
        *     tags:
        *       - Configuración
        *     parameters:
        *       - in: path
        *         name: registroId
        *         required: true
        *         schema:
        *           type: string
        *         description: ID del registro al que se le asigna la configuración
        *     requestBody:
        *       required: true
        *       content:
        *         application/json:
        *           schema:
        *             type: object
        *             required:
        *               - valorMin
        *               - valorMax
        *             properties:
        *               valorMin:
        *                 type: number
        *                 description: Valor mínimo permitido
        *               valorMax:
        *                 type: number
        *                 description: Valor máximo permitido
        *     responses:
        *       200:
        *         description: Configuración creada o actualizada correctamente
        *       400:
        *         description: Error de validación (faltan parámetros o ID inválido)
        *       404:
        *         description: Registro no encontrado
        *       500:
        *         description: Error interno del servidor
        */

        // Crear configuración
        this.post("/:registroId/configuracion", ["SISTEMA"], async(req, res) => {
            try{
                const { registroId } = req.params;
                if(!registroId){
                    const mensaje = this.errores.faltanParametros(["registroId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(registroId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje);
                }

                // Verificar que el registro existe antes de crear la muestra
                const registro = await RegistroService.getRegistroById(registroId);
                if (!registro) {
                    const mensaje = this.errores.noEncontrado("Registro");
                    return res.sendNotFound(mensaje);
                }

                // Verificar que esten los valores minimos y maximos para el registro
                const { valorMin, valorMax } = req.body;
                const parametrosFaltantes = [];
                
                if (!valorMin) {
                    parametrosFaltantes.push("valorMin");
                }
                if (!valorMax) {
                    parametrosFaltantes.push("valorMax");
                }
                if(parametrosFaltantes.length > 0){
                    const mensaje = this.errores.faltanParametros(parametrosFaltantes);
                    return res.sendBadRequestError(mensaje);
                }
                
                if(!registro.configuracion){
                    const configuracion = await ConfiguracionService.createConfiguracion({registroId, valorMin, valorMax});
                    await RegistroService.updateRegistroById(registroId, {configuracion: configuracion._id});
                    return res.sendSuccess(configuracion);
                }
                else{
                    const configuracion = await ConfiguracionService.updateConfiguracionById(registro.configuracion._id, {valorMin, valorMax});
                    return res.sendSuccess(configuracion);
                }
            }
            catch(error){
                const mensaje = this.errores.errorServidor("setear la configuración del registro");
                return res.sendServerError(`${mensaje} Error: ${error}`);
            }
        });
    }
}

export default RegistroRouter;