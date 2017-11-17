require('./main.scss');
import {buildElem} from '../../../src/js/utils/index';
const commentsWrapperClassName = 'comments-wrapper';
const sendButtonValue = 'Отправить';
const resetButtonValue = 'Очистить форму';

export default class CommentsPlugin {
    constructor(name, parent = document.body) {
      this.name = name;
      this.parent = parent;
      this._init();
    }

    _init() {
      // создать подключение
      const socket = new WebSocket("ws://localhost:8081");
      const wrapper = buildElem('div', {
        class: commentsWrapperClassName
      });
      const form = buildElem('form', {
        name: this.name
      });

      const textArea = buildElem('textarea', {
        name: 'message'
      });
      const sendButton = buildElem('button', {
        type: 'submit'
      }, sendButtonValue);
      const resetButton = buildElem('button', {
        type: 'reset'
      }, resetButtonValue);

      // handlers
      form.onsubmit = () => {
        const outgoingMessage = textArea.value;
        socket.send(outgoingMessage);
        return false;
      };

      // обработчик входящих сообщений
      socket.onmessage = function(event) {
        const incomingMessage = event.data;
        showMessage(incomingMessage);
      };

      form.appendChild(textArea);
      form.appendChild(sendButton);
      wrapper.appendChild(form);
      this.parent.appendChild(wrapper);

      // показать сообщение в div#subscribe
      function showMessage(message) {
        const messageElem = document.createElement('div');
        messageElem.appendChild(document.createTextNode(message));
        document.getElementById('subscribe').appendChild(messageElem);
      }
    }
  }
