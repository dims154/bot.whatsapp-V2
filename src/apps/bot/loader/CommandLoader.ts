import { CommandRegistry } from "../registry/CommandRegistry";
import { AssignPermissionCommand } from "../commands/assign-permission.command";
import { PingCommand } from "../commands/ping.command";
import { AICommand } from "../commands/ai.command";
import { HelpCommand } from "../commands/help.command";
import { MenuCommand } from "../commands/menu.command";
import { AdminCommand } from "../commands/admin.command";
import { OwnerCommand } from "../commands/owner.command";
import { UserListCommand } from "../commands/user-list.command";
import { UserDetailCommand } from "../commands/user-detail.command";
import { CreateUserCommand } from "../commands/create-user.command";
import { AssignRoleCommand } from "../commands/assign-role.command";
import { DisableUserCommand } from "../commands/disable-user.command";
import { EnableUserCommand } from "../commands/enable-user.command";
import { DeleteUserCommand } from "../commands/delete-user.command";
import { RolesCommand } from "../commands/roles.command";
import { RoleCommand } from "../commands/role.command";
import { CreateRoleCommand } from "../commands/create-role.command";
import { AssignRolePermissionCommand } from "../commands/assign-role-permission.command";
import { PermissionsCommand } from "../commands/permissions.command";
import { PermissionCommand } from "../commands/permission.command";
import { CreatePermissionCommand } from "../commands/create-permission.command";
import { DeletePermissionCommand } from "../commands/delete-permission.command";

export class CommandLoader {

    constructor(
        private registry: CommandRegistry
    ) {}

    load(): void {

        // =========================
        // GENERAL
        // =========================

        this.registry.register(
            new PingCommand()
        );

        // =========================
        // AI
        // =========================

        this.registry.register(
            new AICommand()
        );

        // =========================
        // ADMIN
        // =========================

        this.registry.register(
            new AdminCommand()
        );
// =========================
// USER / RBAC
// =========================

this.registry.register(
    new AssignRoleCommand()
);

this.registry.register(
    new AssignPermissionCommand()
);
 // =========================
// USERS
// =========================

this.registry.register(
    new UserListCommand()
);

this.registry.register(
    new UserDetailCommand()
);

this.registry.register(
    new CreateUserCommand()
);

// =========================
// USER LIFECYCLE
// =========================

this.registry.register(
    new DisableUserCommand()
);
this.registry.register(
    new EnableUserCommand()
);
this.registry.register(
    new DeleteUserCommand()
);

// =========================
// ROLE
// =========================

this.registry.register(
    new RolesCommand()
);

this.registry.register(
    new RoleCommand()
);

this.registry.register(
    new CreateRoleCommand()
);

this.registry.register(
    new AssignRolePermissionCommand()
);

        // =========================
        // OWNER
        // =========================

        this.registry.register(
            new OwnerCommand()
        );

        // =========================
// PERMISSION
// =========================

this.registry.register(
    new PermissionsCommand()
);

this.registry.register(
    new PermissionCommand()
);

this.registry.register(
    new CreatePermissionCommand()
);

this.registry.register(
    new DeletePermissionCommand()
);
        // =========================
        // HELP & MENU
        // =========================

        this.registry.register(
            new HelpCommand(
                this.registry
            )
        );

        this.registry.register(
            new MenuCommand(
                this.registry
            )
        );
    }
}

