import CustomRouter from "./custom.routes.js";
import UsuarioService from "../services/usuario.service.js";
import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";

class AutenticacionRouter extends  CustomRouter{
    
    emailValido = (email) => {
        const emailRegex = /.+@.+\..+/;
        return emailRegex.test(email);
    }

    esIdValido = (id) => {
        return mongoose.Types.ObjectId.isValid(id);
    }
    
    errores = {
        camposFaltantes: (campos) => `Faltan parámetros obligatorios: ${campos.join(", ")}`,
        formatoEmailInvalido: () => "Formato de correo electrónico inválido",
        credencialesInvalidas: () => "Usuario o contraseña incorrectas",
        errorServidor: (accion = "procesar la solicitud") => `Se produjo un error al ${accion}.`
    };
    
    init(){

        // Autenticación

        /**
        * @swagger
        * tags:
        *   name: Autenticación
        *   description: Login de usuarios
        */

        /**
        * @swagger
        * /api/autenticacion:
        *   post:
        *     summary: Iniciar sesión
        *     tags: [Autenticación]
        *     requestBody:
        *       required: true
        *       content:
        *         application/json:
        *           schema:
        *             type: object
        *             required:
        *               - email
        *               - contraseña
        *             properties:
        *               email:
        *                 type: string
        *                 example: usuario@example.com
        *               contraseña:
        *                 type: string
        *                 example: secreto123
        *     responses:
        *       200:
        *         description: Autenticación exitosa
        *         content:
        *           application/json:
        *             schema:
        *               type: object
        *               properties:
        *                 usuario:
        *                   type: object
        *                   properties:
        *                     id:
        *                       type: string
        *                     email:
        *                       type: string
        *                     rol:
        *                       type: string
        *                 token:
        *                   type: string
        *             example:
        *               usuario:
        *                 id: "64fcfa8a6d784c001e5b16e7"
        *                 email: "usuario@example.com"
        *                 rol: "CREATOR"
        *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        *       400:
        *         description: Faltan parámetros o formato de email inválido
        *       401:
        *         description: Usuario o contraseña incorrectos
        */

        this.post("/", ["PUBLIC"], async (req, res) => {
            try {
                
                const requeridos = ["email", "contraseña"];
                const camposFaltantes = requeridos.filter(campo => !req.body[campo]);
                
                if (camposFaltantes.length > 0) {
                    const mensaje = this.errores.camposFaltantes(camposFaltantes);
                    return res.sendBadRequestError(mensaje);
                }
                
                const { email, contraseña } = req.body;
            
                if(!this.emailValido(email)){
                    const mensaje = this.errores.formatoEmailInvalido();
                    return res.sendBadRequestError(mensaje);
                }
            
                const usuario = await UsuarioService.getUsuarioByEmail(email);
                if (!usuario) {
                    const mensaje = this.errores.credencialesInvalidas();
                    return res.sendNotFound(mensaje);
                }
            
                const contraseñaValida = await bcrypt.compare(contraseña, usuario.pass_hash);
                if (!contraseñaValida) {
                    const mensaje = this.errores.credencialesInvalidas();
                    return res.sendUnauthorizedError(mensaje);
                }
            
                const token = jsonwebtoken.sign(
                    {
                        id: usuario._id,
                        email: usuario.email,
                        rol: usuario.rol
                    },
                    process.env.JWT_SECRET || "secreto_dev",
                    {
                        expiresIn: "6h"
                    }
                );
            
                return res.sendSuccess({
                    usuario: {
                        _id: usuario._id,
                        email: usuario.email,
                        rol: usuario.rol
                    },
                    token
                });
            } 
            catch (error) {
                const mensaje = this.errores.errorServidor("consultar un usuario"); // <--- linea 128
                return res.sendServerError(`${mensaje} Error: ${error.message}`);
            }
        });    
    }
}

export default AutenticacionRouter;