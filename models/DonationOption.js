var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Donation Model
 * =============
 */

var DonationOption = new keystone.List('DonationOptions', {
  label: 'Donation options',
  map: { name: 'title' },
  autokey: { path: 'slug', from: 'title', unique: true },
  sortable: true,
});

DonationOption.add({
  title: { type: String, required: true, default: 'Equipment', initial: true },
  value: { type: Number },
  image: { type: Types.CloudinaryImage },
  message: { type: Types.Textarea, height: 150 },
  createdAt: { type: Date, default: Date.now },
});

DonationOption.defaultSort = '-createdAt';
DonationOption.defaultColumns = 'title, donationAmount|20%, image|20%';
DonationOption.register();
