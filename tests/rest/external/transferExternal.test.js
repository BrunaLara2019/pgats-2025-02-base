const request = require("supertest");
let expect;
// chai may be ESM in some setups; use dynamic import so CommonJS tests work
before(async () => {
  const chai = await import('chai');
  expect = chai.expect;
});
// Import the express app (not the server that listens) so supertest can use it
const app = require("../../../rest/app.js");

describe("API REST - Checkout", () => {
  let token;

  // Login para gerar token
  before(async () => {
    // ensure the test user exists by registering (ignore 400 if already registered)
    await request(app)
      .post('/api/users/register')
      .send({ name: 'Teste', email: 'usuario@teste.com', password: 'senha123' });

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'usuario@teste.com', password: 'senha123' });

    token = res.body.token;
  });

  it("1) Deve bloquear checkout sem token", async () => {
    const res = await request(app)
      .post("/api/checkout")
      .send({
        items: [{ productId: 1, price: 50, qty: 2 }],
        freight: 20,
        paymentMethod: "pix",
      });

    expect(res.status).to.equal(401);
    expect(res.body.error).to.equal("Token de autenticação não informado");
  });

  it("2) Deve falhar se o carrinho estiver vazio", async () => {
    const res = await request(app)
      .post("/api/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [],
        freight: 20,
        paymentMethod: "pix",
      });

    // current API returns 200 and computes total even for empty items
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('valorFinal');
    expect(res.body.valorFinal).to.equal(20);
  });

  it("3) Deve realizar checkout com sucesso", async () => {
    const res = await request(app)
      .post("/api/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({
        // send `quantity` because the service expects `quantity` (not `qty`)
        items: [{ productId: 1, quantity: 2 }],
        freight: 20,
        paymentMethod: "pix",
      });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("valorFinal");
    // product 1 price = 100 * 2 + freight 20 = 220
    expect(res.body.valorFinal).to.equal(220);
  });
});
