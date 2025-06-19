import request from "supertest";
import assert from "assert";
import usuariosMoke from "../usuarios/usuarios.moke.js";
import app from "../../src/app.js";

describe("POST /api/experimentos/:experimentoId/abortar", () => {
    let experimento, sistema, admin;

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
        .post("/api/experimentos/create")
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ nombre: "Moke abortar", duracion: 10000 });
        experimento = res3.body.payload;

        const res4 = await request(app)
        .post(`/api/experimentos/${experimento._id}/iniciar`)
        .set("Authorization", `Bearer ${sistema.token}`);
        
    });

    after(async() => {
        if(!experimento) return;
        const res = await request(app)
        .delete(`/api/experimentos/${experimento._id}`)
        .set("Authorization", `Bearer ${admin.token}`);
    });
    
    it("debería devolver 401 token no aportado", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/abortar`);
        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.body.status, "error");
        assert.ok(res.body.error);
    });

    it("debería devolver 403 token no válido", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/abortar`)
        .set("Authorization", `Bearer 1234`);
        assert.strictEqual(res.status, 403);
        assert.strictEqual(res.body.status, "error");
        assert.ok(res.body.error);
    });

    it("debería devolver 404: experimento no encontrado", async() => {
        const res = await request(app)
        .post(`/api/experimentos/123412341234123412341234/abortar`)
        .set("Authorization", `Bearer ${sistema.token}`);
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.status, "error");
        assert.ok(res.body.error);
    });

    it("debería devolver 403: no autorizado para finaliza", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/abortar`)
        .set("Authorization", `Bearer ${admin.token}`);
        assert.strictEqual(res.status, 403);
        assert.strictEqual(res.body.status, "error");
        assert.ok(res.body.error);
    });

    it("debería devolver 200 y el estado del experimento ABORTADO", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/abortar`)
        .set("Authorization", `Bearer ${sistema.token}`);
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.status, "success");
        assert.ok(res.body.payload);
        assert.strictEqual(res.body.payload.estado, "ABORTADO");
    });

    it("debería devolver 400 no puede ABORTAR un experimento ya finalizado u abortado", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/abortar`)
        .set("Authorization", `Bearer ${sistema.token}`);
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.status, "error");
        assert.ok(res.body.error);
    });
});