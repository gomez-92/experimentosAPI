import RegistroDao from "../dao/registro.dao.js";
import RegistroMongo from "../dao/mongo/registro.mongo.js";

const RegistroService = new RegistroDao(new RegistroMongo());

export default RegistroService;