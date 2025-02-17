# Spotify Player plugin для OBS

Для начала делаем git clone репозитория, а конкретно `git clone https://github.com/SaXaReD/Spotify-Player-for-Stream.git`

Потом запускаем `npm install`

## Как использовать

### `npm start`

Запуск проигрывателя в локальной сети в режиме разработчика
Автоматически открывается `http://localhost:3000` и там появится форма регистрации в Spotify (она требует Client ID и Client secret, по этому нужно зарегистрировать свое приложение).

## Создаем приложение spotify

Заходим на сайт [Spotify Developer](https://developer.spotify.com/)
Переходим в Dashboard и создаем новое приложение через Create app, там будет:
* App name (Свое название приложения)
* App description (Свое описание приложения)
* Redirect URIs, в нем указываем свой локальный хост (обычно это `http://localhost:3000` но цифры порта могут отличаться, если он занят другим приложением)
* Дальше указываем где планируем использовать, это Web API.

Ставите галочку с согласием и сохраняете, после этого у вас появляется свое приложение

## Подключаем Spotify к приложению

Заходим в свое приложение и нажимаем settings

Там мы увидим свой Client ID и снизу будет кнопка, после нажатия которой видим и Client secret, копируем их и вставляем в поля проигрывателя.

Дальше будет авторизация Spotify и после того, как вы ее завершите, проигрыватель готов и будет отображать проигрываемый трек.

## Подключение к OBS

Тут все достаточно просто:

* Добавляем в Источнике Браузер
* В нем указываем URL-адрес (Это наш `http://localhost:3000`) пока сохраняем
* Появляется поле регистрации, Нажимаем "Взаимодействовать"
* Вписываем наши Client ID и Client secret в соответствующие поля и жмем Login to Spotify
* Нас перебрасывает на страничку spotify, авторизируемся и автоматически вернется к нашему приложению
* После этого заходим еще раз в настройки браузера и выставляем Ширину - 432 и Высоту 152

Если проигрыватель не появляется, просто обновите ссылку в настройках и все появится.

Насчет звука, приложение только показывает что в данный момент у вас играет, так что привязывайте отдельной звуковой дорожкой со самого приложения Spotify

Для случаев, когда нужно выйти из профиля, я сделал центральный текст кнопкой выхода и вас заново отправит на регистрацию.
