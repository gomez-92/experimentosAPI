import ExperimentoEnCursoMongo from "../dao/mongo/experimentoEnCurso.mongo.js";
import ExperimentoEnCursoDao from "../dao/experimentoEnCurso.dao.js";

const ExperimentoEnCursoService = new ExperimentoEnCursoDao(new ExperimentoEnCursoMongo());

export default ExperimentoEnCursoService;