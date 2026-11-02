function requireOwner(ctx) {

    if (ctx.isOwner) {

        return true;

    }

    throw new Error(
        "OWNER_ONLY"
    );

}



function requireAdmin(ctx) {

    if (
        ctx.isAdmin ||
        ctx.isOwner ||
        ctx.isMaster
    ) {

        return true;

    }

    throw new Error(
        "ADMIN_ONLY"
    );

}



function permissionMessage(error) {

    if (
        error.message === "OWNER_ONLY"
    ) {

        return "❌ Este comando é exclusivo do dono.";

    }


    if (
        error.message === "ADMIN_ONLY"
    ) {

        return "❌ Apenas admins podem usar este comando.";

    }


    return null;

}



module.exports = {

    requireOwner,

    requireAdmin,

    permissionMessage

};