import 'source-map-support/register';
import path from 'path';
import Generator from 'yeoman-generator';
import chalk from 'chalk';
import figlet from 'figlet';
import _ from 'lodash/fp';
import parseAuthor from 'parse-author';
import inquirerNpmName from 'inquirer-npm-name';
import {mergePackageJSON} from '../util';
import Promise from 'bluebird';
import awful from 'awful';

export default class Bonestorm extends Generator {
  constructor (args, opts) {
    super(args, opts);

    this.sourceRoot(
      path.join(__dirname, '..', '..', 'templates', path.basename(__dirname)));

    this.option('target', {
      description: 'Target environment',
      type: String
    });

    this.option('private', {
      description: 'Private project',
      type: Boolean
    });

    this.option('name', {
      desc: 'Project name',
      type: String
    });

    this.option('githubUser', {
      type: String,
      desc: 'GitHub username or org'
    });
  }

  initializing () {
    this.log(chalk.red.bold(figlet.textSync('bonestorm', {
      font: 'Slant'
    })));

    const pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    const props = _.pick([
      'name',
      'description',
      'version',
      'homepage',
      'issues',
      'license'
    ], pkg);

    const author = _.isObject(pkg.author) ? pkg.author : parseAuthor(
      pkg.author || '');

    props.authorName = author.name;
    props.authorEmail = author.email;
    props.authorUrl = author.url;

    this.props = props;
    this.pkg = pkg;
  }

  async _promptModuleName () {
    if (this.pkg.name || this.options.name) {
      return this.pkg.name || _.kebabCase(this.options.name);
    }

    const props = await inquirerNpmName({
      name: 'name',
      message: 'Module name',
      default: path.basename(process.cwd()),
      filter: _.kebabCase,
      validate: str => Boolean(str.length)
    }, this);

    return props.name;
  }

  async _promptGithubUser () {
    if (this.options.githubUser) {
      return this.options.githubUser;
    }

    const githubUser = await Promise.fromNode(this.user.github.username);

    if (githubUser) {
      return githubUser;
    }

    const props = await this.prompt({
      type: 'input',
      name: 'githubUser',
      message: 'GitHub username',
      default: githubUser,
      store: true
    });

    return props.githubUser;
  }

  async prompting () {
    this.props.name = await this._promptModuleName();
    this.props.githubUser = await this._promptGithubUser();

    const prompts = [
      {
        name: 'description',
        message: 'Module description',
        when: !this.props.description,
        default: `my ${awful.random()} module`
      },
      {
        name: 'homepage',
        message: 'Project homepage URL',
        when: !this.props.homepage,
        default: `https://github.com/${this.props.githubUser}/${this.props.name}`
      },
      {
        name: 'authorName',
        message: "Author's Name",
        when: !this.props.authorName,
        default: this.user.git.name(),
        store: true
      },
      {
        name: 'authorEmail',
        message: "Author's Email",
        when: !this.props.authorEmail,
        default: this.user.git.email(),
        store: true
      },
      {
        name: 'authorUrl',
        message: "Author's Homepage",
        when: !this.props.authorUrl,
        store: true
      },
      {
        name: 'keywords',
        message: 'Package keywords (comma to split)',
        when: !this.pkg.keywords || !this.pkg.keywords.length,
        filter: words => _.compact(words.split(/\s*,\s*/g))
      },
      {
        name: 'useYarn',
        type: 'confirm',
        message: 'Use Yarn',
        when: _.isUndefined(this.options.useYarn)
      },
      {
        name: 'target',
        type: 'list',
        message: 'Target environment',
        choices: [
          {
            name: 'Node.js',
            value: 'node'
          }
        ],
        default: 'node',
        when: _.isUndefined(this.options.target)
      }
    ];

    this.props = _.merge(this.props, await this.prompt(prompts));
  }

  default () {
    if (this.props.target === 'node') {
      this.composeWith(require.resolve('../node'));
    }

    this.composeWith(require.resolve('generator-license'), {
      name: this.props.authorName,
      email: this.props.authorEmail,
      website: this.props.authorUrl,
      defaultLicense: this.props.license || 'Apache-2.0'
    });

    this.composeWith(require.resolve('../eslint'));
  }

  writing () {
    mergePackageJSON(this, {
      name: _.kebabCase(this.props.name),
      version: '0.0.0',
      description: this.props.description,
      homepage: this.props.homepage,
      author: {
        name: this.props.authorName,
        email: this.props.authorEmail,
        url: this.props.authorUrl
      },
      main: 'dist/index.js',
      files: [
        'dist',
        'src'
      ],
      keywords: this.props.keywords,
      devDependencies: {}
    });
  }

  installing () {
    if (this.props.useYarn) {
      this.yarnInstall();
    } else {
      this.npmInstall();
    }
  }
}
