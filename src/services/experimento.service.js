import ExperimentoMongo from "../dao/mongo/experimento.mongo.js";
import ExperimentoDao from "../dao/experimento.dao.js";

const ExperimentoService = new ExperimentoDao(new ExperimentoMongo());

export default ExperimentoService;