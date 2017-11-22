require('./main.scss');
import {buildElem} from '../../../src/js/utils/index';
// @TODO модификаторы должнв передаваться параметром в компонент
// form block - className
const commentBlockClassName = 'form';
const userInfoClassName = 'form__user-info';
const labelClassName = 'form__input-label';
const inputElemClassName = 'form__input';
const textAreaClassName = 'form__textarea';
const commentsContainerClassName = 'comments-container';
const messageElemContainerClassName = 'message';
const timeContainerClassName = 'timeContainer';
const errorContainerClassName = 'errorContainer';
const sendButtonClassName = 'form__send-button';
const resetButtonClassName = 'form__reset-button';
const legendText = 'Форма отправки комментария';
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
    constructor(name, options = {}, parent = document.body) {
      this.name = name;
      this.mod = options.mod;
      this.parent = parent;
      // обьект для работы с данными, по сути здесь без него можно обойтись, но если потребуется реализация
      // функций: редактирование комментария, комментирование другого автора, то без него никак
      // также здесь реализовано хранилище через localStorage
      this.storage = new class Storage {
        constructor() {
          this.data = this.getData() || {
            items: []
          };
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


        addData(item) {
          this.data && this.data.items && this.data.items.push(item);
          this.save();
        }

      };
      this._init();
    }

    _init() {
       // создать подключение
      const socket = new WebSocket("ws://localhost:8081");
      const wrapper = buildElem('div', {
        className: this.mod.form ? `${commentBlockClassName} ${this.mod.form}` : commentBlockClassName
      });
      const form = buildElem('form', {
        name: this.name
      });

      const sendButton = buildElem('button', {
        type: 'submit',
        className: sendButtonClassName
      }, sendButtonValue);
      const resetButton = buildElem('button', {
        type: 'reset',
        className: resetButtonClassName
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

      const createFieldSet = () => {
        const fieldSet = buildElem('fieldSet');
        const legend = buildElem('legend', {}, legendText);
        fieldSet.appendChild(legend);
        return fieldSet;
      };
      // @TODO DRY
      const createUserInfoContainer = () => {
        const wrapper = buildElem('div', {
          className: userInfoClassName
        });
        const label = buildElem('label');
        const p = buildElem('p', {
          className: labelClassName
        }, userNameAnswerText);
        const userNameInput = buildElem('input', {
          type: 'text',
          name: 'userName',
          required: true,
          calssName: inputElemClassName
        });
        wrapper.appendChild(label);
        label.appendChild(p);
        label.appendChild(userNameInput);
        return wrapper;
      };
      // @TODO DRY
      const createTextAreaContainer = () => {
        const wrapper = buildElem('div');
        const label = buildElem('label');
        const p = buildElem('p', {
          className: labelClassName
        }, textAreaInfoText);
        const textArea = buildElem('textarea', {
          name: 'message',
          rows: 10,
          cols: 45,
          required: true,
          className: textAreaClassName
        });
        wrapper.appendChild(label);
        label.appendChild(p);
        label.appendChild(textArea);
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
          this.storage && this.storage.addData(data);
          this.renderComment(data);
        } catch(e) {
          //@TODO вывести текст ошибки и информации о неудачном парсинге
          console.log(e);
        }
      };
      const fieldSet = createFieldSet();
      fieldSet.appendChild(createUserInfoContainer());
      fieldSet.appendChild(createTextAreaContainer());
      fieldSet.appendChild(sendButton);
      fieldSet.appendChild(resetButton);
      form.appendChild(fieldSet);
      wrapper.appendChild(form);
      wrapper.appendChild(this.errorContainer);
      this.parent.appendChild(commentsContainer);
      this.parent.appendChild(wrapper);

      //render
      if (this.storage && this.storage.data && this.storage.data.items) {
        this.storage.data.items.forEach((item, index) => {
          this.renderComment(item, index);
        })
      }
    }

    renderComment({userNameValue, outgoingMessage, time} = data) {
      const message = buildElem('div', {
        className: this.mod.messageBlock ? `${messageClassName} comments-container__message ${this.mod.messageBlock}` : `${messageClassName} comments-container__message `
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
