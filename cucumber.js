module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    paths: ['features/**/*.feature'],
    require: ['tests/support/**/*.ts', 'tests/step_definitions/**/*.ts'],
    format: ['progress']
  }
};