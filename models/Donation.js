var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Donation Model
 * =============
 */

var Donation = new keystone.List('Donation', {
  label: 'Donation',
});

Donation.add({
  key: { type: Types.Key, noedit: true },
  payerId: { type: Types.Key, noedit: true },
  source: { type: Types.Select, options: ['paypal'], default: 'paypal' },
  name: { type: Types.Name },
  email: { type: Types.Email },
  donationAmount: { type: Number, required: true, initial: true  },
  paymentCompleted: { type: Boolean, default: false, noedit: true},
  published: { type: Boolean, default: false },  
  donatedAt: { type: Date, required: false, noedit: true },
  createdAt: { type: Date, default: Date.now, noedit: true },
});

// Automatically set the date of donation when payment has been processsed
Donation.schema.methods.isPaymentCompleted = function() {
console.log('isPaylmentcompleted: ', this.state, this)
  return this.state == true;
};

Donation.schema.pre('save', function(next) {
  if (
    this.isModified('paymentCompleted') &&
    this.isPaymentCompleted() &&
    !this.donatedAt
  ) {
    this.donatedAt = new Date();
  }
  next();
});

Donation.defaultColumns = 'name, email, donationAmount, paymentCompleted, published';
Donation.register();

// Donation.schema.pre('save', function(next) {
//   this.wasNew = this.isNew;
//   next();
// });

// Donation.schema.post('save', function() {
//   if (this.wasNew) {
//     this.sendNotificationEmail();
//   }
// });

// Donation.schema.methods.sendNotificationEmail = function(callback) {
//   if ('function' !== typeof callback) {
//     callback = function() {};
//   }

//   var donation = this;

//   keystone
//     .list('User')
//     .model.find()
//     .where('isAdmin', true)
//     .exec(function(err, admins) {
//       if (err) return callback(err);

//       new keystone.Email('donation-notification').send(
//         {
//           to: admins,
//           from: {
//             name: 'Our School Liberia',
//             email: 'contact@our-school-liberia.com',
//           },
//           subject: 'New Donation for Our School Liberia',
//           donation: donation,
//         },
//         callback
//       );
//     });
// };

Donation.defaultSort = '-createdAt';
Donation.defaultColumns = 'title, donationAmount|20%, image|20%';
Donation.register();

