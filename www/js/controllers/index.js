// TODO(leah): Could just use require-dir to figure this stuff out.

module.exports = {
  AboutController: require('./about'),
  AddressFormController: require('./address-form'),
  CaptchaController: require('./captcha'),
  LegislatorPickerController: require('./legislator-picker'),
  MessageFormController: require('./message-form'),
  SendMessageController: require('./send-message'),
  ThanksController: require('./thanks')
};
