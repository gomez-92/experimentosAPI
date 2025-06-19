import request from "supertest";
import assert from "assert";
import usuariosMoke from "./usuarios.moke.js";
import app from "../../src/app.js";

// ========== TESTS FIND BY EMAIL ==========

describe("GET /api/usuarios/findByEmail", () => {

  let admin;

  before(async() => {
    const res2 = await request(app)
    .post("/api/autenticacion")
    .send({ email: usuariosMoke.admin.email, contraseña: usuariosMoke.admin.contraseña });
    admin = {...res2.body.payload.usuario, token: res2.body.payload.token};
  });

  it("debería devolver 200 y los datos completos del usuario si el email existe", async () => {
    const res = await request(app)
      .get(`/api/usuarios/findByEmail?email=${usuariosMoke.monitor.email}`)
      .set("Authorization", `Bearer ${admin.token}`);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, "success");
      const payload = res.body.payload;
      assert.ok(payload);
      assert.ok(payload._id);
      assert.ok(payload.nombre);
      assert.ok(payload.pass_hash);
      assert.ok(payload.email);
      assert.ok(payload.rol);
  });

  it("debería devolver 401 si no se proporciona el token", async () => {
    const res = await request(app)
      .get(`/api/usuarios/findByEmail?email=${usuariosMoke.monitor.email}`);

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.status, "error");
  });

  it("debería devolver 403 si el token es inválido o expirado", async () => {
    const res = await request(app)
      .get(`/api/usuarios/findByEmail?email=${usuariosMoke.monitor.email}`)
      .set("Authorization", usuariosMoke.noValido.tokenNoValido);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.status, "error");
  });

  it("debería devolver 400 si el email tiene formato inválido", async () => {
    const res = await request(app)
      .get(`/api/usuarios/findByEmail?email=${usuariosMoke.noValido.emailNoValido}`)
      .set("Authorization", `Bearer ${admin.token}`);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.status, "error");
  });

  it("debería devolver 404 si el usuario no existe", async () => {
    const res = await request(app)
      .get(`/api/usuarios/findByEmail?email=${usuariosMoke.noValido.emailNoExiste}`)
      .set("Authorization", `Bearer ${admin.token}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.status, "error");
  });
});