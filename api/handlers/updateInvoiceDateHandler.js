import "dotenv/config";
import logic from "../logic/index.js";
import jwt from "../utils/jsonwebtoken-promised.js";
import { CredentialsError } from "com/errors.js";

const { JWT_SECRET } = process.env;

export default ((req, res, next) => {
  try {
    const token = req.headers.authorization.slice(7);
    const { invoiceId } = req.params;
    const { invoiceDate } = req.body;
    console.log('updateInvoiceDateHandler: params=', req.params, 'body=', req.body);

    jwt.verify(token, JWT_SECRET)
      .then(({ sub: userId }) => {
        logic.updateInvoiceDate(userId, invoiceId, invoiceDate)
          .then((invoice) => res.status(200).json(invoice))
          .catch(error => next(error));
      })
      .catch(error => next(new CredentialsError(error.message)));
  } catch (error) {
    next(error);
  }
});
