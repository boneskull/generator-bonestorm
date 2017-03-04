import Generator from 'yeoman-generator';
import rootPkg from '../../package.json';
import _ from 'lodash/fp';
import {mergePackageJSON} from '../util';
import path from 'path';

export default class BonestormESLint extends Generator {
  constructor (args, opts) {
    super(args, opts);

    this.sourceRoot(
      path.join(__dirname, '..', '..', 'templates', path.basename(__dirname)));
  }

  writing () {
    mergePackageJSON(this, {
      devDependencies: _.pick([
        'eslint',
        'eslint-config-standard',
        'eslint-plugin-standard',
        'eslint-plugin-promise',
        'eslint-config-semistandard'
      ], rootPkg.devDependencies),
      scripts: {
        pretest: "eslint '*.js' src test --fix"
      }
    });

    this.fs.copy(this.templatePath('.eslintrc.yml'),
      this.destinationPath('.eslintrc.yml'));
  }
}
