import CustomRouter from "./custom.routes.js";
import ExperimentoService from "../services/experimento.service.js";
import ExperimentoEnCursoService from "../services/experimentoEnCurso.service.js";
import RegistroService from "../services/registro.service.js";
import MuestraService from "../services/muestra.service.js";
import MuestraFDRService from "../services/muestraFDR.service.js"
import mongoose from "mongoose";

class ExperimentoRouter extends  CustomRouter{
    
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
        *   name: Experimentos
        *   description: CRUD Experimentos
        */

        /**
         * @swagger
         * /api/experimentos/create:
         *   post:
         *     summary: Crea un experimento
         *     tags: [Experimentos]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - nombre
         *               - duracion
         *             properties:
         *               nombre:
         *                 type: string
         *               duracion:
         *                 type: number
         *     responses:
         *       200:
         *         description: Experimento creado exitosamente
         *       400:
         *         description: Parámetros inválidos
         *       500:
         *         description: Error del servidor
         */

        // Crear experimento
        this.post("/create", ["SISTEMA"], async (req, res) => {
            try {
                const { nombre, duracion } = req.body || {};

                // Validación de parámetros
                const camposFaltantes = [];
                if(typeof nombre !== "string" || nombre.trim() === ""){
                    camposFaltantes.push("nombre");
                }
                if(typeof duracion !== "number" || duracion <= 0){
                    camposFaltantes.push("duracion");
                }

                if(camposFaltantes.length > 0){
                    const mensaje = this.errores.faltanParametros(camposFaltantes);
                    return res.sendBadRequestError(mensaje);
                }

                const nuevoExperimento = await ExperimentoService.createExperimento(nombre, duracion);
                return res.sendSuccess(nuevoExperimento);
            } 
            catch (error) {
                const mensaje = this.errores.errorServidor("crear un nuevo experimento");
                return res.sendServerError(`${mensaje} Error: ${error}.`);
            }
        });

        /**
        * @swagger
        * /api/experimentos:
        *   get:
        *     summary: Obtiene todos los experimentos
        *     tags: [Experimentos]
        *     security:
        *       - bearerAuth: []
        *     responses:
        *       200:
        *         description: Lista de experimentos
        *       500:
        *         description: Error del servidor
        */

        // Listar experimentos
        this.get("/", ["CREATOR", "ADMIN", "MONITOR"], async (req, res) => {
            try {
                const experimentos = await ExperimentoService.getExperimentos();
                return res.sendSuccess(experimentos || []);
            } 
            catch (error) {
                const mensaje = errores.errorServidor("listar experimentos");
                return res.sendServerError(`${mensaje} Error: ${error}.`);
            }
        });

        /**
        * @swagger
        * /api/experimentos/{id}:
        *   get:
        *     summary: Obtiene un experimento por ID
        *     tags: [Experimentos]
        *     security:
        *       - bearerAuth: []
        *     parameters:
        *       - in: path
        *         name: id
        *         required: true
        *         schema:
        *           type: string
        *         description: ID del experimento
        *     responses:
        *       200:
        *         description: Datos del experimento
        *       404:
        *         description: Experimento no encontrado
        *       500:
        *         description: Error del servidor
        */

        // Obtener un experimento
        this.get("/:experimentoId", ["CREATOR", "ADMIN", "MONITOR"], async (req, res) => {
            try {
                const { experimentoId } = req.params;
                if(!experimentoId){
                    const mensaje = this.errores.faltanParametros(["experimentoId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(experimentoId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje);
                }
                const experimento = await ExperimentoService.getExperimentoById(experimentoId);
                if (!experimento) {
                    const mensaje = this.errores.noEncontrado("Experimento");
                    return res.sendNotFound(mensaje);
                }                
                return res.sendSuccess(experimento);
            } 
            catch (error) {
                const mensaje = this.errores.errorServidor("obtener un experimento");
                return res.sendServerError(`${mensaje} Error: ${error}.`);
            }
        });
        
        /**
         * @swagger
         * /api/experimentos/{id}:
         *   put:
         *     summary: Actualiza un experimento existente
         *     tags: [Experimentos]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *         description: ID del experimento
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - nombre
         *               - duracion
         *             properties:
         *               nombre:
         *                 type: string
         *               duracion:
         *                 type: number
         *     responses:
         *       200:
         *         description: Experimento actualizado correctamente
         *       400:
         *         description: Parámetros inválidos
         *       404:
         *         description: Experimento no encontrado
         *       500:
         *         description: Error del servidor
         */

        // Actualizar un experimento
        this.put("/:experimentoId", ["CREATOR", "ADMIN"], async (req, res) => {
            try {
                const { experimentoId } = req.params;
                if(!experimentoId){
                    const mensaje = this.errores.faltanParametros(["experimentoId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(experimentoId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje);
                }

                const experimentoData = req.body || null;

                // Validar cuerpo
                if (!experimentoData || typeof experimentoData !== "object") {
                    const mensaje = this.errores.faltanParametros("experimentoId");
                    return res.sendBadRequestError(mensaje);
                }

                const experimentoActualizado = await ExperimentoService.updateExperimentoById(experimentoId, experimentoData);

                if (!experimentoActualizado) {
                    const mensaje = this.errores.noEncontrado("Experimento");
                    return res.sendNotFound(mensaje);
                }

                return res.sendSuccess(experimentoActualizado);
            } 
            catch (error) {
                const mensaje = this.errores.errorServidor("actualizar un experimento");
                return res.sendServerError(`${mensaje} Error: ${error}.`);
            }
        });
        
        /**
        * @swagger
        * /api/experimentos/{id}:
        *   delete:
        *     summary: Elimina un experimento por ID
        *     tags: [Experimentos]
        *     security:
        *       - bearerAuth: []
        *     parameters:
        *       - in: path
        *         name: id
        *         required: true
        *         schema:
        *           type: string
        *         description: ID del experimento
        *     responses:
        *       200:
        *         description: Experimento eliminado exitosamente
        *       404:
        *         description: Experimento no encontrado
        *       500:
        *         description: Error del servidor
        */
        
        // Eliminar un experimento
        this.delete("/:experimentoId", ["CREATOR", "ADMIN"], async (req, res) => {
            try {
                const { experimentoId } = req.params;
                if(!experimentoId){
                    const mensaje = this.errores.faltanParametros(["experimentoId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(experimentoId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje);
                }
            
                // Eliminar el experimento
                const experimentoEliminado = await ExperimentoService.deleteExperimentoById(experimentoId);
            
                if (!experimentoEliminado) {
                    const mensaje = this.errores.noEncontrado("Experimento");
                    return res.sendNotFound(mensaje);
                }
            
                const registrosRef = experimentoEliminado.registros || [];
            
                // Eliminar registros y sus muestras
                for (const registroRef of registrosRef) {
                    const registro = await RegistroService.getRegistroById(registroRef);
                    if (registro && registro.muestras) {
                        for (const muestraRef of registro.muestras) {
                            await MuestraService.deleteMuestraById(muestraRef);
                        }
                    }
                    await RegistroService.deleteRegistroById(registroRef);
                }
            
                return res.sendSuccess(experimentoEliminado);
            } catch (error) {
                const mensaje = this.errores.errorServidor("eliminar experimento");
                return res.sendServerError(`${mensaje} Error: ${error}.`);
            }
        });

        /**
        * @swagger
        * /api/experimentos/{experimentoId}/iniciar:
        *   post:
        *     summary: Inicia un experimento
        *     tags: [Experimentos]
        *     security:
        *       - bearerAuth: []
        *     parameters:
        *       - in: path
        *         name: experimentoId
        *         required: true
        *         schema:
        *           type: string
        *         description: ID del experimento a iniciar
        *     responses:
        *       200:
        *         description: Experimento iniciado exitosamente
        *       400:
        *         description: Parámetro experimentoId inválido
        *       404:
        *         description: Experimento no encontrado
        *       500:
        *         description: Error del servidor
        */

        // Iniciar un experimento
        this.post("/:experimentoId/iniciar", ["SISTEMA"], async(req, res) => {
            try {
                const { experimentoId } = req.params;
                if(!experimentoId){
                    const mensaje = this.errores.faltanParametros(["experimentoId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(experimentoId)) {
                    const mensaje = this.errores.idInvalido();
                    return res.sendBadRequestError(mensaje);
                }

                const experimento = await ExperimentoService.getExperimentoById(experimentoId);
                if(!experimento){
                    const mensaje = this.errores.noEncontrado("Experimento");
                    return res.sendNotFound(mensaje);
                }

                if(experimento.estado !== "CREADO"){
                    return res.sendBadRequestError("No se puede iniciar un experimento ya iniciado, finalizado o abortado.");
                }
                
                const experimentoIniciado = await ExperimentoService.updateExperimentoById(experimentoId, {
                    inicio: new Date(),
                    estado: "EN_CURSO"
                });

                if(!experimentoIniciado){
                    const mensaje = this.errores.noEncontrado("Experimento");
                    return res.sendNotFound(mensaje);
                }

                const enCurso = await ExperimentoEnCursoService.setExperimentoEnCurso(experimentoIniciado._id);

                return res.sendSuccess(experimentoIniciado);
            }
            catch(error){
                const mensaje = this.errores.errorServidor("iniciar experimento");
                return res.sendServerError(`${mensaje} Error: ${error}.`);
            }
        });

        /**
        * @swagger
        * /api/experimentos/{experimentoId}/finalizar:
        *   post:
        *     summary: Finaliza un experimento
        *     tags: [Experimentos]
        *     security:
        *       - bearerAuth: []
        *     parameters:
        *       - in: path
        *         name: experimentoId
        *         required: true
        *         schema:
        *           type: string
        *         description: ID del experimento a finalizar
        *     responses:
        *       200:
        *         description: Experimento finalizado exitosamente
        *       400:
        *         description: Parámetro experimentoId inválido
        *       404:
        *         description: Experimento no encontrado
        *       500:
        *         description: Error del servidor
        */

        // Finalizar un experimento
        this.post("/:experimentoId/finalizar", ["SISTEMA"], async(req, res) => {
            try {
                const { experimentoId } = req.params;
                if(!experimentoId){
                    const mensaje = this.errores.faltanParametros(["experimentoId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(experimentoId)) {
                    const mensaje = errores.idInvalido();
                    return res.sendBadRequestError(mensaje);
                }

                const experimento = await ExperimentoService.getExperimentoById(experimentoId);
                if(!experimento){
                    const mensaje = this.errores.noEncontrado("Experimento");
                    return res.sendNotFound(mensaje);
                }

                if(experimento.estado !== "EN_CURSO"){
                    return res.sendBadRequestError("No se puede finalizar el experimento porque éste no se encuentra en curso actualmente");
                }

                const experimentoFinalizado = await ExperimentoService.updateExperimentoById(experimentoId, {
                    fin: new Date(),
                    estado: "FINALIZADO"
                });

                if(!experimentoFinalizado){
                    const mensaje = this.errores.noEncontrado("Experimento");
                    return res.sendNotFound(mensaje);
                }
                
                const enCurso = await ExperimentoEnCursoService.getExperimentoEnCurso();
                if(enCurso && enCurso.experimentoId && enCurso.experimentoId == experimentoFinalizado.experimentoId){
                    await ExperimentoEnCursoService.deleteExperimentoEnCurso();
                }

                return res.sendSuccess(experimentoFinalizado);
            }
            catch(error){
                const mensaje = this.errores.errorServidor("finalizar experimento");
                return res.sendServerError(`${mensaje} Error: ${error}.`);
            }
        });

        /**
        * @swagger
        * /api/experimentos/{experimentoId}/abortar:
        *   post:
        *     summary: Aborta un experimento
        *     tags: [Experimentos]
        *     security:
        *       - bearerAuth: []
        *     parameters:
        *       - in: path
        *         name: experimentoId
        *         required: true
        *         schema:
        *           type: string
        *         description: ID del experimento a abortar
        *     responses:
        *       200:
        *         description: Experimento abortado exitosamente
        *       400:
        *         description: Parámetro experimentoId inválido
        *       404:
        *         description: Experimento no encontrado
        *       500:
        *         description: Error del servidor
        */

        // Abortar un experimento
        this.post("/:experimentoId/abortar", ["SISTEMA"], async(req, res) => {
            try {
                const { experimentoId } = req.params;
                if(!experimentoId){
                    const mensaje = this.errores.faltanParametros(["experimentoId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(experimentoId)) {
                    const mensaje = this.errores.idInvalido();
                    return res.sendBadRequestError(mensaje);
                }

                const experimento = await ExperimentoService.getExperimentoById(experimentoId);
                if(!experimento){
                    const mensaje = this.errores.noEncontrado("Experimento");
                    return res.sendNotFound(mensaje);
                }

                if(experimento.estado !== "EN_CURSO"){
                    return res.sendBadRequestError("No se puede abortar el experimento porque éste no se encuentra en curso actualmente");
                }

                const experimentoFinalizado = await ExperimentoService.updateExperimentoById(experimentoId, {
                    fin: new Date(),
                    estado: "ABORTADO"
                });

                if(!experimentoFinalizado){
                    const mensaje = this.errores.noEncontrado("Experimento");
                    return res.sendNotFound(mensaje);
                }
                                
                const enCurso = await ExperimentoEnCursoService.getExperimentoEnCurso();
                if(enCurso && enCurso.experimentoId && enCurso.experimentoId == experimentoFinalizado.experimentoId){
                    await ExperimentoEnCursoService.deleteExperimentoEnCurso();
                }

                return res.sendSuccess(experimentoFinalizado);
            }
            catch(error){
                const mensaje = this.errores.errorServidor("finalizar experimento");
                return res.sendServerError(`${mensaje} Error: ${error}.`);
            }
        });
        
        /**
        * @swagger
        * /api/experimentos/{experimentoId}/registros:
        *   post:
        *     summary: Crear un nuevo registro dentro de un experimento
        *     tags: [Registros]
        *     security:
        *       - bearerAuth: []
        *     parameters:
        *       - in: path
        *         name: experimentoId
        *         required: true
        *         schema:
        *           type: string
        *         description: ID del experimento
        *     requestBody:
        *       required: true
        *       content:
        *         application/json:
        *           schema:
        *             type: object
        *             properties:
        *               nombre:
        *                 type: string
        *                 example: Temperatura
        *               tipo:
        *                 type: string
        *                 example: Numérico
        *               unidad:
        *                 type: string
        *                 example: °C
        *             required:
        *               - nombre
        *               - tipo
        *               - unidad
        *     responses:
        *       200:
        *         description: Registro creado exitosamente
        *         content:
        *           application/json:
        *             schema:
        *               $ref: '#/components/schemas/Registro'
        *       400:
        *         description: Datos inválidos o experimentoId incorrecto
        *       404:
        *         description: El experimento no existe
        *       500:
        *         description: Error interno del servidor al crear el registro
        */

        // Crear un nuevo registro en un experimento
        this.post("/:experimentoId/registros", ["SISTEMA"], async (req, res) => {
            try {
                // Validar que experimentoId esté presente y sea un ObjectId válido
                const { experimentoId } = req.params;
                if(!experimentoId){
                    const mensaje = this.errores.faltanParametros(["experimentoId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(experimentoId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje);
                }

                // Verificar si el experimento existe
                const experimento = await ExperimentoService.getExperimentoById(experimentoId);
                if(!experimento){
                    const mensaje = this.errores.noEncontrado("Experimento");
                    return res.sendNotFound(mensaje);
                }

                if(experimento.estado !== "CREADO"){
                    return res.sendBadRequestError("No puede añadirse el registro porque el experimento ya fue iniciado, está finalizado o abortado");
                }

                // Validar datos del cuerpo
                const registroData = req.body;
                if(!registroData){
                    const mensaje = this.errores.faltanParametros(["registroData"]);
                    return res.sendBadRequestError(mensaje);
                }

                const camposFaltantes = [];
                if(!registroData.nombre || typeof registroData.nombre !== "string"){
                    camposFaltantes.push("nombre");
                }
                else if(registroData.nombre.trim() === ""){
                    camposFaltantes.push("nombre");
                }
                
                if(!registroData.tipo || typeof registroData.tipo !== "string"){
                    camposFaltantes.push("tipo");
                }
                else if(registroData.tipo.trim() === ""){
                    camposFaltantes.push("tipo");
                }

                if(!registroData.unidad || typeof registroData.unidad !== "string"){
                    camposFaltantes.push("unidad");
                }
                else if(registroData.unidad.trim() === ""){
                    camposFaltantes.push("unidad");
                }

                if(camposFaltantes.length > 0){
                    const mensaje = this.errores.faltanParametros(camposFaltantes);
                    return res.sendBadRequestError(mensaje);
                }
                
                // Crear nuevo registro
                const nuevoRegistro = await RegistroService.createRegistro(
                    experimentoId,
                    registroData.nombre.trim(),
                    registroData.tipo.trim(),
                    registroData.unidad.trim()
                );

                // Usar $push en lugar de sobrescribir el array completo
                await ExperimentoService.updateExperimentoById(experimentoId, {
                    $push: { registros: nuevoRegistro._id }
                });
            
                return res.sendSuccess(nuevoRegistro);
            } 
            catch (error) {
                const mensaje = this.errores.errorServidor("crear un registro");
                return res.sendServerError(`${mensaje} Error: ${error}.`);
            }
        });

        /**
        * @swagger
        * /api/experimentos/{experimentoId}/muestrasFDR:
        *   post:
        *     summary: Registra una muestra FDR a un experimento en curso.
        *     description: Asocia una nueva muestra fuera de rango (FDR) a un experimento que se encuentra en estado "EN_CURSO". 
        *     tags:
        *       - Muestra FDR
        *     security:
        *       - bearerAuth: [SISTEMA]
        *     parameters:
        *       - in: path
        *         name: experimentoId
        *         required: true
        *         description: ID del experimento al que se le asociará la muestra FDR.
        *         schema:
        *           type: string
        *     requestBody:
        *       required: true
        *       content:
        *         application/json:
        *           schema:
        *             type: object
        *             required:
        *               - registroId
        *               - muestraId
        *             properties:
        *               registroId:
        *                 type: string
        *                 format: uuid
        *                 description: ID del registro asociado a la muestra FDR.
        *               muestraId:
        *                 type: string
        *                 format: uuid
        *                 description: ID de la muestra que será registrada como FDR.
        *     responses:
        *       200:
        *         description: Muestra FDR registrada y experimento actualizado correctamente.
        *       400:
        *         description: Parámetros inválidos o experimento no se encuentra en curso.
        *       404:
        *         description: El experimento no existe.
        *       500:
        *         description: Error del servidor al intentar registrar la muestra FDR.
        */

        // Agrega una muestraFDR al experimento
        this.post("/:experimentoId/muestrasFDR", ["SISTEMA"], async (req, res) => {
            try {
                // Validar que experimentoId esté presente y sea un ObjectId válido
                const { experimentoId } = req.params;
                if(!experimentoId){
                    const mensaje = this.errores.faltanParametros(["experimentoId"]);
                    return res.sendBadRequestError(mensaje);
                }
                if (!this.esIdValido(experimentoId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje);
                }

                // Verificar si el experimento existe
                const experimento = await ExperimentoService.getExperimentoById(experimentoId);
                if(!experimento){
                    const mensaje = this.errores.noEncontrado("Experimento");
                    return res.sendNotFound(mensaje);
                }

                if (experimento.estado !== "EN_CURSO") {
                    return res.sendBadRequestError("No puede asignarse la muestraFDR al experimento porque éste no se encuentra en curso.");
                }
                
                const camposFaltantes = [];
                const { registroId, muestraId } = req.body || {};
                if(typeof registroId !== "string" || !this.esIdValido(registroId)){
                    camposFaltantes.push("registroId");
                }
                if(typeof muestraId !== "string" || !this.esIdValido(muestraId)){
                    camposFaltantes.push("muestraId");
                }
                if(camposFaltantes.length > 0){
                    const mensaje = this.errores.faltanParametros(camposFaltantes);
                    return res.sendBadRequestError(mensaje);
                }

                const registro = await RegistroService.getRegistroById(registroId);
                if(!registro){
                    const mensaje = this.errores.noEncontrado("Registro");
                    return res.sendNotFound(mensaje);
                }

                const muestra = await MuestraService.getMuestraById(muestraId);
                if(!muestra){
                    const mensaje = this.errores.noEncontrado("Muestra");
                    return res.sendNotFound(mensaje);
                }

                const muestraFDR = await MuestraFDRService.createMuestraFDR({ experimentoId, registroId, muestraId });            
                experimento.muestrasFDR.push(muestraFDR._id);
                const experimentoActualizado = await ExperimentoService.updateExperimentoById(experimentoId, {
                    muestrasFDR: experimento.muestrasFDR
                });

                return res.sendSuccess(muestraFDR);
            } 
            catch (error) {
                const mensaje = this.errores.errorServidor("registrar muestra fuera de rango");
                return res.sendServerError(`${mensaje} Error: ${error}.`);
            }
        });
    }
}

export default ExperimentoRouter;