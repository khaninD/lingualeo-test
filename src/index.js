import './styles/main.scss';
import CommentsPlugin from './plugins/comments/index';
const commentsPlugin = new CommentsPlugin('firstComment', {
  mod: {
    form: 'form_size-s',
    messageBlock: 'message_small message_type-green'
  }
}, firstMessageBox);

const commentsPlugin2 = new CommentsPlugin('firstComment2', {
  mod: {
    form: 'form_size-s',
    messageBlock: 'message_small message_type-green'
  }
}, secondMessageBox);