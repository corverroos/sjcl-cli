#!/usr/bin/env node

'use strict';

const co = require('co');
const sjcl = require('sjcl');
const chalk = require('chalk');
const prompt = require('co-prompt');
const program = require('commander');

const encrypt = () => {
  co(function *() {
    let data = program.data
    if (!data) {
        data = yield prompt(chalk.yellow('Enter data: '));
    }

    let password = program.password
    if (!password) {
      password = yield prompt.password(chalk.yellow('Enter password: '));
      let confirmPassword = yield prompt.password(chalk.yellow('Confirm password: '));

      if (password !== confirmPassword) {
        console.error(chalk.red('\nPasswords do not match. Please try again.'));
        process.exit(1);
      }
    }

    const encryptedData = sjcl.encrypt(password, data);
    const decryptedData = sjcl.decrypt(password, encryptedData);

    if (data !== decryptedData) {
      console.error(chalk.red('\nThere we an error encrypting the data. Please try again'));
      process.exit(1);
    }

    if (program.quite) {
      console.log(encryptedData);
    } else {
      console.log(chalk.green('Encrypted data:\n\t\t %s'), encryptedData);
    }
  })
}

const decrypt = () => {
  co(function *() {
    let encryptedData = program.data
    if (!encryptedData) {
      encryptedData =  yield prompt(chalk.yellow('Enter encrypted data: '));
    }

    let password = program.password
    if (!password) {
      password = yield prompt.password(chalk.yellow('Enter password: '));
    }
    
    let decryptedData;

    try {
      decryptedData = sjcl.decrypt(password, encryptedData);
    } catch(error) {
      console.error(chalk.red('\nIncorrect password. Please try again.'));
      process.exit(1);
    }

    if (program.quite) {
      console.log(decryptedData)
    } else {
      console.log(chalk.green('Decrypted data:\n\t\t %s'), decryptedData);
    }
  })
}

program.option('-q, --quite', 'quiet (non-verbose) output')
program.option('-d, --data <data>', 'data to encrypt/decrypt')
program.option('-p, --password <password>', 'password to use for encryption/decryption')

program.command('encrypt')
       .description('encrypt raw data')

program.command('decrypt')
       .description('decrypt SJCL encrypted data')

program.on('encrypt', () => { encrypt() })
       .on('decrypt', () => { decrypt() })
       .on('*', () => { program.help() });

program.parse(process.argv);


