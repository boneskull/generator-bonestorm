import Generator from 'yeoman-generator';
import _ from 'lodash/fp';
import {mergePackageJSON} from '../util';
import path from 'path';

export default class BonestormNode extends Generator {
  constructor (args, opts) {
    super(args, opts);

    this.sourceRoot(
      path.join(__dirname, '..', '..', 'templates', path.basename(__dirname)));
  }

  async prompting () {
    // XXX: default not working
    const prompts = [
      {
        name: 'engine',
        message: 'Target (minimum) Node.js version',
        type: 'list',
        choices: [
          {
            name: 'v8.x (Carbon)',
            value: 8
          },
          {
            name: 'v6.x (Boron)',
            value: 6
          },
          {
            name: 'v4.x (Argon)',
            value: 4
          }
        ],
        default: 6
      }
    ];

    this.props = _.merge(this.props, await this.prompt(prompts));
  }

  default () {
    this.composeWith(require.resolve('../babel'), this.props);
  }

  writing () {
    mergePackageJSON(this, {
      engines: {
        node: `>=${this.props.engine}`
      }
    });
  }
}
