const app = require('./app.js');
const { port } = require('./config.js');

app.listen(port, () => console.log(`Server is running on port ${port} - API docs at /api-docs`));
