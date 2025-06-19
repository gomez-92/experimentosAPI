import MuestraDao from "../dao/muestra.dao.js";
import MuestraMongo from "../dao/mongo/muestra.mongo.js";

const MuestraService = new MuestraDao(new MuestraMongo());

export default MuestraService;