import { getFeriaActivaFuncion } from "../controllers/ferias.controller.js"

export const noExisteFeriaActiva = async (req, res, next) => {
    try {
        const feriaActiva = await getFeriaActivaFuncion();

        if (!feriaActiva) {
            next();
        } else {
            res.status(401).json({ error: "No debe existir una feria activa actualmente para poder realizar esta acción" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error de servidor" });
    }
}