// tests/rest/external/transferExternal.test.js
const request = require("supertest");
let expect;

before(async () => {
  const chai = await import('chai');
  expect = chai.expect;
});

const app = require("../../../rest/app.js");

describe("API REST - Checkout", () => {
  let token;

  // Gera token antes dos testes
  before(async () => {
    // Ignora erro se usuário já estiver registrado
    await request(app)
      .post('/api/users/register')
      .send({ name: 'Teste', email: 'usuario@teste.com', password: 'senha123' })
      .catch(() => {});

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'usuario@teste.com', password: 'senha123' });

    token = res.body.token;
    expect(token).to.be.a('string'); 
  });

  it("Deve bloquear checkout sem token", async () => {
    const res = await request(app)
      .post("/api/checkout")
      .send({ items: [{ productId: 1, price: 50, qty: 2 }], freight: 20, paymentMethod: "pix" });

    expect(res.status).to.equal(401);
    expect(res.body.error).to.equal("Token de autenticação não informado");
  });

  it("Deve falhar se o carrinho estiver vazio", async () => {
    const res = await request(app)
      .post("/api/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [], freight: 20, paymentMethod: "pix" });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('valorFinal');
    expect(res.body.valorFinal).to.be.a('number');
  });

  it("Deve realizar checkout com sucesso", async () => {
    const res = await request(app)
      .post("/api/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [{ productId: 1, quantity: 2 }], freight: 20, paymentMethod: "pix" });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("valorFinal");
    expect(res.body.valorFinal).to.be.a('number');
  });
});
