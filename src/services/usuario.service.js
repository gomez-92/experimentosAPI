import UsuarioDao from "../dao/usuario.dao.js";
import UsuarioMongo from "../dao/mongo/usuario.mongo.js";

const UsuarioService = new UsuarioDao(new UsuarioMongo());

export default UsuarioService;