import MuestraFDRDao from "../dao/muestraFDR.dao.js";
import MuestraFDRMongo from "../dao/mongo/muestraFDR.mongo.js";

const MuestraFDRService = new MuestraFDRDao(new MuestraFDRMongo());

export default MuestraFDRService;