import request from "supertest";
import assert from "assert";
import app from "../../src/app.js"; // Asegurate que app.js exporta tu instancia de Express
import usuariosMoke from "./usuarios.moke.js";

describe("POST /api/autenticacion", () => {
  it("debería devolver 200 si las credenciales son válidas", async () => {
    const res = await request(app)
      .post("/api/autenticacion")
      .send({
        email: usuariosMoke.sistema.email,
        contraseña: usuariosMoke.sistema.contraseña
      });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, "success");
    assert.ok(res.body.payload);
    assert.ok(res.body.payload.usuario);
    assert.strictEqual(res.body.payload.usuario.email, usuariosMoke.sistema.email);
    assert.ok(res.body.payload.token);
  });

  it("debería devolver 404 si las credenciales son inválidas", async () => {
    const res = await request(app)
      .post("/api/autenticacion")
      .send({
        email: usuariosMoke.noValido.emailNoExiste,
        contraseña: "1234"
      });

    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.status, "error");
  });

});
