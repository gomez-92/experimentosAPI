import request from "supertest";
import assert from "assert";
import usuariosMoke from "../usuarios/usuarios.moke.js";
import app from "../../src/app.js";

describe("POST /api/experimentos/:experimentoId/finalizar", () => {
    let sistema, admin, experimento;

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
        .send({ nombre: "Moke finalizar", duracion: 10000 });
        experimento = res3.body.payload;

        
    });

    after(async() => {
        if(!experimento) return;
        const res = await request(app)
        .delete(`/api/experimentos/${experimento._id}`)
        .set("Authorization", `Bearer ${admin.token}`);
    });

    it("debería devolver 401: token no aportado", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/finalizar`);
        assert.strictEqual(res.status, 401);
        assert.ok(res.body.status);
        assert.ok(res.body.error);
        assert.strictEqual(res.body.status, "error");
    });

    it("debería devolver 403: token no válido", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/finalizar`)
        .set("Authorization", `Bearer 1234`);
        assert.strictEqual(res.status, 403);
        assert.ok(res.body.status);
        assert.ok(res.body.error);
        assert.strictEqual(res.body.status, "error");
    });

    it("debería devolver 404: experimento no encontrado", async() => {
        const res = await request(app)
        .post(`/api/experimentos/123412341234123412341234/finalizar`)
        .set("Authorization", `Bearer ${sistema.token}`);
        assert.strictEqual(res.status, 404);
        assert.ok(res.body.status);
        assert.ok(res.body.error);
        assert.strictEqual(res.body.status, "error");
    });

    it("debería devolver 403: no puede finalizar un experimento no iniciado", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/finalizar`)
        .set("Authorization", `Bearer ${sistema.token}`);
        assert.strictEqual(res.status, 400);
        assert.ok(res.body.status);
        assert.ok(res.body.error);
        assert.strictEqual(res.body.status, "error");
    });
        
    it("debería devolver 403: no autorizado para finalizar", async() => {
        const res5 = await request(app)
        .post(`/api/experimentos/${experimento._id}/iniciar`)
        .set("Authorization", `Bearer ${sistema.token}`);
        experimento = res5.body.payload;

        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/finalizar`)
        .set("Authorization", `Bearer ${admin.token}`);
        assert.strictEqual(res.status, 403);
        assert.ok(res.body.status);
        assert.ok(res.body.error);
        assert.strictEqual(res.body.status, "error");
    });

    it("debería devolver 200 y el estado del experimento FINALIZADO", async() => {
        const res = await request(app)
        .post(`/api/experimentos/${experimento._id}/finalizar`)
        .set("Authorization", `Bearer ${sistema.token}`);
        assert.strictEqual(res.status, 200);
        assert.ok(res.body.status);
        assert.ok(res.body.payload);
        assert.strictEqual(res.body.status, "success");
        assert.strictEqual(res.body.payload.estado, "FINALIZADO");
    });



    








});