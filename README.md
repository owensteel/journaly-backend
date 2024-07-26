The Typescript + Node.js + Express backend for my sample resume application, "Journaly". This backend application is hosted remotely at https://journaly-api.ow.st.

It is a RESTful HTTP API, designed to be available for use by both of Journaly's frontends: [Web frontend](https://github.com/owensteel/journaly-react-frontend) (hosted at https://journaly.ow.st) and the [Android frontend](https://github.com/owensteel/journaly-backend).

* **Server**: Express for routing and hosting
* **Database querying**: [Sequelize](https://www.npmjs.com/package/sequelize) ORM library to interact with the MySQL database
* **Tests**: [Jest](https://www.npmjs.com/package/jest)

Other libraries: OAuth for verifying Google login tokens, and a W3C standard Push Notifications subscription and scheduling system implemented with [web-push](https://www.npmjs.com/package/web-push).
