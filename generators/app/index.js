'use strict';

const Generator = require('yeoman-generator');
const chalk = require('chalk');
const figlet = require('figlet');

class Bonestorm extends Generator {
  prompting () {
    // Have Yeoman greet the user.
    this.log(chalk.red.bold(figlet.textSync('bonestorm', {
      font: 'Slant'
    })));

    const prompts = [
      {
        type: 'confirm',
        name: 'someAnswer',
        message: 'Would you like to enable this option?',
        default: true
      }
    ];

    return this.prompt(prompts)
      .then(function (props) {
        // To access props later use this.props.someAnswer;
        this.props = props;
      }.bind(this));
  }

  writing () {
    this.fs.copy(this.templatePath('dummyfile.txt'),
      this.destinationPath('dummyfile.txt'));
  }

  install () {
    this.installDependencies();
  }
}

module.exports = Bonestorm;

