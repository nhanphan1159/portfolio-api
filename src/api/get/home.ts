import { Hono } from "hono";
import { ROUTE } from "../../constants/common";

export const getHome = (app: Hono<{ Bindings: IBindings }>) => {
  app.get(`${ROUTE.API}${ROUTE.HOME}`, (c) =>
    c.json({ message: "Welcome to my Portfolio API!" })
  );
};
