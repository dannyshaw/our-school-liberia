var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * SupporterIndividual Model
 * =========================
 */

var SupporterIndividual = new keystone.List('SupporterIndividual', {
  map: { name: 'name' },
  sortable: true,
});


SupporterIndividual.add({
  name: { type: Types.Name, required: true },
});

SupporterIndividual.defaultColumns = 'name';
SupporterIndividual.register();
