import CustomRouter from "./custom.routes.js";
import UsuarioService from "../services/usuario.service.js";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

class UsuarioRouter extends  CustomRouter{
    
    esIdValido = (id) => {
        return mongoose.Types.ObjectId.isValid(id);
    }
    
    emailValido = (email) => {
        const emailRegex = /.+@.+\..+/;
        return emailRegex.test(email);
    }
    
    permisos = {
        puedeCrear:{
            CREATOR: (autenticado, objetivo) => objetivo.rol !== "CREATOR",
            ADMIN: (autenticado, objetivo) => objetivo.rol !== "CREATOR" && objetivo.rol !== "ADMIN",
        },
        puedeVer:{
            CREATOR: () => true,
            ADMIN: (autenticado, objetivo) => {
                if(objetivo.rol === "CREATOR") return false;
                if(objetivo.rol === "ADMIN" && autenticado._id !== objetivo._id) return false;
                return true;
            },
            MONITOR: (autenticado, objetivo) => autenticado._id === objetivo._id,
            SISTEMA: (autenticado, objetivo) => autenticado._id === objetivo._id
        },
        puedeModificar:{
            CREATOR: () => true,
            ADMIN: (autenticado, objetivo) => {
                if(objetivo.rol === "CREATOR") return false;
                if(objetivo.rol === "ADMIN" && autenticado._id !== objetivo._id) return false;
                return true;
            },
            MONITOR: (autenticado, objetivo) => autenticado._id === objetivo._id,
            SISTEMA: (autenticado, objetivo) => autenticado._id === objetivo._id
        },
        puedeEliminar:{
            CREATOR: () => true,
            ADMIN: (autenticado, objetivo) => {
                if(objetivo.rol === "CREATOR") return false;
                if(objetivo.rol === "ADMIN" && autenticado._id !== objetivo._id) return false;
                return true;
            }
        }    
    }
        
    errores = {
        faltanParametros: (campos = []) => `Faltan parámetros obligatorios: ${campos.join(", ")}.`,
        emailInvalido: "Formato de correo electrónico inválido.",
        idInvalido: "Formato de ID inválido.",
        duplicado: (campo) => `Ya existe un usuario registrado con ese ${campo}.`,
        noEncontrado: (entidad = "Elemento") => `${entidad} no encontrado.`,
        noAutorizado: (accion = "realizar esta acción") => `No tiene autorización para ${accion}.`,
        errorServidor: (accion = "procesar la solicitud") => `Se produjo un error al ${accion}.`
    };

    init(){
        
        
        /**
        * @swagger
        * tags:
        *   name: Usuarios
        *   description: CRUD Usuarios
        */

        /**
        * @swagger
        * /api/usuarios/findByEmail:
        *   get:
        *     summary: Buscar usuario por email
        *     tags: [Usuarios]
        *     parameters:
        *       - in: query
        *         name: email
        *         required: true
        *         schema:
        *           type: string
        *         description: Email del usuario
        *     security:
        *       - bearerAuth: []
        *     responses:
        *       200:
        *         description: Usuario encontrado
        *       400:
        *         description: Email inválido o faltante
        *       404:
        *         description: Usuario no encontrado
        */
        
        // Obtiene un usuario por Email
        this.get("/findByEmail", ["CREATOR", "ADMIN", "MONITOR", "SISTEMA"], async (req, res) => {
            try {
                const autenticado = req.user;
                const { email } = req.query;
            
                if (!email) {
                    const mensaje = this.errores.faltanParametros(["email"]);
                    return res.sendBadRequestError(mensaje);
                }
            
                if (!this.emailValido(email)) {
                    const mensaje = this.errores.emailInvalido;
                    return res.sendBadRequestError(mensaje);
                }
            
                const usuario = await UsuarioService.getUsuarioByEmail(email);
            
                if (!usuario) {
                    const mensaje = this.errores.noEncontrado("Usuario");
                    return res.sendNotFound(mensaje);
                }
            
                const puedeVer = this.permisos.puedeVer[autenticado.rol];
                if (typeof puedeVer === "function" && !puedeVer(autenticado, usuario)) {
                    const mensaje = this.errores.noAutorizado("consultar datos de este usuario");
                    return res.sendUnauthorizedError(mensaje);
                }
            
                return res.sendSuccess(usuario);
            } 
            catch (error) {
                const mensaje = this.errores.errorServidor("consultar un usuario");
                return res.sendServerError(`${mensaje} Error: ${error.message}`);
            }
        });

        /**
        * @swagger
        * /api/usuarios/{usuarioId}:
        *   get:
        *     summary: Obtener usuario por ID
        *     tags: [Usuarios]
        *     parameters:
        *       - in: path
        *         name: usuarioId
        *         required: true
        *         schema:
        *           type: string
        *         description: ID del usuario
        *     security:
        *       - bearerAuth: []
        *     responses:
        *       200:
        *         description: Usuario encontrado
        *       400:
        *         description: ID inválido o faltante
        *       404:
        *         description: Usuario no encontrado
        */

        // Obtiene un usuario por ID
        this.get("/:usuarioId", ["CREATOR", "ADMIN", "MONITOR", "SISTEMA"], async (req, res) => {
            try {
                const autenticado = req.user;
                const { usuarioId } = req.params;
            
                if (!usuarioId) {
                    const mensaje = this.errores.faltanParametros(["usuarioId"]);
                    return res.sendBadRequestError(mensaje);
                }
            
                if (!this.esIdValido(usuarioId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje);
                }
            
                const usuario = await UsuarioService.getUsuarioById(usuarioId);
                if (!usuario) {
                    const mensaje = this.errores.noEncontrado("Usuario");
                    return res.sendNotFound(mensaje);
                }
            
                const puedeVer = this.permisos.puedeVer[autenticado.rol];
                if (typeof puedeVer === "function" && !puedeVer(autenticado, usuario)) {
                    const mensaje = this.errores.noAutorizado("consultar datos de este usuario");
                    return res.sendUnauthorizedError(mensaje);
                }
            
                return res.sendSuccess(usuario);
            } 
            catch (error) {
                const mensaje = this.errores.errorServidor("consultar un usuario");
                return res.sendServerError(`${mensaje} Error: ${error.message}`);
            }
        });     

        /**
        * @swagger
        * /api/usuarios/create:
        *   post:
        *     summary: Crear un nuevo usuario
        *     tags: [Usuarios]
        *     requestBody:
        *       required: true
        *       content:
        *         application/json:
        *           schema:
        *             type: object
        *             required:
        *               - nombre
        *               - email
        *               - contraseña
        *               - rol
        *             properties:
        *               nombre:
        *                 type: string
        *               email:
        *                 type: string
        *               contraseña:
        *                 type: string
        *               rol:
        *                 type: string
        *     security:
        *       - bearerAuth: []
        *     responses:
        *       200:
        *         description: Usuario creado correctamente
        *       400:
        *         description: Faltan campos o el email ya está en uso
        */

        // Crear usuario
        this.post("/create", ["CREATOR", "ADMIN"], async (req, res) => {
            try {
                const autenticado = req.user;
                const { nombre, email, contraseña, rol } = req.body;
                
                // Validación de campos requeridos
                const camposFaltantes = [];
                if (!nombre) camposFaltantes.push("nombre");
                if (!email) camposFaltantes.push("email");
                if (!contraseña) camposFaltantes.push("contraseña");
                if (!rol) camposFaltantes.push("rol");
            
                if (camposFaltantes.length > 0) {
                    const mensaje = this.errores.faltanParametros(camposFaltantes);
                    return res.sendBadRequestError(mensaje);
                }
            
                // Verifica permiso según el rol
                const puedeCrear = this.permisos.puedeCrear[autenticado.rol];
                if (typeof puedeCrear === "function" && !puedeCrear(autenticado, { rol })) {
                    const { status, mensaje } = this.errores.noAutorizado("crear un usuario con ese rol");
                    return res.sendUnauthorizedError(mensaje);
                }
            
                // Validación de formato de email
                if (!this.emailValido(email)) {
                    const mensaje = this.errores.emailInvalido;
                    return res.sendBadRequestError(mensaje);
                }
            
                // Verifica si el email ya está registrado
                const usuarioExistente = await UsuarioService.getUsuarioByEmail(email);
                if (usuarioExistente) {
                    const mensaje = this.errores.duplicado("correo electrónico");
                    return res.sendBadRequestError(mensaje);
                }
            
                // Hashea la contraseña
                const pass_hash = await bcrypt.hash(contraseña, 10);
            
                // Crea el nuevo usuario
                const usuario = await UsuarioService.createUsuario({
                    nombre,
                    email,
                    pass_hash,
                    rol
                });
            
                return res.sendSuccess(usuario);
            } 
            catch (error) {
                const mensaje = this.errores.errorServidor("crear un usuario");
                return res.sendServerError(`${mensaje} Error: ${error.message}`);
            }
        });
        
        /**
        * @swagger
        * /api/usuarios/{usuarioId}:
        *   put:
        *     summary: Actualizar usuario
        *     tags: [Usuarios]
        *     parameters:
        *       - in: path
        *         name: usuarioId
        *         required: true
        *         schema:
        *           type: string
        *     security:
        *       - bearerAuth: []
        *     requestBody:
        *       required: true
        *       content:
        *         application/json:
        *           schema:
        *             type: object
        *             properties:
        *               usuarioData:
        *                 type: object
        *                 properties:
        *                   nombre:
        *                     type: string
        *                   email:
        *                     type: string
        *                   rol:
        *                     type: string
        *                   activo:
        *                     type: boolean
        *     responses:
        *       200:
        *         description: Usuario actualizado
        *       400:
        *         description: Datos inválidos
        *       404:
        *         description: Usuario no encontrado
        */
        
        // Actualizar usuario
        this.put("/:usuarioId", ["CREATOR", "ADMIN", "MONITOR", "SISTEMA"], async (req, res) => {
            try {
                const { usuarioId } = req.params;
                const usuarioData = req.body;
                const autenticado = req.user;
            
                if (!usuarioId) {
                    const mensaje = this.errores.faltanParametros(["usuarioId"]);
                    return res.sendBadRequestError(mensaje);
                }
            
                if (!this.esIdValido(usuarioId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje);
                }
            
                // Buscar usuario
                const usuario = await UsuarioService.getUsuarioById(usuarioId);
                if (!usuario) {
                    const mensaje = this.errores.noEncontrado("Usuario");
                    return res.sendNotFound(mensaje);
                }
            
                // Verificar permisos usando la política centralizada
                if (!this.permisos.puedeModificar[autenticado.rol]?.(autenticado, usuario)) {
                    const mensaje = this.errores.noAutorizado("modificar datos de otro usuario");
                    return res.sendUnauthorizedError(mensaje);
                }

                // Campos permitidos (excluyendo contraseña)
                const camposPermitidos = ["nombre", "email", "rol", "activo"];
                const datosActualizables = {};
                for (const campo of camposPermitidos) {
                    if (campo in usuarioData) {
                        datosActualizables[campo] = usuarioData[campo];
                    }
                }
            
                // Validar email si se actualiza
                if (datosActualizables.email && !this.emailValido(datosActualizables.email)) {
                    const mensaje = this.errores.emailInvalido;
                    return res.sendBadRequestError(mensaje);
                }
            
                // Verificar unicidad del email
                if (datosActualizables.email) {
                    const usuarioConEseEmail = await UsuarioService.getUsuarioByEmail(datosActualizables.email);
                    if (usuarioConEseEmail && usuarioConEseEmail._id.toString() !== usuarioId) {
                        const mensaje = this.errores.duplicado("correo electrónico");
                        return res.sendBadRequestError(mensaje);
                    }
                }
            
                // Actualizar
                const usuarioActualizado = await UsuarioService.updateUsuarioById(usuarioId, datosActualizables);
            
                if (!usuarioActualizado) {
                    const mensaje = this.errores.noEncontrado("Usuario");
                    return res.sendNotFound(mensaje);
                }
            
                return res.sendSuccess(usuarioActualizado);
            } catch (error) {
                const mensaje = this.errores.errorServidor("actualizar un usuario");
                return res.sendServerError(`${mensaje} Error: ${error.message}`);
            }
        });
        
        /**
        * @swagger
        * /api/usuarios/{usuarioId}:
        *   delete:
        *     summary: Eliminar usuario
        *     tags: [Usuarios]
        *     parameters:
        *       - in: path
        *         name: usuarioId
        *         required: true
        *         schema:
        *           type: string
        *     security:
        *       - bearerAuth: []
        *     responses:
        *       200:
        *         description: Usuario eliminado
        *       400:
        *         description: ID inválido
        *       404:
        *         description: Usuario no encontrado
        */

        // Elimina un usuario
        this.delete("/:usuarioId", ["CREATOR", "ADMIN"], async (req, res) => {
            try {
                const autenticado = req.user;
                const { usuarioId } = req.params;
                
                // Validación de parámetro
                if (!usuarioId?.trim()) {
                    const mensaje = this.errores.faltanParametros(["usuarioId"]);
                    return res.sendBadRequestError(mensaje);
                }
            
                if (!this.esIdValido(usuarioId)) {
                    const mensaje = this.errores.idInvalido;
                    return res.sendBadRequestError(mensaje); // 400
                }
            
                // Buscar el usuario a eliminar
                const usuario = await UsuarioService.getUsuarioById(usuarioId);
            
                if (!usuario) {
                    const mensaje = this.errores.noEncontrado("Usuario");
                    return res.sendNotFound(mensaje);
                }
            
                // Verifica permiso para eliminar
                const puedeEliminar = this.permisos.puedeEliminar[autenticado.rol];
                if (typeof puedeEliminar === "function" && !puedeEliminar(autenticado, usuario)) {
                    const mensaje = this.errores.noAutorizado(`eliminar un usuario de tipo ${usuario.rol}`);
                    return res.sendUnauthorizedError(mensaje);
                }
            
                // Eliminar usuario
                const usuarioEliminado = await UsuarioService.deleteUsuarioById(usuarioId);
            
                return res.sendSuccess(usuarioEliminado);
            } 
            catch (error) {
                const mensaje = this.errores.errorServidor("eliminar un usuario");
                return res.sendServerError(`${mensaje} Error: ${error.message}`);
            }
        });
    }
}

export default UsuarioRouter;