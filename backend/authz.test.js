/*
 * Verifies that workspace permissions are enforced by the BACKEND,
 * not just by hidden buttons in the UI.
 *
 * It mounts the real workspaceContext + authorizeWorkspaceRoles middleware
 * and the real deleteAsset / updateAsset controllers, with the Mongoose
 * models swapped out for in-memory fakes so no database is needed.
 *
 * Run with:  node authz.test.js
 */

const path = require("path");
const express = require("express");
const http = require("http");

const OWNER_ID = "aaaaaaaaaaaaaaaaaaaaaaa1";
const MEMBER_ID = "aaaaaaaaaaaaaaaaaaaaaaa2";
const OUTSIDER_ID = "aaaaaaaaaaaaaaaaaaaaaaa3";
const WS_A = "bbbbbbbbbbbbbbbbbbbbbbb1";
const WS_B = "bbbbbbbbbbbbbbbbbbbbbbb2";
const ASSET_A = "ccccccccccccccccccccccc1";
const ASSET_B = "ccccccccccccccccccccccc2";

// ---- fake data -------------------------------------------------------

const workspaces = {
    [WS_A]: {
        _id: WS_A,
        name: "Team A",
        owner: OWNER_ID,
        members: [
            { user: OWNER_ID, role: "OWNER" },
            { user: MEMBER_ID, role: "MEMBER" }
        ]
    },
    [WS_B]: {
        _id: WS_B,
        name: "Team B",
        owner: OUTSIDER_ID,
        members: [{ user: OUTSIDER_ID, role: "OWNER" }]
    }
};

let assets = {
    [ASSET_A]: { _id: ASSET_A, name: "Laptop", workspace: WS_A },
    [ASSET_B]: { _id: ASSET_B, name: "Printer", workspace: WS_B }
};

// ---- stub the models before the real code requires them ---------------

const stub = (relPath, value) => {
    const full = require.resolve(relPath);
    require.cache[full] = { id: full, filename: full, loaded: true, exports: value };
};

stub("./src/models/Workspace", {
    findById: async (id) => (workspaces[id] ? { ...workspaces[id] } : null),
    findOne: () => ({
        sort: async () => ({ ...workspaces[WS_A] })
    })
});

stub("./src/models/Asset", {
    findById: async (id) => (assets[id] ? { ...assets[id] } : null),
    findByIdAndDelete: async (id) => {
        const a = assets[id];
        delete assets[id];
        return a;
    },
    findByIdAndUpdate: (id, update) => ({
        populate: async () => ({ ...assets[id], ...update })
    })
});

const workspaceContext = require("./src/middleware/workspace.middleware");
const authorizeWorkspaceRoles = require("./src/middleware/workspaceRole.middleware");
const { deleteAsset, updateAsset } = require("./src/controllers/asset.controller");

// ---- app with a fake "logged in" user --------------------------------

const app = express();
app.use(express.json());

// stands in for the real JWT middleware
app.use((req, res, next) => {
    req.user = { _id: req.headers["x-test-user"] };
    next();
});

app.delete(
    "/assets/:id",
    workspaceContext,
    authorizeWorkspaceRoles("OWNER"),
    deleteAsset
);

app.put(
    "/assets/:id",
    workspaceContext,
    authorizeWorkspaceRoles("OWNER", "MEMBER"),
    updateAsset
);

app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});

// ---- tiny test runner -------------------------------------------------

const server = app.listen(0);
const port = server.address().port;

const call = (method, url, user, workspace, body) =>
    new Promise((resolve) => {
        const data = body ? JSON.stringify(body) : null;
        const req = http.request(
            {
                port,
                method,
                path: url,
                headers: {
                    "x-test-user": user,
                    ...(workspace ? { "x-workspace-id": workspace } : {}),
                    ...(data
                        ? { "Content-Type": "application/json", "Content-Length": data.length }
                        : {})
                }
            },
            (res) => {
                let raw = "";
                res.on("data", (c) => (raw += c));
                res.on("end", () =>
                    resolve({ status: res.statusCode, body: JSON.parse(raw || "{}") })
                );
            }
        );
        if (data) req.write(data);
        req.end();
    });

let passed = 0;
let failed = 0;

const check = (label, actual, expected) => {
    if (actual === expected) {
        console.log(`  PASS  ${label}  (${actual})`);
        passed++;
    } else {
        console.log(`  FAIL  ${label}  expected ${expected}, got ${actual}`);
        failed++;
    }
};

(async () => {

    console.log("\nAsset authorization\n");

    let r = await call("DELETE", `/assets/${ASSET_A}`, MEMBER_ID, WS_A);
    check("MEMBER calling DELETE directly is blocked", r.status, 403);

    check("...and the asset still exists", assets[ASSET_A] ? "yes" : "no", "yes");

    r = await call("PUT", `/assets/${ASSET_A}`, MEMBER_ID, WS_A, { name: "Laptop v2" });
    check("MEMBER can still edit an asset", r.status, 200);

    r = await call("DELETE", `/assets/${ASSET_A}`, OWNER_ID, WS_A);
    check("OWNER can delete", r.status, 200);

    check("...and the asset is gone", assets[ASSET_A] ? "yes" : "no", "no");

    console.log("\nWorkspace isolation\n");

    r = await call("DELETE", `/assets/${ASSET_B}`, OWNER_ID, WS_B);
    check("Non-member cannot touch another workspace", r.status, 403);

    r = await call("PUT", `/assets/${ASSET_B}`, OWNER_ID, WS_A, { name: "hack" });
    check("Cannot edit an asset from a different workspace", r.status, 403);

    console.log(`\n${passed} passed, ${failed} failed\n`);

    server.close();

    process.exit(failed ? 1 : 0);

})();
