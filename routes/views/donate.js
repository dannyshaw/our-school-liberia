var keystone = require('keystone');
var Donation = keystone.list('Donation');
var DonationOptions = keystone.list('DonationOptions');
var paymentProcessor = require('../../lib/paypalPaymentProcessor');

exports = module.exports = function(req, res) {
  var view = new keystone.View(req, res);
  var locals = res.locals;

  // Set locals
  locals.formData = req.body || {};
  locals.validationErrors = {};

  view.query('donateOptions', DonationOptions.model.find());
  /*
     On POST request: User has clicked donate
  
    - Create Paypal payment, get paymentId
    - Add Donation item to the database, with paymentId as key
    - Redirect to Paypal auth screen
  */
  view.on('post', { action: 'pay' }, function(next) {
    const donationAmount = parseInt(req.body.donationAmount);
    const donatorName = req.body.name;
    console.log(`processing payment for donation of: ${donationAmount} from: ${donatorName}`);

    paymentProcessor.createPayment(
      donationAmount,
      function success(paymentId, redirectUrl) {
        var newSupporter = new Donation.model({
          key: paymentId,
        });
        var updater = newSupporter.getUpdateHandler(req);
        updater.process(
          req.body,
          {
            flashErrors: true,
            fields: 'name, email, donationAmount',
            errorMessage: 'There was a problem submitting your enquiry:',
          },
          function(err) {
            if (err) {
              locals.validationErrors = err.errors;
              next();
            } else {
              // redirect to Paypal to approve payment
              res.redirect(redirectUrl);
            }
          }
        );
      },
      function error() {
        req.flash(
          'error',
          'An internal error occured. Please contact the system administrator to verify your payment'
        );
        next();
      }
    );
  });

  /*
    Paypal has redirected back to us and we need to handle either:
     - success meaning:
        - the user has made a payment and we receive a paymentId (token)
        - We execute the payment then update our db
     - cancel meaning:
        - the user has cancelled
  */
  view.on('get', function(next) {
    if (req.query.outcome == 'success') {
      const payerId = req.query.PayerID;
      const paymentId = req.query.paymentId;

      keystone
        .list('Donation')
        .model.findOne({ key: paymentId })
        .exec(function(err, donationRecord) {
          if (donationRecord) {
            console.log(
                'donationRecord found: ' +
                donationRecord.name + 
                ' donation amount: ' +
                donationRecord.donationAmount
            );

            // finalize payment on paypal
            paymentProcessor.executePayment(
              payerId,
              paymentId,
              donationRecord.donationAmount,
              function success(payment) {
                donationRecord.paymentCompleted = 'true';
                donationRecord.payerId = payerId;
                //TODO: add payerId to model
                donationRecord.save(function(err) {
                  console.log('donator updated...');
                  req.flash('success', 'Payment complete. Thank you for your donation!');
                  next();
                });
              },
              function error(errorMessage) {
                req.flash(
                  'warning',
                  'An internal error occured. Please contact the system administrator to verify your payment'
                );
                next();
              }
            );
          } else {
            req.flash(
              'error',
              'An internal error occured. Please contact the system administrator to verify your payment'
            );
            next();
          }
        });
    } else if (req.query.outcome == 'cancel') {
      req.flash('warning', 'Your payment has been cancelled. You have not been charged.');
      next();
    } else {
      next();
    }
  });

  view.render('donate');
};
