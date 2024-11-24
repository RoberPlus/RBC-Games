/**
 * order controller
 */

import { factories } from '@strapi/strapi';
import Stripe from 'stripe';
import * as yup from 'yup';

const stripe = new Stripe(
  'sk_test_51QEbwTEAsCo6iA8ALDyhLSgnvurLBiKILKOGrfMVHtwT1x3rTgZp5bIH5CkFUDUOdLDBUlNWwbIYABCRjm6zNnMG00OJsaGTpD'
);

const OrderSchema = yup.object().shape({
  user: yup.number().required(),
  totalPayment: yup.number().required('Please Enter your password'),
  idPayment: yup.string().required(),
  addressShipping: yup.object().required(),
  products: yup.array().required(),
});

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async paymentOrder(ctx, next) {
    try {
      const { paymentIntentId, products, idUser, addressShipping, totalPayment } = ctx.request.body;

      const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
        metadata: {
          products: JSON.stringify(products),
          description: `User ID: ${idUser}`,
          amount: totalPayment,
        },
      });

      const data = {
        products: products,
        user: idUser,
        totalPayment,
        idPayment: paymentIntent.id,
        addressShipping: addressShipping,
      };

      const validateDate = await OrderSchema.validate(data);
      const entry = await strapi.db.query('api::order.order').create({ data: validateDate });

      return entry;
    } catch (err) {
      ctx.badRequest(`${err}Controller error`);
    }
  },
}));
