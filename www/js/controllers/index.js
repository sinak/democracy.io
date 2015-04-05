// TODO(leah): Could just use require-dir to figure this stuff out.

module.exports = {
  SendMessageController: require('./send-message'),
  AboutController: require('./about'),
  HomeController: require('./home'),
  MessageFormController: require('./message_form'),
  LegislatorPickerController: require('./legislator_picker'),
  ThanksController: require('./thanks')
};
