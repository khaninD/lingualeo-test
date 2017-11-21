require('./main.scss');
import {buildElem} from '../../../src/js/utils/index';
const commentsWrapperClassName = 'comments-wrapper';
const commentsContainerClassName = 'comments-container';
const messageElemContainerClassName = 'message';
const timeContainerClassName = 'timeContainer';
const errorContainerClassName = 'errorContainer';
// messsage block - className
const messageClassName = 'message';
// message elements - ClassNames
const messageContainerClassName = 'message__container';
const messageInnerClassName = 'message__inner';
const messageInfoClassName = 'message__info';
const messageInfoDateClassName = 'message__info-date';
const messageInfoNameClassName = 'message__info-name';
const messageTextClassName = 'message__text';

const sendButtonValue = 'Отправить';
const resetButtonValue = 'Очистить форму';
const errorContainerText = 'Форма невалидна';
const userNameAnswerText = 'Ваше имя: ';
const textAreaInfoText = 'Введите ваше сообщение: ';


export default class CommentsPlugin {
    constructor(name, parent = document.body) {
      this.name = name;
      this.parent = parent;
      // обьект для работы с данными, по сути здесь без него можно обойтись, но если потребуется реализация
      // функций: редактирование комментария, комментирование другого автора, то без него никак
      // также здесь реализовано хранилище через localStorage
      this.storage = new class Storage {
        constructor() {
          this.data = this.getData() || {
            items: [],
            key: this.setKey() || 0
          };
        }

        setKey() {
          if (localStorage) {
            try {
              return JSON.parse(localStorage.getItem(name)).key;
            } catch(e) {
              console.info('Данные невалидны или же их не удалось найти');
              return false;
            }
          } else {
            console.info('localStorage не поддерживается, данные невозможно сохранить')
          }
        }

        getData() {
          try {
            return localStorage && JSON.parse(localStorage.getItem(name));
          } catch(e) {
            console.warn('Not data found');
            return false;
          }
        }

        save() {
          if (localStorage) {
            localStorage.setItem(name, JSON.stringify(this.data))
          } else {
            console.log('localStorage не поддерживается, данные сохранить не удалось')
          }
        }

        /**
         * Метод создания уникального ключа для элемента
         */
        createKey() {
          if (this.data && this.data.key) {
            this.data.key += 1;
          } else {
            consol.warn('Ошибка в структуре данных, не удается получить доступ к key')
          }
        }

        addData(item) {
          this.data && this.data.items && this.data.items.push(item);
          this.save();
        }

        updateItem(index, text, date) {
          const item = this.data.items[index];
          item.text = text;
          item.date = date;
        }
      };
      this._init();
    }

    _init() {
       // создать подключение
      const socket = new WebSocket("ws://localhost:8081");
      const wrapper = buildElem('div', {
        className: commentsWrapperClassName
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
        className: commentsContainerClassName
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
        // validation
        if(this._validation(outgoingMessage)) {
          // скрываем ошибку валидации
          this._hiddenInvalidState();
          // подготавливаем данные для отправки
          const dataMessage = JSON.stringify({
            userNameValue,
            outgoingMessage
          });
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
          this.renderComment(data);
        } catch(e) {
          //@TODO вывести текст ошибки и информации о неудачном парсинге
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

    renderComment({userNameValue, outgoingMessage, time} = data) {
      const message = buildElem('div', {
        className: `${messageClassName} message_small comments-container__message`
      });
      const container = buildElem('div', {
        className: messageContainerClassName
      });

      const inner = buildElem('div', {
        className: messageInnerClassName
      });

      const info = buildElem('div', {
        className: messageInfoClassName
      });

      const infoName = buildElem('span', {
        className: messageInfoNameClassName
      }, userNameValue);

      const infoTime = buildElem('span', {
        className: messageInfoDateClassName
      }, time);

      const text = buildElem('div', {
        className: messageTextClassName
      }, outgoingMessage);

      message.appendChild(container);
      container.appendChild(inner);
      inner.appendChild(info);
      inner.appendChild(text);
      info.appendChild(infoName);
      info.appendChild(infoTime);
      this.commentsContainer.appendChild(message);
    }

    _validation(text) {
      // Здесь логика валидации
      return !!text;
    }

    _showInvalidState() {
      this.errorContainer.style.display = '';
    }

    _hiddenInvalidState() {
      this.errorContainer.style.display = 'none';
    }
  }
