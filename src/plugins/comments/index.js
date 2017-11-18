require('./main.scss');
import {buildElem, correctTime} from '../../../src/js/utils/index';
const commentsWrapperClassName = 'comments-wrapper';
const commentsContainerClassName = 'comments-container';
const messageElemContainerClassName = 'messageElemContainer';
const timeContainerClassName = 'timeContainer';
const errorContainerClassName = 'errorContainer';
const messageElemClassName = 'messageElem';
const sendButtonValue = 'Отправить';
const resetButtonValue = 'Очистить форму';
const errorContainerText = 'Форма невалидна';

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

      const commentsContainer = buildElem('div', {
        class: commentsContainerClassName
      });

      this.errorContainer = buildElem('span', {
        class: errorContainerClassName,
        style: 'display:none'
      }, errorContainerText);

      // делаем доступным другим методам класса
      this.commentsContainer = commentsContainer;

      // handlers
      form.onsubmit = () => {
        const outgoingMessage = textArea.value;
        // validation
        if(this._validation(outgoingMessage)) {
          // скрываем ошибку валидации
          this._hiddenInvalidState();
          socket.send(outgoingMessage);
        } else {
          this._showInvalidState();
        }
        return false;
      };

      // обработчик входящих сообщений
      socket.onmessage = (event) => {
        const incomingMessage = event.data;
        this.renderComment(incomingMessage);
      };

      form.appendChild(textArea);
      form.appendChild(sendButton);
      wrapper.appendChild(form);
      wrapper.appendChild(this.errorContainer);
      this.parent.appendChild(wrapper);
      this.parent.appendChild(commentsContainer);
      // показать сообщение в div#subscribe
      function showMessage(message) {
        const messageElem = document.createElement('div');
        messageElem.appendChild(document.createTextNode(message));
        document.getElementById('subscribe').appendChild(messageElem);
      }
    }

    renderComment(message) {
      const messageElemContainer = buildElem('div', {
        class: messageElemContainerClassName
      });
      const messageElem = buildElem('span', {
        class: messageElemClassName
      }, message);

      const time = this._createTimeString();
      const timerContainer = buildElem('span', {
        class: timeContainerClassName
      }, time);
      messageElemContainer.appendChild(messageElem);
      messageElemContainer.appendChild(timerContainer);
      this.commentsContainer.appendChild(messageElemContainer);
    }

    _validation(text) {
      return !!text;
    }

    _showInvalidState() {
      this.errorContainer.style.display = '';
    }

    _hiddenInvalidState() {
      this.errorContainer.style.display = 'none';
    }

    _createTimeString() {
      const date = new Date();
      const minutes = correctTime(date.getMinutes());
      const hour = date.getHours();
      return `${hour}:${minutes}`;
    }
  }
