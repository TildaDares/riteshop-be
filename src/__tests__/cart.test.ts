import supertest from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connect, disconnect, connection } from "mongoose";
import App from "@/app";
import CartController from "@/resources/cart/cart.controller";
import ProductController from "@/resources/product/product.controller";
import UserController from "@/resources/user/user.controller";
import Product from "@/resources/product/product.interface";
import UserModel from "@/resources/user/user.model";
import { ADMIN, CUSTOMERONE, CUSTOMERTWO, PRODUCTONE, PRODUCTTWO } from "./seed";

const app = new App([new ProductController(), new UserController(), new CartController()]).app;
const request = supertest(app);
let customerToken: string;
let customerToken2: string;
let adminToken: string;
let product1: Product;
let product2: Product;

describe("Cart", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await connect(mongoServer.getUri(), { dbName: "riteshop-test" });

    // create users
    const resCust1 = await request
      .post("/api/users/register")
      .send(CUSTOMERONE)

    customerToken = resCust1.body.token;

    const resCust2 = await request
      .post("/api/users/register")
      .send(CUSTOMERTWO)

    customerToken2 = resCust2.body.token;

    await UserModel.create(ADMIN); // create admin user

    const resAdmin = await request
      .post("/api/users/login")
      .send({
        email: ADMIN.email,
        password: ADMIN.password,
      })

    adminToken = resAdmin.body.token;

    // create products
    const resProduct1 = await request
      .post("/api/products")
      .send(PRODUCTONE)
      .set("Authorization", `Bearer ${adminToken}`)

    product1 = resProduct1.body.product;

    const resProduct2 = await request
      .post("/api/products")
      .send(PRODUCTTWO)
      .set("Authorization", `Bearer ${adminToken}`)

    product2 = resProduct2.body.product;
  });

  afterAll(async () => {
    await disconnect();
    await connection.close();
  });

  describe(`POST /api/cart`, () => {
    let oldQuantity: number;
    let oldBill: number;
    test("should add product to cart", async () => {
      const res = await request
        .post("/api/cart")
        .send({
          item: {
            product: product1?._id,
            quantity: 20,
          }
        })
        .set("Authorization", `Bearer ${customerToken}`)

      expect(res.statusCode).toEqual(201);
      expect(res.body.cart.items).toHaveLength(1);
      expect(res.body.cart.items[0].product.toString()).toEqual(product1._id.toString());
      expect(res.body.cart.bill).toEqual(product1.price * res.body.cart.items[0].quantity);
      oldQuantity = res.body.cart.items[0].quantity;
    });

    test("should push product to cart", async () => {
      const res = await request
        .post("/api/cart")
        .send({
          item: {
            product: product2?._id,
            quantity: 30,
          }
        })
        .set("Authorization", `Bearer ${customerToken}`)

      expect(res.statusCode).toEqual(201);
      expect(res.body.cart.items).toHaveLength(2);
      expect(res.body.cart.items[1].product.toString()).toEqual(product2._id.toString());
      oldBill = product1.price * oldQuantity + product2.price * res.body.cart.items[1].quantity;
      expect(res.body.cart.bill).toEqual(oldBill);
    });

    test("should update product if already in cart", async () => {
      const quantity = 15;
      const res = await request
        .post("/api/cart")
        .send({
          item: {
            product: product1?._id,
            quantity,
          }
        })
        .set("Authorization", `Bearer ${customerToken}`)

      expect(res.statusCode).toEqual(201);
      expect(res.body.cart.items).toHaveLength(2);
      expect(res.body.cart.items[0].product._id.toString()).toEqual(product1._id.toString());
      expect(res.body.cart.items[0].quantity).toEqual(oldQuantity + quantity);
      expect(res.body.cart.bill).toEqual(oldBill + product1.price * quantity);
    });

    test("should return 404 if quantity is greater than product quantity", async () => {
      const quantity = product1.quantity + 1;
      const res = await request
        .post("/api/cart")
        .send({
          item: {
            product: product1?._id,
            quantity,
          }
        })
        .set("Authorization", `Bearer ${customerToken}`)

      expect(res.statusCode).toEqual(404);
    });
  });

  describe(`GET /api/cart`, () => {
    test("should get logged in user's cart", async () => {
      const res = await request
        .get("/api/cart")
        .set("Authorization", `Bearer ${customerToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.cart._id).toBeTruthy();
      expect(res.body.cart.items).toHaveLength(2);
    });

    test("should return 404 if user has no cart", async () => {
      const res = await request
        .get("/api/cart")
        .set("Authorization", `Bearer ${customerToken2}`)

      expect(res.statusCode).toEqual(404);
    });
  });

  describe(`PUT /api/cart`, () => {
    test("should update cart product quantity", async () => {
      const res = await request
        .put("/api/cart")
        .send({
          item: {
            product: product1?._id,
            quantity: 20,
          }
        })
        .set("Authorization", `Bearer ${customerToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.cart._id).toBeTruthy();
      expect(res.body.cart.items[0].quantity).toEqual(20);
    });

    test("should delete cart product if quantity is 0", async () => {
      // create product
      const prodRes = await request
        .post("/api/products")
        .send({
          name: "dummy cart product",
          description: "dummy cart product",
          price: 1000,
          quantity: 20,
        })
        .set("Authorization", `Bearer ${adminToken}`)

      expect(prodRes.statusCode).toEqual(201);

      const productId = prodRes.body.product._id;

      // add product to cart
      await request
        .post("/api/cart")
        .send({
          item: {
            product: productId,
            quantity: 10,
          }
        })
        .set("Authorization", `Bearer ${customerToken}`)
        .expect(201)

      // get user's cart
      const cartRes = await request
        .get("/api/cart")
        .set("Authorization", `Bearer ${customerToken}`)

      expect(cartRes.statusCode).toEqual(200);
      expect(cartRes.body.cart.items).toHaveLength(3);

      // update quantity to 0
      const res = await request
        .put("/api/cart")
        .send({
          item: {
            product: productId,
            quantity: 0,
          }
        })
        .set("Authorization", `Bearer ${customerToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.cart.items).toHaveLength(2);
    });

    test("should return 404 if product is not in cart", async () => {
      const res = await request
        .put("/api/cart")
        .send({
          item: {
            product: "62d9780e9bb5c650c53ee7d5", // product that does not exist
            quantity: 20,
          }
        })
        .set("Authorization", `Bearer ${customerToken}`)

      expect(res.statusCode).toEqual(404)
    });
  });

  describe(`DELETE /api/cart`, () => {
    test("should delete cart product", async () => {
      const getRes = await request
        .get("/api/cart")
        .set("Authorization", `Bearer ${customerToken}`)

      expect(getRes.statusCode).toEqual(200);
      expect(getRes.body.cart._id).toBeTruthy();
      expect(getRes.body.cart.items).toHaveLength(2);

      const res = await request
        .delete("/api/cart")
        .send({
          productId: product2._id,
        })
        .set("Authorization", `Bearer ${customerToken}`)
      expect(res.statusCode).toEqual(200);
      expect(res.body.cart.items).toHaveLength(1);
    });
  });

  describe(`DELETE /api/cart/empty`, () => {
    test("should empty cart", async () => {
      const res = await request
        .delete("/api/cart/empty")
        .set("Authorization", `Bearer ${customerToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.cart.items).toHaveLength(0);
    });
  });
});
