var nodecli = require('../nodecli');

nodecli([
      'user name',
      { email: { confirm: true } },
      'age',
      { sex: 'male' },
      { happiness: { defaultValue: 'happy', confirm: true, question: 'how happy are you?' } },
      { password: { mask: true, confirm: true } }
    ], function(err, answers) {
      if (err) throw err;
      console.log('answers:');
    });