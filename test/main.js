const test = require('ava');
const got = require('got');
const { manifest } = require('pacote');

const plugins = require('../site/plugins.json');

const STRING_ATTRIBUTES = ['author', 'description', 'name', 'package', 'repo', 'status', 'version'];
const OPTIONAL_ATTRIBUTES = ['status'];
const ATTRIBUTES = [...STRING_ATTRIBUTES];
const ENUMS = {
  status: ['DEACTIVATED', undefined],
};

plugins.forEach((plugin) => {
  const { package: packageName, repo, version } = plugin;

  Object.entries(plugin).forEach(([attribute, value]) => {
    test(`Plugin attribute "${attribute}" should have a proper shape: ${packageName}`, (t) => {
      t.true(ATTRIBUTES.includes(attribute));

      const possibleValues = ENUMS[attribute];
      t.true(possibleValues === undefined || possibleValues.includes(value));

      if (value === undefined && OPTIONAL_ATTRIBUTES.includes(attribute)) {
        return;
      }

      if (STRING_ATTRIBUTES.includes(attribute)) {
        t.is(typeof value, 'string');
        t.not(value.trim(), '');
      }
    });
  });

  test(`Plugin package should be published: ${packageName}`, async (t) => {
    await t.notThrowsAsync(manifest(`${packageName}@${version}`));
  });

  test(`Plugin repository URL should be valid: ${packageName}`, async (t) => {
    await t.notThrowsAsync(got(repo));
  });
});
