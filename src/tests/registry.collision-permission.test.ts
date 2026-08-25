import { CommandRegistry } from "../apps/bot/registry/CommandRegistry";
import { ICommand } from "../apps/bot/commands/interfaces/ICommand";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ICommandContext } from "../apps/bot/commands/interfaces/ICommandContext";

async function main() {
    console.log("========================================");
    console.log("🔐 RBAC SECURITY AUDIT");
    console.log("🧪 TEST: REGISTRY COLLISION & PERMISSION");
    console.log("========================================");

    const registry = new CommandRegistry();

    // ========================================
    // TEST 1: Valid command registration
    // ========================================
    console.log("\n✅ Test 1: Valid command registration");

    const validCommand: ICommand = {
        name: "test",
        aliases: ["t"],
        description: "Test command",
        category: "General",
        permission: "user",
        cooldown: 0,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        execute: async (_context: ICommandContext) => {}
    };

    try {
        registry.register(validCommand);
        console.log("✓ Valid command registered successfully");
    } catch (error) {
        console.error("✗ FAILED: Valid command should register", error);
        process.exit(1);
    }

    // ========================================
    // TEST 2: Duplicate command name collision
    // ========================================
    console.log("\n⚠️  Test 2: Duplicate command name collision");

    const duplicateCommand: ICommand = {
        name: "test", // Same as validCommand
        aliases: [],
        description: "Duplicate command",
        category: "General",
        permission: "user",
        cooldown: 0,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        execute: async (_context: ICommandContext) => {}
    };

    try {
        registry.register(duplicateCommand);
        console.error("✗ FAILED: Duplicate command name should throw error");
        process.exit(1);
    } catch (error: any) {
        if (
            error.message.includes("collision") &&
            error.message.includes("test")
        ) {
            console.log("✓ Duplicate command name blocked:", error.message);
        } else {
            console.error("✗ FAILED: Error message incomplete", error.message);
            process.exit(1);
        }
    }

    // ========================================
    // TEST 3: Duplicate alias collision
    // ========================================
    console.log("\n⚠️  Test 3: Duplicate alias collision");

    const duplicateAlias: ICommand = {
        name: "test2",
        aliases: ["t"], // Same alias as validCommand
        description: "Command with duplicate alias",
        category: "General",
        permission: "user",
        cooldown: 0,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        execute: async (_context: ICommandContext) => {}
    };

    try {
        registry.register(duplicateAlias);
        console.error("✗ FAILED: Duplicate alias should throw error");
        process.exit(1);
    } catch (error: any) {
        if (
            error.message.includes("collision") &&
            error.message.includes("t")
        ) {
            console.log("✓ Duplicate alias blocked:", error.message);
        } else {
            console.error("✗ FAILED: Error message incomplete", error.message);
            process.exit(1);
        }
    }

    // ========================================
    // TEST 4: Command name collides with existing alias
    // ========================================
    console.log("\n⚠️  Test 4: Command name vs existing alias collision");

    const nameVsAlias: ICommand = {
        name: "t", // Same as validCommand's alias
        aliases: [],
        description: "Command name same as existing alias",
        category: "General",
        permission: "user",
        cooldown: 0,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        execute: async (_context: ICommandContext) => {}
    };

    try {
        registry.register(nameVsAlias);
        console.error("✗ FAILED: Command name colliding with alias should throw error");
        process.exit(1);
    } catch (error: any) {
        if (
            error.message.includes("collision") &&
            error.message.includes("t")
        ) {
            console.log("✓ Command name vs alias collision blocked:", error.message);
        } else {
            console.error("✗ FAILED: Error message incomplete", error.message);
            process.exit(1);
        }
    }

    // ========================================
    // TEST 5: Alias collides with existing command name
    // ========================================
    console.log("\n⚠️  Test 5: Alias vs existing command name collision");

    const aliasVsName: ICommand = {
        name: "alias-test",
        aliases: ["test"], // Same as validCommand's name
        description: "Alias same as existing command",
        category: "General",
        permission: "user",
        cooldown: 0,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        execute: async (_context: ICommandContext) => {}
    };

    try {
        registry.register(aliasVsName);
        console.error("✗ FAILED: Alias colliding with command name should throw error");
        process.exit(1);
    } catch (error: any) {
        if (
            error.message.includes("collision") &&
            error.message.includes("test")
        ) {
            console.log("✓ Alias vs command name collision blocked:", error.message);
        } else {
            console.error("✗ FAILED: Error message incomplete", error.message);
            process.exit(1);
        }
    }

    // ========================================
    // TEST 6: Case-insensitive collision detection
    // ========================================
    console.log("\n⚠️  Test 6: Case-insensitive collision detection");

    const caseCollision: ICommand = {
        name: "TEST", // Different case
        aliases: [],
        description: "Same command, different case",
        category: "General",
        permission: "user",
        cooldown: 0,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        execute: async (_context: ICommandContext) => {}
    };

    try {
        registry.register(caseCollision);
        console.error("✗ FAILED: Case-insensitive collision should throw error");
        process.exit(1);
    } catch (error: any) {
        if (error.message.includes("collision")) {
            console.log("✓ Case-insensitive collision blocked:", error.message);
        } else {
            console.error("✗ FAILED: Error message incomplete", error.message);
            process.exit(1);
        }
    }

    // ========================================
    // TEST 7: Empty permission
    // ========================================
    console.log("\n⚠️  Test 7: Empty permission rejection");

    const emptyPermission: ICommand = {
        name: "empty-perm",
        aliases: [],
        description: "Command with empty permission",
        category: "General",
        permission: "" as any,
        cooldown: 0,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        execute: async (_context: ICommandContext) => {}
    };

    try {
        registry.register(emptyPermission);
        console.error("✗ FAILED: Empty permission should throw error");
        process.exit(1);
    } catch (error: any) {
        if (error.message.includes("Invalid permission metadata")) {
            console.log("✓ Empty permission blocked:", error.message);
        } else {
            console.error("✗ FAILED: Error message incomplete", error.message);
            process.exit(1);
        }
    }

    // ========================================
    // TEST 8: Whitespace-only permission
    // ========================================
    console.log("\n⚠️  Test 8: Whitespace-only permission rejection");

    const whitespacePermission: ICommand = {
        name: "whitespace-perm",
        aliases: [],
        description: "Command with whitespace permission",
        category: "General",
        permission: "   " as any,
        cooldown: 0,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        execute: async (_context: ICommandContext) => {}
    };

    try {
        registry.register(whitespacePermission);
        console.error("✗ FAILED: Whitespace-only permission should throw error");
        process.exit(1);
    } catch (error: any) {
        if (error.message.includes("Invalid permission metadata")) {
            console.log("✓ Whitespace-only permission blocked:", error.message);
        } else {
            console.error("✗ FAILED: Error message incomplete", error.message);
            process.exit(1);
        }
    }

    // ========================================
    // TEST 9: Permission with leading whitespace
    // ========================================
    console.log("\n⚠️  Test 9: Permission with leading whitespace rejection");

    const leadingWhitespace: ICommand = {
        name: "leading-ws-perm",
        aliases: [],
        description: "Command with leading whitespace permission",
        category: "General",
        permission: " user" as any,
        cooldown: 0,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        execute: async (_context: ICommandContext) => {}
    };

    try {
        registry.register(leadingWhitespace);
        console.error("✗ FAILED: Permission with leading whitespace should throw error");
        process.exit(1);
    } catch (error: any) {
        if (error.message.includes("Invalid permission metadata")) {
            console.log("✓ Permission with leading whitespace blocked:", error.message);
        } else {
            console.error("✗ FAILED: Error message incomplete", error.message);
            process.exit(1);
        }
    }

    // ========================================
    // TEST 10: Permission with trailing whitespace
    // ========================================
    console.log("\n⚠️  Test 10: Permission with trailing whitespace rejection");

    const trailingWhitespace: ICommand = {
        name: "trailing-ws-perm",
        aliases: [],
        description: "Command with trailing whitespace permission",
        category: "General",
        permission: "user " as any,
        cooldown: 0,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        execute: async (_context: ICommandContext) => {}
    };

    try {
        registry.register(trailingWhitespace);
        console.error("✗ FAILED: Permission with trailing whitespace should throw error");
        process.exit(1);
    } catch (error: any) {
        if (error.message.includes("Invalid permission metadata")) {
            console.log("✓ Permission with trailing whitespace blocked:", error.message);
        } else {
            console.error("✗ FAILED: Error message incomplete", error.message);
            process.exit(1);
        }
    }

    // ========================================
    // TEST 11: Invalid permission string
    // ========================================
    console.log("\n⚠️  Test 11: Invalid permission string rejection");

    const invalidPermission: ICommand = {
        name: "invalid-perm",
        aliases: [],
        description: "Command with invalid permission",
        category: "General",
        permission: "Super-Admin" as any, // Uppercase and hyphen - invalid
        cooldown: 0,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        execute: async (_context: ICommandContext) => {}
    };

    try {
        registry.register(invalidPermission);
        console.error("✗ FAILED: Invalid permission should throw error");
        process.exit(1);
    } catch (error: any) {
        if (error.message.includes("Invalid permission metadata")) {
            console.log("✓ Invalid permission blocked:", error.message);
        } else {
            console.error("✗ FAILED: Error message incomplete", error.message);
            process.exit(1);
        }
    }

    // ========================================
    // TEST 12: Valid permission - predefined
    // ========================================
    console.log("\n✅ Test 12: Valid predefined permission");

    for (const perm of ["user", "everyone", "admin", "owner"]) {
        const validPerm: ICommand = {
            name: `valid-perm-${perm}`,
            aliases: [],
            description: `Command with ${perm} permission`,
            category: "General",
            permission: perm as any,
            cooldown: 0,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            execute: async (_context: ICommandContext) => {}
        };

        try {
            registry.register(validPerm);
            console.log(`✓ Permission "${perm}" accepted`);
        } catch (error) {
            console.error(`✗ FAILED: Valid permission "${perm}" rejected`, error);
            process.exit(1);
        }
    }

    // ========================================
    // TEST 13: Valid permission - custom format
    // ========================================
    console.log("\n✅ Test 13: Valid custom permission format");

    const validCustomPerms = [
        "tenant.admin",
        "tenant.reader",
        "a.b.c",
        "custom_permission"
    ];

    for (const customPerm of validCustomPerms) {
        const validCustom: ICommand = {
            name: `valid-custom-perm-${customPerm.replace(/\./g, '-')}`,
            aliases: [],
            description: `Command with custom permission ${customPerm}`,
            category: "General",
            permission: customPerm as any,
            cooldown: 0,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            execute: async (_context: ICommandContext) => {}
        };

        try {
            registry.register(validCustom);
            console.log(`✓ Custom permission "${customPerm}" accepted`);
        } catch (error) {
            console.error(`✗ FAILED: Valid custom permission "${customPerm}" rejected`, error);
            process.exit(1);
        }
    }

    // ========================================
    // TEST 14: Empty alias in aliases array
    // ========================================
    console.log("\n⚠️  Test 14: Empty alias rejection");

    const emptyAlias: ICommand = {
        name: "empty-alias-cmd",
        aliases: [""],
        description: "Command with empty alias",
        category: "General",
        permission: "user",
        cooldown: 0,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        execute: async (_context: ICommandContext) => {}
    };

    try {
        registry.register(emptyAlias);
        console.error("✗ FAILED: Empty alias should throw error");
        process.exit(1);
    } catch (error: any) {
        if (error.message.includes("Invalid command name or alias")) {
            console.log("✓ Empty alias blocked:", error.message);
        } else {
            console.error("✗ FAILED: Error message incomplete", error.message);
            process.exit(1);
        }
    }

    // ========================================
    // TEST 15: Whitespace-only alias
    // ========================================
    console.log("\n⚠️  Test 15: Whitespace-only alias rejection");

    const whitespaceAlias: ICommand = {
        name: "whitespace-alias-cmd",
        aliases: ["   "],
        description: "Command with whitespace alias",
        category: "General",
        permission: "user",
        cooldown: 0,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        execute: async (_context: ICommandContext) => {}
    };

    try {
        registry.register(whitespaceAlias);
        console.error("✗ FAILED: Whitespace-only alias should throw error");
        process.exit(1);
    } catch (error: any) {
        if (error.message.includes("Invalid command name or alias")) {
            console.log("✓ Whitespace-only alias blocked:", error.message);
        } else {
            console.error("✗ FAILED: Error message incomplete", error.message);
            process.exit(1);
        }
    }

    // ========================================
    // TEST 16: Multiple aliases with internal collision
    // ========================================
    console.log("\n⚠️  Test 16: Internal alias collision detection");

    const internalCollision: ICommand = {
        name: "multi-alias",
        aliases: ["a1", "a2", "a1"], // Duplicate alias in same command
        description: "Command with duplicate aliases",
        category: "General",
        permission: "user",
        cooldown: 0,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        execute: async (_context: ICommandContext) => {}
    };

    try {
        registry.register(internalCollision);
        console.error("✗ FAILED: Internal alias collision should throw error");
        process.exit(1);
    } catch (error: any) {
        if (error.message.includes("collision")) {
            console.log("✓ Internal alias collision blocked:", error.message);
        } else {
            console.error("✗ FAILED: Error message incomplete", error.message);
            process.exit(1);
        }
    }

    // ========================================
    // Summary
    // ========================================
    console.log("\n========================================");
    console.log("✅ ALL TESTS PASSED");
    console.log("========================================");
    console.log("Collision detection: ✓");
    console.log("Permission validation: ✓");
    console.log("========================================");
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
