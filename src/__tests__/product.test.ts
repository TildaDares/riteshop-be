import supertest from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connect, disconnect, connection } from "mongoose";
import App from "@/app";
import ProductController from "@/resources/product/product.controller";

const app = new App([new ProductController()]).app;
const request = supertest(app);

describe("Product", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await connect(mongoServer.getUri(), { dbName: "riteshop-test" });
  });

  afterAll(async () => {
    await disconnect();
    await connection.close();
  });

  describe(`POST /api/products`, () => {
    test("It should create a new product", (done) => {
      request
        .post("/api/products")
        .send({
          name: "first",
          description: "first product",
          price: 600,
          quantity: 300,
        })
        .expect(201)
        .then((res) => {
          expect(res.body._id).toBeTruthy();
          expect(res.body.name).toBe("first");
          done();
        });
    });

    test("product should not be created if validation fails", (done) => {
      request
        .post("/api/products")
        .send({
          description: "first product",
          price: 600,
          quantity: 300,
        })
        .expect(400, done);
    });
  });

  describe(`GET /api/products`, () => {
    test("should return all products", (done) => {
      request
        .get("/api/products")
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveLength(1);
          done();
        });
    });
  });

  describe(`GET /api/products/:id`, () => {
    test("should return a single product with matching ID", async () => {
      const oldProduct = await request
        .post("/api/products")
        .send({
          name: "bed spread",
          description: "bed spreads are good for you",
          price: 1000,
          quantity: 100,
        })
        .expect(201);

      const oldID = oldProduct.body._id;

      request
        .get(`/api/products/${oldID}`)
        .expect(200)
        .then((res) => {
          expect(res.body._id).toBe(oldID);
          expect(res.body.description).toBe(oldProduct.body.description);
        });
    });
  });

  // TODO: Fix 404 error
  describe.skip(`GET /api/products/search/:name`, () => {
    test("should return products that match search term", (done) => {
      request
        .get("/api/products/search/fir")
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveLength(1);
          done();
        });
    });

    test("should fuzzy match search term", (done) => {
      request
        .get("/api/products/search/spreod")
        .expect(200)
        .then((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body.name).toBe("bed spread");
          done();
        });
    });
  });

  describe(`EDIT /api/products/:id`, () => {
    test("should update a product", async () => {
      const oldProduct = await request
        .post("/api/products")
        .send({
          name: "second",
          description: "second product",
          price: 200,
          quantity: 100,
        })
        .expect(201);

      const oldID = oldProduct.body._id;
      const product = {
        name: "third",
        description: "third product",
        price: 500,
        quantity: 200,
      };

      await request
        .put(`/api/products/${oldID}`)
        .send(product)
        .expect(200)
        .then((res) => {
          expect(res.body._id).toBe(oldID);
          expect(res.body.name).toBe("third");
        });
    });

    test("product should not be updated if validation fails", async () => {
      const oldProduct = await request
        .post("/api/products")
        .send({
          name: "fourth",
          description: "fourth product",
          price: 400,
          quantity: 400,
        })
        .expect(201);

      const oldID = oldProduct.body._id;
      const product = {
        name: "third",
        description: "third product",
        quantity: 200,
      };

      await request.put(`/api/products/${oldID}`).send(product).expect(400);
    });
  });

  describe(`DELETE /api/products/:id`, () => {
    test("should delete a single product with matching ID", async () => {
      const oldProduct = await request
        .post("/api/products")
        .send({
          name: "suitcases",
          description: "suitcases for travelling",
          price: 5000,
          quantity: 1200,
        })
        .expect(201);

      const oldID = oldProduct.body._id;

      request.get(`/api/products/${oldID}`).expect(200);
      request.delete(`/api/products/${oldID}`).expect(204);
      request.get(`/api/products/${oldID}`).expect(400);
    });
  });
});
