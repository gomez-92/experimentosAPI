import ConfiguracionDao from "../dao/configuracion.dao.js";
import ConfiguracionMongo from "../dao/mongo/configuracion.mongo.js";

const ConfiguracionService = new ConfiguracionDao(new ConfiguracionMongo());

export default ConfiguracionService;