import request from "supertest";
import assert from "assert";
import usuariosMoke from "../usuarios/usuarios.moke.js";
import app from "../../src/app.js";



describe("GET /api/experimentos/:experimentoId", () => {

    let creator, sistema, experimento;

    before(async() => {
        const res1 = await request(app)
        .post("/api/autenticacion")
        .send({ email: usuariosMoke.sistema.email, contraseña: usuariosMoke.sistema.contraseña });
        sistema = {...res1.body.payload.usuario, token: res1.body.payload.token};

        const res2 = await request(app)
        .post("/api/autenticacion")
        .send({ email: usuariosMoke.creator.email, contraseña: usuariosMoke.creator.contraseña });
        creator = {...res2.body.payload.usuario, token: res2.body.payload.token};

        const res3 = await request(app)
        .post("/api/experimentos/create")
        .set("Authorization", `Bearer ${sistema.token}`)
        .send({ nombre: "Moke findById", duracion: 10000 });
        experimento = res3.body.payload;
    });

    after(async() => {
        const res1 = await request(app)
        .delete(`/api/experimentos/${experimento._id}`)
        .set("Authorization", `Bearer ${creator.token}`);
    });

    it("debería devolver 200 y los datos del experimento", async() => {
        const res = await request(app)
        .get(`/api/experimentos/${experimento._id}`)
        .set("Authorization", `Bearer ${creator.token}`);
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.status, "success");
        assert.ok(res.body.payload);
        assert.ok(res.body.payload._id);
        assert.strictEqual(res.body.payload._id, experimento._id);
    });
    
    it("deberia devolver 404 si el experimento no existe", async() => {
        const res = await request(app)
        .get(`/api/experimentos/999999999999999999999999`)
        .set("Authorization", `Bearer ${creator.token}`);
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.status, "error");
    });
    
    it("deberia devolver 400 si el ID es inválido", async() => {
        const res = await request(app)
        .get(`/api/experimentos/1234`)
        .set("Authorization", `Bearer ${creator.token}`);
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.status, "error");
    });
    
    it("deberia devolver 403 si no se proporciona el token", async() => {
        const res = await request(app)
        .get(`/api/experimentos/${experimento._id}`);
        assert.strictEqual(res.status, 401);
        assert.strictEqual(res.body.status, "error");
    });

    it("deberia devolver 403 si el token no es válido o está expirado", async() => {
        const res = await request(app)
        .get(`/api/experimentos/${experimento._id}`)
        .set("Authorization", `Bearer novalido`);
        assert.strictEqual(res.status, 403);
        assert.strictEqual(res.body.status, "error");
    });
});