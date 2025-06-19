import request from "supertest";
import assert from "assert";
import usuariosMoke from "../usuarios/usuarios.moke.js";
import app from "../../src/app.js";

describe("PUT /api/experimentos/:experimentoId", () => {

    const nombreActualizado = "Moke 2";
    let experimento, admin, sistema;

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
        .send({ nombre: "Moke update", duracion: 10000 });
        experimento = res3.body.payload;
    });

    after(async() => {
        if(!experimento) return;
        const res = await request(app)
        .delete(`/api/experimentos/${experimento._id}`)
        .set("Authorization", `Bearer ${admin.token}`);
    });

    it("debería devolver 200 con el nombre del experimento actualizado", async() => {
        const res = await request(app)
        .put(`/api/experimentos/${experimento._id}`)
        .set("Authorization", `Bearer ${admin.token}`)
        .send({nombre: nombreActualizado});

        assert.strictEqual(res.status, 200);
        assert.ok(res.body.status);
        assert.ok(res.body.payload);
        assert.strictEqual(res.body.status, "success");
        assert.strictEqual(res.body.payload.nombre, nombreActualizado);
    });

    it("debería devolver 404 si el experimentoId no es aportado", async() => {
        const res = await request(app)
        .put(`/api/experimentos`)
        .set("Authorization", `Bearer ${admin.token}`)
        .send({nombre: nombreActualizado});

        assert.strictEqual(res.status, 404);
    });

    it("debería devolver 401 si el token no es aportado", async() => {
        const res = await request(app)
        .put(`/api/experimentos/${experimento._id}`)
        .send({nombre: nombreActualizado});

        assert.strictEqual(res.status, 401);
        assert.ok(res.body.status);
        assert.ok(res.body.error);
        assert.strictEqual(res.body.status, "error");
    });

    it("debería devolver 403 si el token no es válido", async() => {
        const res = await request(app)
        .put(`/api/experimentos/${experimento._id}`)
        .set("Authorization", `Bearer 1234`)
        .send({nombre: nombreActualizado});

        assert.strictEqual(res.status, 403);
        assert.ok(res.body.status);
        assert.ok(res.body.error);
        assert.strictEqual(res.body.status, "error");
    });

    it("debería devolver 403 si el usuario no tiene permiso para editar el experimento", async() => {
        const res = await request(app)
        .put(`/api/experimentos/${experimento._id}`)
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({nombre: nombreActualizado});

        assert.strictEqual(res.status, 403);
        assert.ok(res.body.status);
        assert.ok(res.body.error);
        assert.strictEqual(res.body.status, "error");
    });

});