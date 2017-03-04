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
    const prompts = [
      {
        name: 'engine',
        message: 'Target (minimum) Node.js version',
        type: 'list',
        choices: [
          {
            name: 'v6.x (Boron)',
            value: 6
          },
          {
            name: 'v4.x (Argon)',
            value: 4
          }
        ],
        default: 4
      }
    ];

    this.props = _.merge(this.props, await this.prompt(prompts));
  }

  writing () {
    mergePackageJSON(this, {
      engines: {
        node: `>=${this.props.engine}`
      }
    });
  }
}
