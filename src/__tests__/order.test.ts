import supertest from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connect, disconnect, connection } from "mongoose";
import App from "@/app";
import CartController from "@/resources/cart/cart.controller";
import ProductController from "@/resources/product/product.controller";
import OrderController from "@/resources/order/order.controller";
import UserController from "@/resources/user/user.controller";
import UserModel from "@/resources/user/user.model";
import { ADMIN, CUSTOMERONE as CUSTOMER, CUSTOMERTWO, PRODUCTONE, PRODUCTTWO } from "./fixtures";
import Product from "@/resources/product/product.interface";

const app = new App([new ProductController(), new OrderController(), new UserController(), new CartController()]).app;
const request = supertest(app);
let customerToken: string;
let customerToken2: string;
let adminToken: string;
let product1: Product;
let product2: Product;
let bill: number;
let orderId: string;

describe("Orders", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await connect(mongoServer.getUri(), { dbName: "riteshop-test" });

    // create users
    const resCust1 = await request
      .post("/api/users/register")
      .send(CUSTOMER)

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

    // add products to cart
    await request
      .post("/api/cart")
      .send({
        item: {
          product: product1?._id,
          quantity: 20,
        }
      })
      .set("Authorization", `Bearer ${customerToken}`)

    const cart2 = await request
      .post("/api/cart")
      .send({
        item: {
          product: product2?._id,
          quantity: 30,
        }
      })
      .set("Authorization", `Bearer ${customerToken}`)

    bill = cart2.body.cart.bill
  });

  afterAll(async () => {
    await disconnect();
    await connection.close();
  });

  describe(`POST /api/orders`, () => {
    test("should create order", async () => {
      const cartRes = await request
        .get('/api/cart')
        .set("Authorization", `Bearer ${customerToken}`)

      expect(cartRes.body.cart.items).toHaveLength(2)

      const res = await request
        .post("/api/orders")
        .send({
          shippingFee: 15,
          shippingAddress: {
            address: 'Plot 2 Lagos',
            city: 'Ikeja',
            postalCode: '123456',
            tel: '23456789012',
            country: 'Nigeria'
          }
        })
        .set("Authorization", `Bearer ${customerToken}`)

      expect(res.statusCode).toEqual(201);
      expect(res.body.order.items).toHaveLength(2);
      expect(res.body.order.total).toEqual(bill + 15);
      orderId = res.body.order._id

      // cart should be empty after creating an order
      const cartRes2 = await request
        .get('/api/cart')
        .set("Authorization", `Bearer ${customerToken}`)

      expect(cartRes2.body.cart.items).toHaveLength(0)
    });

    test("should return 400 if validation fails", async () => {
      await request
        .post("/api/orders")
        .send({
          shippingAddress: {
            address: 'Plot 2 Lagos',
            city: 'Ikeja',
            postalCode: '123456',
            tel: '23456789012',
            country: 'Nigeria'
          }
        })
        .set("Authorization", `Bearer ${customerToken}`)
        .expect(400)
    });
  });

  describe(`GET /api/orders/all`, () => {
    test("should get all orders", async () => {
      const res = await request
        .get("/api/orders/all")
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.orders).toBeTruthy();
      expect(res.body.orders).toHaveLength(1);
    });

    test("should return 401 if user is not admin", async () => {
      await request
        .get("/api/orders/all")
        .set("Authorization", `Bearer ${customerToken}`)
        .expect(401)
    });
  });

  describe(`GET /api/orders/:id`, () => {
    test("should get all orders if user is owner of order", async () => {
      const res = await request
        .get(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${customerToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.order._id.toString()).toEqual(orderId);
      expect(res.body.order.items).toHaveLength(2);
    });

    test("should get all orders if user is admin", async () => {
      const res = await request
        .get(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.order._id.toString()).toEqual(orderId);
      expect(res.body.order.items).toHaveLength(2);
    });

    test("should return 401 if user is not owner of order", async () => {
      await request
        .get(`/api/orders/${orderId}`)
        .set("Authorization", `Bearer ${customerToken2}`)
        .expect(401)
    });
  });

  describe(`GET /api/orders/user/:userId`, () => {
    let customerId: string;
    test("should get all orders by user if order owner is logged in user", async () => {
      const customerRes = await request
        .get('/api/users')
        .set("Authorization", `Bearer ${customerToken}`)

      customerId = customerRes.body.user._id

      const res = await request
        .get(`/api/orders/user/${customerId}`)
        .set("Authorization", `Bearer ${customerToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.orders).toBeTruthy();
      expect(res.body.orders[0].user._id.toString()).toEqual(customerId);
    });

    test("should get all orders by user if logged in user is admin", async () => {
      const res = await request
        .get(`/api/orders/user/${customerId}`)
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.orders).toBeTruthy();
      expect(res.body.orders[0].user._id.toString()).toEqual(customerId);
    });

    test("should return 401 if user is not owner of order", async () => {
      await request
        .get(`/api/orders/user/${customerId}`)
        .set("Authorization", `Bearer ${customerToken2}`)
        .expect(401)
    });
  });

  describe(`PUT /api/orders/:id`, () => {
    test("should update order if logged in user is admin", async () => {
      const shippingAddress = {
        address: 'Mile 12',
        city: 'Meiran',
        postalCode: '654321',
        tel: '88956783921',
        country: 'USSD'
      }
      const res = await request
        .put(`/api/orders/${orderId}`)
        .send({
          shippingAddress
        })
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.order._id).toBeTruthy();
      expect(res.body.order.shippingAddress).toEqual(shippingAddress);
    });

    test("should update order if logged in user is order owner", async () => {
      const date = new Date().toISOString()
      const res = await request
        .put(`/api/orders/${orderId}`)
        .send({
          isDelivered: true,
          deliveredAt: date,
          isPaid: true
        })
        .set("Authorization", `Bearer ${customerToken}`)
      expect(res.statusCode).toEqual(200);
      expect(res.body.order._id).toBeTruthy();
      expect(res.body.order.isDelivered).toBeTruthy();
      expect(res.body.order.isPaid).toBeTruthy();
      expect(res.body.order.deliveredAt).toEqual(date);
    });

    test("should not update order if logged in user is not order owner", async () => {
      await request
        .put(`/api/orders/${orderId}`)
        .send({
          isDelivered: true,
          isPaid: true
        })
        .set("Authorization", `Bearer ${customerToken2}`)
        .expect(401)
    });
  });
});
