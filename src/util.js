import _ from 'lodash/fp';

export function mergePackageJSON (generator, data) {
  const destPath = generator.destinationPath('package.json');
  const result = _.mergeWith((a, b) => {
    if (_.isArray(a)) {
      return _.uniq(a.concat(b));
    }
  }, data, generator.fs.readJSON(destPath, {}));
  generator.fs.extendJSON(destPath, result);
  return result;
}
