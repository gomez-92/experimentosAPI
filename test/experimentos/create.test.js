import request from "supertest";
import assert from "assert";
import usuariosMoke from "../usuarios/usuarios.moke.js";
import app from "../../src/app.js";

describe("POST /api/experimentos/create", () => {
    let sistema, creator;
    let experimentoCreado;

    before(async() => {
        const res1 = await request(app)
        .post("/api/autenticacion")
        .send({ email: usuariosMoke.sistema.email, contraseña: usuariosMoke.sistema.contraseña });
        sistema = {...res1.body.payload.usuario, token: res1.body.payload.token};

        const res2 = await request(app)
        .post("/api/autenticacion")
        .send({ email: usuariosMoke.creator.email, contraseña: usuariosMoke.creator.contraseña });
        creator = {...res2.body.payload.usuario, token: res2.body.payload.token};
    });

    after(async() => {
        if(!experimentoCreado) return;
        const res1 = await request(app)
        .delete(`/api/experimentos/${experimentoCreado._id}`)
        .set("Authorization", `Bearer ${creator.token}`);
    });

    it("debería devolver 200 y los datos del experimento creado", async() => {
        const res = await request(app)
        .post(`/api/experimentos/create`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({nombre: "Moke create", duracion: 10000});
        experimentoCreado = res.body.payload;
        assert.strictEqual(res.status, 200);
        assert.ok(res.body.status);
        assert.ok(res.body.payload);
        assert.strictEqual(res.body.status, "success");
    });

    it("deberia devolver 403 si el usuario no esta autorizado", async() => {
        const res = await request(app)
        .post(`/api/experimentos/create`)
        .set("Authorization", `Bearer ${creator.token}`)
        .send({nombre: "Moke", duracion: 10000});
        assert.strictEqual(res.status, 403);
        assert.ok(res.body.status);
        assert.strictEqual(res.body.status, "error");
    });

    it("deberia devolver 401 si aporta el token", async() => {
        const res = await request(app)
        .post(`/api/experimentos/create`)
        .send({nombre: "Moke", duracion: 10000});
        assert.strictEqual(res.status, 401);
        assert.ok(res.body.status);
        assert.strictEqual(res.body.status, "error");
    });

    it("deberia devolver 403 si el token es inválido", async() => {
        const res = await request(app)
        .post(`/api/experimentos/create`)
        .set("Authorization", `Bearer 1234`)
        .send({nombre: "Moke", duracion: 10000});
        assert.strictEqual(res.status, 403);
        assert.ok(res.body.status);
        assert.strictEqual(res.body.status, "error");
    });

});