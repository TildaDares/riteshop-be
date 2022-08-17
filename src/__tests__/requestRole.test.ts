import supertest from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { connect, disconnect, connection } from "mongoose";
import App from "@/app";
import UserController from "@/resources/user/user.controller";
import UserModel from "@/resources/user/user.model";
import RequestRoleController from "@/resources/request-role/requestRole.controller";
import { ADMIN, CUSTOMERONE, CUSTOMERTWO } from "./seed";

const app = new App([new UserController(), new RequestRoleController()]).app;
const request = supertest(app);
let requesterId1: string;
let requesterId2: string;
let requestRoleId1: string;
let requestRoleId2: string;
let customerToken: string; // requested to be a salesagent
let customerToken2: string; // requested to be an admin
let adminToken: string;

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
  });

  afterAll(async () => {
    await disconnect();
    await connection.close();
  });

  describe(`POST /api/request-role`, () => {
    test("should request for role[sales-agent]", async () => {
      const res = await request
        .post("/api/request-role")
        .send({
          requestedRole: "salesagent",
        })
        .set("Authorization", `Bearer ${customerToken}`)

      expect(res.statusCode).toEqual(201);
      expect(res.body.request.requestedRole).toEqual("salesagent");
      expect(res.body.request.status).toEqual('pending');
      requestRoleId1 = res.body.request._id;
      requesterId1 = res.body.request.requester;
    });

    test("should request for role[admin]", async () => {
      const res = await request
        .post("/api/request-role")
        .send({
          requestedRole: "admin",
        })
        .set("Authorization", `Bearer ${customerToken2}`)

      expect(res.statusCode).toEqual(201);
      expect(res.body.request.requestedRole).toEqual("admin");
      expect(res.body.request.status).toEqual('pending');
      requestRoleId2 = res.body.request._id;
      requesterId2 = res.body.request.requester;
    });

    test("should return 400 if user already has a request", async () => {
      const res = await request
        .post("/api/request-role")
        .send({
          requestedRole: "salesagent",
        })
        .set("Authorization", `Bearer ${customerToken2}`)

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual("Only one request per user is allowed");
    });

    test("should return 400 if requested role is not allowed", async () => {
      const res = await request
        .post("/api/request-role")
        .send({
          requestedRole: "super-admin",
        })
        .set("Authorization", `Bearer ${customerToken}`)

      expect(res.statusCode).toEqual(400);
    });
  })

  describe(`GET /api/request-role`, () => {
    test("should return all requests", async () => {
      const res = await request
        .get("/api/request-role")
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.requests).toHaveLength(2);
    });

    test("should return 401 if user is not admin", async () => {
      const res = await request
        .get("/api/request-role")
        .set("Authorization", `Bearer ${customerToken2}`)

      expect(res.statusCode).toEqual(401);
    });
  })

  describe(`GET /api/request-role/requests`, () => {
    test("should return all requests created by the logged user", async () => {
      const res = await request
        .get("/api/request-role/requests")
        .set("Authorization", `Bearer ${customerToken2}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.requests).toHaveLength(1);
      expect(res.body.requests[0].requester).toEqual(requesterId2);
    });
  })

  describe(`GET /api/request-role/requests/:requester`, () => {
    test("should return all requests created by a user", async () => {
      const res = await request
        .get(`/api/request-role/requests/${requesterId1}`)
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.requests).toHaveLength(1);
      expect(res.body.requests[0].requester).toEqual(requesterId1);
    });
  })

  describe(`GET /api/request-role/:id`, () => {
    test("should return all requests that match with id", async () => {
      const res = await request
        .get(`/api/request-role/${requestRoleId1}`)
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.request._id).toEqual(requestRoleId1);
    });
  })

  describe(`PUT /api/request-role/:id`, () => {
    test("should approve request and update user role", async () => {
      const res = await request
        .put(`/api/request-role/${requestRoleId1}`)
        .send({
          status: "approved"
        })
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.request.status).toEqual('approved');
      expect(res.body.request._id).toEqual(requestRoleId1);

      const resCust = await request
        .get(`/api/users`)
        .set("Authorization", `Bearer ${customerToken}`)

      expect(resCust.statusCode).toEqual(200);
      expect(resCust.body.user.role).toEqual('salesagent'); // check if user role is updated
    });

    test("should not allow approval/denial of request if user is not admin", async () => {
      const res = await request
        .put(`/api/request-role/${requestRoleId1}`)
        .send({
          status: "approved"
        })
        .set("Authorization", `Bearer ${customerToken}`)

      expect(res.statusCode).toEqual(401);
    });

    test("should not update user role if request is rejected", async () => {
      const res = await request
        .put(`/api/request-role/${requestRoleId2}`)
        .send({
          status: "rejected"
        })
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.statusCode).toEqual(200);
      expect(res.body.request.status).toEqual('rejected');
      expect(res.body.request._id).toEqual(requestRoleId2);

      const resCust = await request
        .get(`/api/users`)
        .set("Authorization", `Bearer ${customerToken2}`)

      expect(resCust.statusCode).toEqual(200);
      expect(resCust.body.user.role).toEqual('customer'); // check if user role is updated
    });

    test("should prevent admin from changing requests that have ben approved/rejected", async () => {
      const res = await request
        .put(`/api/request-role/${requestRoleId2}`)
        .send({
          status: "rejected"
        })
        .set("Authorization", `Bearer ${adminToken}`)

      expect(res.statusCode).toEqual(404);
    });
  })
});
