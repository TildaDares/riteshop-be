import supertest from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connect, disconnect, connection } from "mongoose";
import App from "@/app";
import UserController from "@/resources/user/user.controller";

const app = new App([new UserController()]).app;
const request = supertest(app);
const ADMIN = { name: "admin", email: "admin@example.com", password: "flamingoesarecute_12345", role: "admin" };
const CUSTOMER = { name: "customer one", email: "customerone@gmail.com", password: "ilovemangoes", role: "customer" };
let customerToken: string | null = null;
let adminToken: string | null = null;
let customerId: string | null = null;
let adminId: string | null = null;

describe("User", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await connect(mongoServer.getUri(), { dbName: "riteshop-test" });
  });

  afterAll(async () => {
    await disconnect();
    await connection.close();
  });

  describe(`POST /api/users`, () => {
    test("should register a new user with customer role", async () => {
      const res = await request
        .post("/api/users/register")
        .send(CUSTOMER)
        .expect(201)

      expect(res.statusCode).toEqual(201);
      expect(res.body.token).toBeTruthy();
      customerToken = res.body.token;
    });

    test("should register a new user with admin role", async () => {
      const res = await request
        .post("/api/users/register")
        .send(ADMIN)

      expect(res.statusCode).toEqual(201);
      expect(res.body.token).toBeTruthy();
      adminToken = res.body.token;
    });

    test("registration should fail if validation fails", async () => {
      const res = await request
        .post("/api/users/register")
        .send({
          name: "failure",
          password: "failuresarefailures",
          role: "salesagent",
        })

      expect(res.statusCode).toEqual(400);
    });
  });

  describe(`POST /api/users/login`, () => {
    test("should log user in", async () => {
      const res = await request
        .post("/api/users/login")
        .send({
          email: CUSTOMER.email,
          password: CUSTOMER.password,
        })

      expect(res.statusCode).toEqual(200);
      expect(res.body.token).toBeTruthy();
    });

    test("login should fail if password or email is incorrect", async () => {
      const res = await request
        .post("/api/users/login")
        .send({
          email: ADMIN.email,
          password: "iloveoranges",
        })

      expect(res.statusCode).toEqual(400);
    });
  });

  describe(`GET /api/users`, () => {
    test("should return the logged in user", async () => {
      const res = await request
        .get('/api/users')
        .set("Authorization", `Bearer ${customerToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.user._id).toBeTruthy();
      expect(res.body.user.email).toBe(CUSTOMER.email);
      customerId = res.body.user._id;
    });

    test("should return the logged in user(ADMIN)", async () => {
      const res = await request
        .get('/api/users')
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.user._id).toBeTruthy();
      expect(res.body.user.email).toBe(ADMIN.email);
      adminId = res.body.user._id;
    });

    test("should return 401 error if user is not logged in", async () => {
      const res = await request
        .get('/api/users')

      expect(res.statusCode).toEqual(401);
    });
  });

  describe(`GET /api/users/:id`, () => {
    test("should get user with matching id if user is admin", async () => {
      const res = await request
        .get(`/api/users/${customerId}`)
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.user._id).toBeTruthy();
      expect(res.body.user.email).toBe(CUSTOMER.email);
    });

    test("should get user with matching if user.id is equal id", async () => {
      const res = await request
        .get(`/api/users/${customerId}`)
        .set("Authorization", `Bearer ${customerToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.user._id).toBeTruthy();
      expect(res.body.user.email).toBe(CUSTOMER.email);
    });

    test("should return 401 if logged in user is not admin or user.id !== id", async () => {
      const res = await request
        .get(`/api/users/${adminId}`)
        .set("Authorization", `Bearer ${customerToken}`)

      expect(res.statusCode).toEqual(401);
    });

    test("should return 401 error if user is not logged in", async () => {
      const res = await request
        .get('/api/users/')

      expect(res.statusCode).toEqual(401);
    });
  });

  describe(`EDIT /api/users/:id`, () => {
    test("should update a user", async () => {
      const user = {
        name: "admin upgraded",
        email: ADMIN.email,
        role: ADMIN.role,
        password: ADMIN.password,
      };

      const res = await request
        .put(`/api/users/${adminId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(user)

      expect(res.statusCode).toEqual(200);
      expect(res.body.user._id).toBe(adminId);
      expect(res.body.user.name).toBe("admin upgraded");
    });

    test("user role should not be updated if user is not admin ", async () => {
      const user = {
        name: "customer two",
        email: CUSTOMER.email,
        role: "admin",
        password: CUSTOMER.password,
      };

      const res = await request
        .put(`/api/users/${customerId}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send(user)

      expect(res.statusCode).toEqual(200);
      expect(res.body.user._id).toBe(customerId);
      expect(res.body.user.name).toBe("customer two");
      expect(res.body.user.role).toBe(CUSTOMER.role);
    });

    test("user should not be updated if validation fails", async () => {
      const res = await request
        .put(`/api/users/${customerId}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          name: "customer two",
          email: CUSTOMER.email,
          role: "customer",
        })

      expect(res.statusCode).toEqual(400);
    });
  });

  describe(`DELETE /api/users/:id`, () => {
    test("should delete a user with matching ID", async () => {
      await request
        .delete(`/api/users/${customerId}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .expect(204);

      request.get(`/api/users/${customerId}`).expect(400);
    });
  });
});
