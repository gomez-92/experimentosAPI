import request from "supertest";
import assert from "assert";
import usuariosMoke from "../usuarios/usuarios.moke.js";
import app from "../../src/app.js";


describe("POST /api/experimentos/:experimentoId/registros", () => {

    let experimento, registro, sistema, admin;

    before(async() => {
        const res1 = await request(app)
        .post("/api/autenticacion")
        .send({ email: usuariosMoke.sistema.email, contraseña: usuariosMoke.sistema.contraseña });
        sistema = {...res1.body.payload.usuario, token: res1.body.payload.token};

        const res2 = await request(app)
        .post("/api/autenticacion")
        .send({ email: usuariosMoke.admin.email, contraseña: usuariosMoke.admin.contraseña });
        admin = {...res2.body.payload.usuario, token: res2.body.payload.token};

        const res3 = await request(app)
        .post(`/api/experimentos/create`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ nombre: "Moke create reg", duracion: 10000 });
        experimento = res3.body.payload;
        
    });

    after(async() => {
        if(!registro) return;
        const res1 = await request(app)
        .delete(`/api/registros/${registro._id}`)
        .set("Authorization", `Bearer ${admin.token}`);
        
        if(!experimento) return;
        const res2 = await request(app)
        .delete(`/api/experimentos/${experimento._id}`)
        .set("Authorization", `Bearer ${admin.token}`);
    });

    it("debería devolver 400 si faltan parámetros obligatorios", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/registros`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ unidad: "ºC" });
        assert.strictEqual(res.status, 400);
    });

    it("debería devolver 400 si  experimentoId es inválido", async() => {
        const res = await request(app)
        .post(`/api/experimentos/012/registros`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ nombre: "Moke", tipo: "temperatura", unidad: "ºC" });
        assert.strictEqual(res.status, 400);
    });

    it("debería devolver 404 si no encuentra el experimento", async() => {
        const res = await request(app)
        .post(`/api/experimentos/999999999999999999999999/registros`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ nombre: "Moke", tipo: "temperatura", unidad: "ºC" });
        assert.strictEqual(res.status, 404);
    });

    it("debería devolver 401 si no proporciona el token", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/registros`)
        .send({ nombre: "Moke", tipo: "temperatura", unidad: "ºC" });
        assert.strictEqual(res.status, 401);
    });

    it("debería devolver 403 si no está autorizado", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/registros`)
        .set("Authorization", `Bearer ${admin.token}`)
        .send({ nombre: "Moke", tipo: "temperatura", unidad: "ºC" });
        assert.strictEqual(res.status, 403);
    });

    it("debería devolver 200 y los datos del registro creado", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/registros`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ nombre: "Moke", tipo: "temperatura", unidad: "ºC" });
        registro = res.body.payload;
        assert.strictEqual(res.status, 200);
    });

    it("debería devolver 400 si el experimento ya fue iniciado, finalizado o abortado", async() => {
        const res1 = await request(app)
        .post(`/api/experimentos/${experimento._id}/iniciar`)
        .set("Authorization", `Bearer ${sistema.token}`);
        experimento = res1.body.payload;

        const res2 = await request(app)
        .post(`/api/experimentos/${experimento._id}/registros`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ nombre: "Moke", tipo: "temperatura", unidad: "ºC" });
        assert.strictEqual(res2.status, 400);
    });
});