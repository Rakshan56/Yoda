/**
 * Backwards-compatible hook entrypoint.
 *
 * New code should import from the domain module it belongs to:
 * games, pokemon, teams, user, helper, admin, or credits.
 */
export * from "./games";
export * from "./pokemon";
export * from "./teams";
export * from "./user";
export * from "./helper";
export * from "./admin";
export * from "./credits";
