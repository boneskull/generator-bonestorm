import Generator from 'yeoman-generator';
import _ from 'lodash/fp';
import {mergePackageJSON} from '../util';
import path from 'path';
import rootPkg from '../../package.json';

export default class BonestormBabel extends Generator {
  constructor (args, opts) {
    super(args, opts);

    this.sourceRoot(
      path.join(__dirname, '..', '..', 'templates', path.basename(__dirname)));

    this.props = opts;
  }

  writing () {
    mergePackageJSON(this, {
      devDependencies: _.pick([
        'babel-cli',
        'babel-plugin-add-module-exports',
        'babel-preset-env',
        'babel-register'
      ], rootPkg.devDependencies),
      scripts: {
        build: 'babel --source-maps --out-dir dist src',
        'build:watch': 'babel --source-maps --watch --out-dir dist src'
      }
    });

    this.fs.copyTpl(this.templatePath('.babelrc'),
      this.destinationPath('.babelrc'), {
        engine: this.props.engine
      });
  }
}
