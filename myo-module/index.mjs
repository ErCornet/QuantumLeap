import GestureHandler from 'quantumleapjs';

handler = new GestureHandler({ requireRegistration: false });

exports.register = function() 
{
  handler.addListener('frame', (event) => {
    console.Log('Frame received!');
    console.log(event)
  })
}

