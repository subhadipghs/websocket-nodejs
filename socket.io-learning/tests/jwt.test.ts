import test from "tape";
import { getToken, verifyToken } from "../lib/jwt";

test("should sign token correctly", async (t) => {
  t.plan(4);
  const user = {
    name: "john",
  };
  const token = (await getToken({ secret: "test", payload: user })) as string;
  t.ok(token);
  const decoded = (await verifyToken({ token, secret: "test" })) as any;
  t.deepEqual(decoded.name, user.name);
  t.equal(decoded.iss, "socket-io-server");
  t.equal(decoded.aud, "socket-io-client");
});
