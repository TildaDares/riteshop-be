import supertest from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connect, disconnect, connection } from "mongoose";
import App from "@/app";
import UserController from "@/resources/user/user.controller";
import UserModel from "@/resources/user/user.model";
import { ADMIN, CUSTOMERONE as CUSTOMER } from "./seed";

const app = new App([new UserController()]).app;
const request = supertest(app);
let customerToken: string;
let adminToken: string;
let customerId: string;
let adminId: string;

describe("User", () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await connect(mongoServer.getUri(), { dbName: "riteshop-test" });
    UserModel.create(ADMIN); // create admin user
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

    test("registration should fail if validation fails", async () => {
      const res = await request
        .post("/api/users/register")
        .send({
          name: "failure",
          password: "failuresarefailures",
        })

      expect(res.statusCode).toEqual(400);
    });
  });

  describe(`POST /api/users/login`, () => {
    test("should log user in(ADMIN)", async () => {
      const res = await request
        .post("/api/users/login")
        .send({
          email: ADMIN.email,
          password: ADMIN.password,
        })

      expect(res.statusCode).toEqual(200);
      expect(res.body.token).toBeTruthy();
      adminToken = res.body.token;
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
      expect(res.body.user.role).toBe("customer");
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

    test("should return 403 error if user is not logged in", async () => {
      const res = await request
        .get('/api/users')

      expect(res.statusCode).toEqual(403);
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
  });

  describe(`PUT /api/users/:id`, () => {
    test("should update a user", async () => {
      const user = {
        name: "admin upgraded",
        email: ADMIN.email,
      };

      const res = await request
        .put(`/api/users/${adminId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(user)

      expect(res.statusCode).toEqual(200);
      expect(res.body.user._id).toBe(adminId);
      expect(res.body.user.name).toBe("admin upgraded");
    });

    test("user should not be updated if validation fails", async () => {
      const res = await request
        .put(`/api/users/${customerId}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          email: CUSTOMER.email,
        })

      expect(res.statusCode).toEqual(400);
    });
  });

  describe(`PUT /api/users/change-password/:id`, () => {
    test("should update a user's password", async () => {
      const passwords = {
        oldPassword: CUSTOMER.password,
        newPassword: "newpasswordsarefun",
        confirmNewPassword: "newpasswordsarefun"
      };

      const res = await request
        .put(`/api/users/change-password/${customerId}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send(passwords)

      expect(res.statusCode).toEqual(200);
      expect(res.body.user._id).toBe(customerId);

      // logging in with old password should fail
      await request
        .post("/api/users/login")
        .send({
          email: CUSTOMER.email,
          password: CUSTOMER.password,
        })
        .expect(400)

      // logging in with new password should succeed
      await request
        .post("/api/users/login")
        .send({
          email: CUSTOMER.email,
          password: "newpasswordsarefun",
        })
        .expect(200)
    });

    test("password should not be updated if oldPassword doesn't match with curent password", async () => {
      const passwords = {
        oldPassword: "idontliketomatch",
        newPassword: "newpasswordsarefun",
        confirmNewPassword: "newpasswordsarefun"
      };

      const res = await request
        .put(`/api/users/change-password/${customerId}`)
        .set("Authorization", `Bearer ${customerToken}`)
        .send(passwords)

      expect(res.statusCode).toEqual(400);
    });
  });

  // https://github.com/yeahoffline/redis-mock/issues/197
  describe.skip(`POST /api/users/logout`, () => {
    test("should log user out", async () => {
      const reqLogout = await request
        .post('/api/users/logout')
        .set("Authorization", `Bearer ${customerToken}`) // logout customer
        .expect(200)

      expect(reqLogout.body.message).toEqual("Token invalidated")

      const verifyLogout = await request
        .get(`/api/users/${customerId}`)
        .set("Authorization", `Bearer ${customerToken}`) // verify customer is logged out
        .expect(401);

      expect(verifyLogout.body.message).toEqual("JWT rejected")

      const res = await request
        .post("/api/users/login")
        .send({
          email: CUSTOMER.email,
          password: CUSTOMER.password,
        })
        .expect(200); // log customer back in

      customerToken = res.body.token;
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
