import supertest from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connect, disconnect, connection } from "mongoose";
import App from "@/app";
import ProductController from "@/resources/product/product.controller";
import UserController from "@/resources/user/user.controller";
import UserModel from "@/resources/user/user.model";
import { ADMIN, CUSTOMERONE } from "./seed";

const app = new App([new ProductController(), new UserController()]).app;
const request = supertest(app);
let customerToken: string;
let adminToken: string;

describe("Product", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await connect(mongoServer.getUri(), { dbName: "riteshop-test" });

    // create customer and admin users
    const resCustomer = await request
      .post("/api/users/register")
      .send(CUSTOMERONE)

    customerToken = resCustomer.body.token;

    await UserModel.create(ADMIN); // create admin user

    const resAdmin = await request
      .post("/api/users/login")
      .send({
        email: ADMIN.email,
        password: ADMIN.password,
      })

    adminToken = resAdmin.body.token;
  });

  afterAll(async () => {
    await disconnect();
    await connection.close();
  });

  describe(`POST /api/products`, () => {
    test("should create a new product", async () => {
      const res = await request
        .post("/api/products")
        .send({
          name: "first",
          description: "first product",
          price: 600,
          quantity: 300,
        })
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.statusCode).toEqual(201);
      expect(res.body.product._id).toBeTruthy();
      expect(res.body.product.name).toBe("first");
    });

    test("should return 401 if user is not admin", async () => {
      const res = await request
        .post("/api/products")
        .send({
          name: "tyres",
          description: "tyres for toy cars",
          price: 1000,
          quantity: 400,
        })
        .set("Authorization", `Bearer ${customerToken}`)

      expect(res.statusCode).toEqual(401);
    });

    test("product should not be created if validation fails", async () => {
      const res = await request
        .post("/api/products")
        .send({
          description: "first product",
          price: 600,
          quantity: 300,
        })
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.statusCode).toEqual(400);
    });
  });

  describe(`GET /api/products`, () => {
    test("should return all products", async () => {
      const res = await request
        .get("/api/products")

      expect(res.statusCode).toEqual(200);
      expect(res.body.products).toHaveLength(1);
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
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(201);

      const oldID = oldProduct.body.product._id;

      const res = await request
        .get(`/api/products/${oldID}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.product._id).toBe(oldID);
      expect(res.body.product.description).toBe(oldProduct.body.product.description);
    });
  });

  describe(`PUT /api/products/:id`, () => {
    test("should update a product", async () => {
      const oldProduct = await request
        .post("/api/products")
        .send({
          name: "second",
          description: "second product",
          price: 200,
          quantity: 100,
        })
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(201);

      const oldID = oldProduct.body.product._id;
      const product = {
        name: "third",
        description: "third product",
        price: 500,
        quantity: 200,
      };

      const res = await request
        .put(`/api/products/${oldID}`)
        .send(product)
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.product._id).toBe(oldID);
      expect(res.body.product.name).toBe("third");
    });

    test("product should not be updated if user is not admin", async () => {
      const oldProduct = await request
        .post("/api/products")
        .send({
          name: "fifth",
          description: "fifth product",
          price: 400,
          quantity: 400,
        })
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(201);

      const oldID = oldProduct.body.product._id;
      const product = {
        name: "fifth prod",
        description: "fifth product is updated",
        quantity: 100,
      };

      await request.put(`/api/products/${oldID}`)
        .send(product)
        .set("Authorization", `Bearer ${customerToken}`)
        .expect(401);
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
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(201);

      const oldID = oldProduct.body._id;
      const product = {
        name: "third",
        description: "third product",
        quantity: 200,
      };

      await request.put(`/api/products/${oldID}`)
        .send(product)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(400);
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
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(201);

      const oldID = oldProduct.body.product._id;

      await request.get(`/api/products/${oldID}`).expect(200);
      await request.delete(`/api/products/${oldID}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(204);
      await request.get(`/api/products/${oldID}`).expect(404);
    });

    test("should not delete a product if user is not admin", async () => {
      const oldProduct = await request
        .post("/api/products")
        .send({
          name: "bathing suits",
          description: "bathing suits for bathing",
          price: 1000,
          quantity: 1300,
        })
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(201);

      const oldID = oldProduct.body.product._id;

      await request.get(`/api/products/${oldID}`).expect(200);
      await request.delete(`/api/products/${oldID}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .expect(401);
      await request.get(`/api/products/${oldID}`).expect(200);
    });
  });
});
