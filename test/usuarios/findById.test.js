import request from "supertest";
import assert from "assert";
import usuariosMoke from "./usuarios.moke.js";
import app from "../../src/app.js";

// ========== TESTS GET BY ID ==========

describe("GET /api/usuarios/:usuarioId", () => {

  let admin, monitor;

  before(async() => {
    const res2 = await request(app)
    .post("/api/autenticacion")
    .send({ email: usuariosMoke.admin.email, contraseña: usuariosMoke.admin.contraseña });
    admin = {...res2.body.payload.usuario, token: res2.body.payload.token};

    const res1 = await request(app)
    .post("/api/autenticacion")
    .send({ email: usuariosMoke.monitor.email, contraseña: usuariosMoke.monitor.contraseña });
    monitor = {...res1.body.payload.usuario, token: res1.body.payload.token};
  });

  it("debería devolver 200 si el usuario existe y el rol está autorizado", async () => {
    const res = await request(app)
      .get(`/api/usuarios/${monitor._id}`)
      .set("Authorization", `Bearer ${admin.token}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, "success");
    assert.ok(res.body.payload);
    assert.strictEqual(res.body.payload._id, monitor._id);
  });

  it("debería devolver 404 si el usuario no existe", async () => {
    const res = await request(app)
      .get(`/api/usuarios/${usuariosMoke.noValido.idNoExiste}`)
      .set("Authorization", `Bearer ${admin.token}`);

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.status, "error");
  });

  it("debería devolver 400 si el ID es inválido", async () => {
    const res = await request(app)
      .get(`/api/usuarios/${usuariosMoke.noValido.idNoValido}`)
      .set("Authorization", `Bearer ${admin.token}`);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.status, "error");
  });

  it("debería devolver 401 si no se proporciona token", async () => {
    const res = await request(app)
      .get(`/api/usuarios/${monitor._id}`);

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.status, "error");
  });

  it("debería devolver 403 si el token es inválido o expirado", async () => {
    const res = await request(app)
      .get(`/api/usuarios/${monitor._id}`)
      .set("Authorization", usuariosMoke.noValido.tokenNoValido);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.status, "error");
  });

  it("debería devolver 403 si el rol no está autorizado para ver los datos de este usuario", async () => {
    const res = await request(app)
      .get(`/api/usuarios/${admin._id}`)
      .set("Authorization", `Bearer ${monitor.token}`);

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.status, "error");
  });
});