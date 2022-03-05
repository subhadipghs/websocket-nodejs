import jwt from "jsonwebtoken";

interface GetTokenOpts {
  secret: string;
  payload: string | object | Buffer;
  expiresIn?: string | number;
}

interface VerifyTokenOpts {
  token: string;
  secret: string;
}

// generate a jwt token
export function getToken({ secret, payload, expiresIn = 3600 }: GetTokenOpts) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      secret,
      {
        expiresIn,
        algorithm: "HS256",
        issuer: "socket-io-server",
        audience: "socket-io-client",
      },
      (error, enc) => {
        if (error) {
          reject(error);
        } else {
          resolve(enc);
        }
      }
    );
  });
}

// verify a token
export function verifyToken({ token, secret }: VerifyTokenOpts) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      secret,
      {
        algorithms: ["HS256"],
        audience: "socket-io-client",
        issuer: "socket-io-server",
      },
      (error, decoded) => {
        if (error) {
          reject(error);
        } else {
          resolve(decoded);
        }
      }
    );
  });
}
