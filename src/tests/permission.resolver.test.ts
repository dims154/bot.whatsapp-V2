import { PermissionResolver } from "../apps/bot/auth/PermissionResolver";

console.log("================================");
console.log("🧪 TEST PERMISSION RESOLVER");
console.log("================================");

function test(
    name: string,
    permissions: string[],
    requiredPermission: string,
    roles: string[],
    expected: boolean
) {

    const result =
        PermissionResolver.has(
            permissions,
            requiredPermission,
            roles
        );

    const passed =
        result === expected;

    console.log(
        `${passed ? "✅" : "❌"} ${name}`
    );

    console.log({
        permissions,
        requiredPermission,
        roles,
        result,
        expected
    });

    if (!passed) {
        throw new Error(
            `Test gagal: ${name}`
        );
    }
}


// =================================
// PUBLIC
// =================================

test(
    "Public user permission",
    [],
    "user",
    [],
    true
);

test(
    "Public everyone permission",
    [],
    "everyone",
    [],
    true
);


// =================================
// OWNER
// =================================

test(
    "Owner command dengan role Owner",
    [],
    "owner",
    ["Owner"],
    true
);

test(
    "Owner command tanpa Owner",
    [],
    "owner",
    ["User"],
    false
);


// =================================
// ADMIN
// =================================

test(
    "Admin command sebagai Admin",
    [],
    "admin",
    ["Admin"],
    true
);

test(
    "Admin command sebagai Owner",
    [],
    "admin",
    ["Owner"],
    true
);

test(
    "Admin command sebagai Super Admin",
    [],
    "admin",
    ["Super Admin"],
    true
);

test(
    "Admin command sebagai User",
    [],
    "admin",
    ["User"],
    false
);


// =================================
// DATABASE PERMISSION
// =================================

test(
    "User create memiliki permission",
    [
        "user.create"
    ],
    "user.create",
    ["Owner"],
    true
);

test(
    "User create tidak memiliki permission",
    [
        "user.read"
    ],
    "user.create",
    ["User"],
    false
);

test(
    "Role create memiliki permission",
    [
        "role.create",
        "role.read"
    ],
    "role.create",
    ["Admin"],
    true
);

test(
    "Business update tidak memiliki permission",
    [
        "business.read"
    ],
    "business.update",
    ["User"],
    false
);


// =================================
// RESULT
// =================================

console.log("");
console.log("================================");
console.log("🎉 SEMUA TEST BERHASIL");
console.log("================================");