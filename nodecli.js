// CLI tool for node.js with common usage functionality
// handles multiple async inputs via interactive CLI
//
// multiple async inputs via interactive CLI
// default values
// alternate prompt key and question
// confirmation, and masking (for e.g. password input)
// callback with object hash of all user inputs
// TODO: add docs and tests
// TODO: flexible prompting
var defaults = function (target, source) {
  source = source || {};
  for (var key in source) {
    if (source.hasOwnProperty(key) && target[key] === undefined) {
      source[key] = target[key];
    }
  }
  return target;
};

var pw = require('pw');

var readline = require('readline');

module.exports = function(questions, options, callback) {

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    
    options = defaults({
      confirmFailMessage: 'values do not match',
      confirmPostPrefix: 'your answer was:',
      confirmMessage: 'is this correct? [n] >',
      confirmPrefix: 'confirm',
      promptSep: ' > ',
      confirmString: 'y',
      confirmStrToLower: true
    }, options);
    
    if (options.confirmPrefix.charAt(options.confirmPrefix.length - 1) !== ' ') {
      options.confirmPrefix += ' ';
    }
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    var answers = {};
    var queue = [];
    
    function write(msg) {
        process.stdout.write(msg);
    }

    function done() {
        if (options.doneMessage) {
          write(options.doneMessage);
        }
        rl.close();
        callback(null, answers);
    };

    function ask(inputs) {

        var input, defaultInput, confirm, prompt;

        var inputItem = inputs.shift();

        if (typeof inputItem === 'string') {
            input = inputItem;
            question = inputItem;
            defaultInput = false;
            confirm = false;
            mask = false;
        }
        else {
            input = Object.keys(inputItem)[0];
            defaultInput = inputItem[input];
            if ({}.toString.call(defaultInput) === '[object Object]') {
                confirm = defaultInput.confirm;
                question = defaultInput.question || input;
                mask = defaultInput.mask || false;
                defaultInput = defaultInput.defaultValue;
            }
            else {
                confirm = false;
                question = input;
                mask = false;
            }
        }

        
        if (defaultInput) question += ' [' + defaultInput + ']';
        question += options.promptSep;

        if (mask) {
            rl.close();
            var confirmPwd = function (pwd, confirmPwd) {
                if (pwd !== confirmPwd) {
                    console.log(options.confirmFailMessage);
                    inputs.unshift(inputItem);
                }
                else {
                    answers[input] = pwd;
                }
                if (inputs.length > 0) {
                    rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });
                    ask(inputs);
                }
                else done();

            };

            process.stdout.write(question);
            pw(function (password) {
                
                if (confirm) {
                    write(options.confirmPrefix + question);
                    pw(function (confirmPassword) {
                        confirmPwd(password, confirmPassword);
                    });
                }
                else confirmPwd(password, password);
            });
        }
        else {
            rl.question(question, function (answer) {

                var resolve = function (confirmed, answer) {
                    if (confirmed) answers[input] = answer;
                    else inputs.unshift(inputItem);
                    if (inputs.length > 0) ask(inputs);
                    else done();
                };

                if (answer.length === 0 && defaultInput)
                    answer = defaultInput;

                if (confirm) {
                    console.log(options.confirmPostPrefix, answer);
                    rl.question(options.confirmMessage, function (confirmAnswer) {
                      if (options.confirmStrToLower) {
                        confirmAnswer = confirmAnswer.toLowerCase();
                      }
                      resolve(confirmAnswer === options.confirmString, answer);
                    });
                }
                else {
                    resolve(true, answer);
                }

            });
        }
    }

    ask(questions);
};