/**
 * Helpers for working with the EFF Civic CRM APIs.
 */

var path = require('path');
var url = require('url');

// load aws sdk
var aws = require('aws-sdk');

var emailUserCopyOfMessage = function(params, config, cb) {

  var awsConfig = config.get('CREDENTIALS.AWS');


  // load aws config
  aws.config.update(awsConfig);

  // load AWS SES
  var ses = new aws.SES({apiVersion: '2010-12-01'}); //TODO is this version the best one?

  // send to list
  var to = [params.contact_params.email];

  // this must relate to a verified SES account
  var from = 'example@example.com'; //TODO change to EFF email verified with AWS SES

  // this sends the email
  ses.sendEmail( {
     Source: from,
     Destination: { ToAddresses: to },
     Message: {
         Subject: {
            Data: 'Copy of your Democracy.io message'
         },
         Body: {
             Text: {
                 Data: params.message_params.message,
             }
          }
     }
  }

  , function(err, data) {
      if(err) throw err;
   });

};

module.exports.emailUserCopyOfMessage = emailUserCopyOfMessage;
