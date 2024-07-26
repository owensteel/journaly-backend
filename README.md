The Typescript + Node.js backend for my sample resume application, "Journaly". This backend application is hosted remotely at https://journaly-api.ow.st, which is made use of by the [Web frontend](https://github.com/owensteel/journaly-react-frontend) hosted at https://journaly.ow.st and the [Android frontend](https://github.com/owensteel/journaly-backend).

* **Database querying**: [Sequelize](https://www.npmjs.com/package/sequelize) ORM library to interact with the MySQL database
* **Tests**: [Jest](https://www.npmjs.com/package/jest)

Other libraries: OAuth for verifying Google login tokens, and a W3C standard Push Notifications subscription and scheduling system implemented with [web-push](https://www.npmjs.com/package/web-push).
