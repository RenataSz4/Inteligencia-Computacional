const app = require('./api');
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});