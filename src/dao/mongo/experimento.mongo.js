import Connect from "./connect.js";
import ExperimentoModelo from "./models/experimento.model.js";

class ExperimentoMongo {
    constructor() {
        Connect.getInstance();
    }

    // Crear un nuevo experimento
    createExperimento = async (nombre, duracion) => {
        // Validaciones básicas (opcional, pero ayuda a mantener el modelo limpio)
        if (typeof nombre !== "string" || nombre.trim() === "") {
            throw new Error("El nombre del experimento debe ser una cadena no vacía.");
        }
        if (typeof duracion !== "number" || duracion <= 0) {
            throw new Error("La duración debe ser un número positivo.");
        }

        return await ExperimentoModelo.create({ nombre, duracion });
    }

    // Obtener todos los experimentos
    getExperimentos = async () => {
        return await ExperimentoModelo.find({});
    }

    // Obtener experimento por ID con populates
    getExperimentoById = async (experimentoId) => {
        const experimento = await ExperimentoModelo.findById(experimentoId)
            .populate("registros")
            .populate("muestrasFDR");

        if (!experimento) return null;

        // Convertir a objeto plano para poder agregarle propiedades nuevas
        const experimentoObj = experimento.toObject();

        // Agregar campos calculados
        experimentoObj.yaFinalizo = experimento.yaFinalizo();
        experimentoObj.tiempoRestante = experimento.tiempoRestante();
        experimentoObj.cantRegFDR = experimento.getCantRegFDR();

        return experimentoObj;
    }

    // Actualizar un experimento por ID
    updateExperimentoById = async (experimentoId, updateData) => {
        const experimento = await ExperimentoModelo.findByIdAndUpdate(
            experimentoId,
            updateData,
            {
                new: true,            // Devuelve el documento actualizado
                runValidators: true  // Ejecuta validaciones del modelo
            }
        );

        if (!experimento) return null;

        // Convertir a objeto plano para poder agregarle propiedades nuevas
        const experimentoObj = experimento.toObject();

        // Agregar campos calculados
        experimentoObj.yaFinalizo = experimento.yaFinalizo();
        experimentoObj.tiempoRestante = experimento.tiempoRestante();
        experimentoObj.cantRegFDR = experimento.getCantRegFDR();

        return experimentoObj;
    }

    // Eliminar un experimento por ID
    deleteExperimentoById = async (experimentoId) => {
        return await ExperimentoModelo.findByIdAndDelete(experimentoId);
    }
}

export default ExperimentoMongo;