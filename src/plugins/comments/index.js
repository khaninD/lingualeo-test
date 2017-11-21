require('./main.scss');
import {buildElem} from '../../../src/js/utils/index';
const commentsWrapperClassName = 'comments-wrapper';
const commentsContainerClassName = 'comments-container';
const messageElemContainerClassName = 'messageElemContainer';
const timeContainerClassName = 'timeContainer';
const errorContainerClassName = 'errorContainer';
const messageElemClassName = 'messageElem';
const sendButtonValue = 'Отправить';
const resetButtonValue = 'Очистить форму';
const errorContainerText = 'Форма невалидна';
const userNameAnswerText = 'Ваше имя: ';
const textAreaInfoText = 'Введите ваше сообщение: ';

export default class CommentsPlugin {
    constructor(name, parent = document.body) {
      this.name = name;
      this.parent = parent;
      this._init();
    }

    _init() {
      // создать подключение
      const socket = new WebSocket("ws://localhost:8081");
      socket.binaryType = "arraybuffer";
      const wrapper = buildElem('div', {
        class: commentsWrapperClassName
      });
      const form = buildElem('form', {
        name: this.name
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

      const createUserInfoContainer = () => {
        const wrapper = buildElem('div');
        const p = buildElem('p', {}, userNameAnswerText);
        const userNameInput = buildElem('input', {
          type: 'text',
          name: 'userName',
          required: true
        });
        wrapper.appendChild(p);
        wrapper.appendChild(userNameInput);
        return wrapper;
      };

      const createTextAreaContainer = () => {
        const wrapper = buildElem('div');
        const p = buildElem('p', {}, textAreaInfoText);
        const textArea = buildElem('textarea', {
          name: 'message',
          rows: 10,
          cols: 45,
          required: true
        });
        wrapper.appendChild(p);
        wrapper.appendChild(textArea);
        return wrapper;
      };
      // handlers
      form.onsubmit = () => {
        const formName = this.name;
        const {userName, message} = document.forms[formName];
        const userNameValue = userName.value;
        const outgoingMessage = message.value;
        const dataMessage = JSON.stringify([userNameValue, outgoingMessage]);
        // validation
        if(this._validation(outgoingMessage)) {
          // скрываем ошибку валидации
          this._hiddenInvalidState();
          socket.send(dataMessage);
          message.value = '';
        } else {
          this._showInvalidState();
        }
        return false;
      };

      // обработчик входящих сообщений
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const [message, userName, time] = data;
          this.renderComment(message, userName, time);
        } catch(e) {
          console.log(e);
        }
      };

      form.appendChild(createUserInfoContainer());
      form.appendChild(createTextAreaContainer());
      form.appendChild(sendButton);
      form.appendChild(resetButton);
      wrapper.appendChild(form);
      wrapper.appendChild(this.errorContainer);
      this.parent.appendChild(commentsContainer);
      this.parent.appendChild(wrapper);
    }

    renderComment(message, userName, time) {
      const messageElemContainer = buildElem('div', {
        class: messageElemContainerClassName
      });
      const messageElem = buildElem('span', {
        class: messageElemClassName
      }, message);

      const timerContainer = buildElem('span', {
        class: timeContainerClassName
      }, time + ' ' + userName);
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
  }
