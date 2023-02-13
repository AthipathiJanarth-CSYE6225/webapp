import request from "supertest";

import app from "app.js"
import express from 'express';


request(app);

//Unit Test to check server status
describe("GET /", function () {
    test("Check if API is working", async function () {
        const response = await request(app).get("/healthz");
        expect(response.status).toEqual(201);
    });
});

describe("GET /", function () {
    test("Check if retrieve is not working without authentication", async function () {
        const response = await request(app).get("/v1/user/2");
        expect(response.status).toEqual(401);
    });

});
describe("POST /", function () {
    test("Check if post is not working ", async function () {
        const response = await request(app).post("/v1/user");
        expect(response.status).toEqual(400);
    });

});
/*describe("GET /", function () {
    test("Check if retrieve is not working without authentication", async function () {
        const response = await request(app).get("/v1/user/2").auth(" ","ç");
        expect(response.status).toEqual(401);
    });

});*/

