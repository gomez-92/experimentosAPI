import { Router } from "express";
import UsuarioService from "../services/usuario.service.js";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Clase que encapsula un enrutador personalizado de Express
export default class CustomRouter {
	constructor() {
		// Se crea una nueva instancia de Router
		this.router = Router();
		this.init();
	}

	// Método opcional que puede ser sobrescrito para inicializar rutas en una subclase
	init() {}

	// Devuelve el enrutador
	getRouter = () => {
		return this.router;
	};

	// Define una ruta GET con middlewares personalizados
	get = (path, policies, callbacks) => {
		this.router.get(
			path,
			this.generateCustomResponses,
			this.handlePolicies(policies),
			...this.applyCallbacks(callbacks)
		);
	};

	// Define una ruta POST con middlewares personalizados
	post = (path, policies, callbacks) => {
		this.router.post(
			path,
			this.generateCustomResponses,
			this.handlePolicies(policies),
			...this.applyCallbacks(callbacks)
		);
	};

	// Define una ruta PUT con middlewares personalizados
	put = (path, policies, callbacks) => {
		this.router.put(
			path,
			this.generateCustomResponses,
			this.handlePolicies(policies),
			...this.applyCallbacks(callbacks)
		);
	};

	// Define una ruta DELETE con middlewares personalizados
	delete = (path, policies, callbacks) => {
		this.router.delete(
			path,
			this.generateCustomResponses,
			this.handlePolicies(policies),
			...this.applyCallbacks(callbacks)
		);
	};

	// Envueltas asincrónicas para manejar errores en callbacks
	applyCallbacks(callbacks) {
		// Asegura que callbacks siempre sea un array
		const cbArray = Array.isArray(callbacks) ? callbacks : [callbacks];
	
		return cbArray.map(callback => async (...params) => {
			try {
				await callback.apply(this, params);
			} catch (error) {
				console.log(error);
				params[1].sendServerError(error);
			}
		});
	}

	// Middleware para generar respuestas personalizadas
	generateCustomResponses = (req, res, next) => {
		res.sendSuccess = payload =>
			res.status(200).json({ status: "success", payload });
		res.sendBadRequestError = error =>
			res.status(400).json({ status: "error", error });
		res.sendUnauthenticatedError = error =>
			res.status(401).json({ status: "error", error });
		res.sendUnauthorizedError = error =>
			res.status(403).json({ status: "error", error });
		res.sendNotFound = error =>
			res.status(404).json({status: "error", error});
		res.sendServerError = error =>
			res.status(500).json({ status: "error", error });
		next();
	};

	// Middleware que maneja las políticas de acceso
	handlePolicies = (policies) => {
		return async (req, res, next) => {
			// Si el método es PUBLIC
			if (policies.includes("PUBLIC")) return next();

			const authHeader = req.headers['authorization'];
    		const token = authHeader && authHeader.split(' ')[1]; // Espera formato: Bearer <token>

			// Verifico que se haya proporcionado un token
    		if (!token) {
        		return res.sendUnauthenticatedError("Token no proporcionado");
    		}

			try{
				// Valido el token
				const secreto = process.env.JWT_SECRET || "secreto_dev";
				const payload = jsonwebtoken.verify(token, secreto);
				const { id, email, rol } = payload;
				const usuario = await UsuarioService.getUsuarioById(id);
				// Autenticación del usuario
				if(
					!usuario ||
					!usuario.email || usuario.email !== email ||
					!usuario.rol || usuario.rol !== rol 
				){
					return res.sendUnauthenticatedError("Usuario no autenticado");
				}
				// Verifica si cumple con las políticas del método
				if(!policies.includes(rol)){
					return res.sendUnauthorizedError(`Su rol: [${rol}] no tiene autorización para acceder al método.`);
				}
				req.user = usuario;
				next();
			}
			catch(error){
				return res.sendUnauthorizedError("Token inválido o expirado");
			}
		};
	};
}