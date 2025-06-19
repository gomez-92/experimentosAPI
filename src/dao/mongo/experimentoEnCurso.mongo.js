import Connect from "./connect.js";
import ExperimentoEnCursoModelo from "./models/experimentoEnCurso.model.js";
import ExperimentoModelo from "./models/experimento.model.js";
import mongoose from "mongoose";

class ExperimentoEnCursoMongo{
    constructor(){
        Connect.getInstance();
    }

    setExperimentoEnCurso = async(experimentoId) => {
        return await ExperimentoEnCursoModelo.findOneAndUpdate(
            {_id: "enCurso"}, 
            {
                experimento: experimentoId 
            },
            {
                new: true,
                upsert: true
            }
        );
    }

    // CORREGIR ACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
    getExperimentoEnCurso = async() => {
        const enCurso = await ExperimentoEnCursoModelo.findById("enCurso");
        
        if(!enCurso) return null;

        const experimento = await ExperimentoModelo.findById(enCurso.experimento._id)
            .populate("registros")
            .populate("muestrasFDR");

        if(!experimento) return null;

        

        return {experimento, yaFinalizo: experimento.yaFinalizo, tiempoRestante: experimento.tiempoRestante, flags: experimento.cantidadRegistrosFueraDeRango};
    }
    
    updateExperimentoEnCurso = async(experimentoId) => {
        return await ExperimentoEnCursoModelo.findByIdAndUpdate("enCurso", {experimento: experimentoId});
    }

    deleteExperimentoEnCurso = async() => {
        return await ExperimentoEnCursoModelo.findByIdAndDelete("enCurso");
    }
};

export default ExperimentoEnCursoMongo;